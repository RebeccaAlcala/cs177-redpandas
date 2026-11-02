// Offline generation: build the prompt, call Claude over plain fetch (no SDK
// dependency), validate, retry once, then split the answer into
//   data/ai-cache/<meetingId>.json            (exactly the MeetingSummary shape; the website reads this)
//   data/ai-cache/<meetingId>.candidates.json (extras for #6/the team to review: new conflict
//                                              candidates, unsourced claims, doc contradictions)
// Only the first file is read by lib/data.ts, so the extras can't break any page.

import fs from "fs";
import path from "path";
import type { MeetingSummary, ActionItem } from "../types";
import { CACHE_DIR, buildContext, type Seed } from "./seed";
import { SYSTEM_PROMPT, buildUserPrompt, buildRetryPrompt } from "./prompts";
import { validateModelOutput, validateSummary, type ModelOutput } from "./validate";

export const DEFAULT_MODEL = "claude-sonnet-5-5";

export interface Candidates {
  meetingId: string;
  model: string;
  generatedAt: string;
  // Summary points the model could not tie to an existing claim. #6 can add a
  // claim for them in data/seed/claims.json, then they can be added to the summary.
  unmatchedPoints: ModelOutput["summaryPoints"];
  conflictCandidates: ModelOutput["conflictCandidates"];
  unsourcedClaims: ModelOutput["unsourcedClaims"];
  docContradictions: ModelOutput["docContradictions"];
}

type Message = { role: "user" | "assistant"; content: string };

async function callClaude(
  messages: Message[],
  opts: { apiKey: string; model: string },
): Promise<string> {
  const base = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
  const body = JSON.stringify({
    model: opts.model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages,
  });

  // Retry transient failures (rate limit / overloaded / 5xx) a couple of times.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });
    if (res.ok) {
      const data = (await res.json()) as { content: { type: string; text?: string }[] };
      return data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("");
    }
    const transient = res.status === 429 || res.status >= 500;
    if (transient && attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
}

// Models sometimes wrap JSON in a code fence or add a sentence despite instructions.
function parseJson(text: string): { value?: unknown; error?: string } {
  const unfenced = text.replace(/```(?:json)?/gi, "");
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) return { error: "Response contained no JSON object." };
  try {
    return { value: JSON.parse(unfenced.slice(start, end + 1)) };
  } catch (err) {
    return { error: `Response was not valid JSON: ${(err as Error).message}` };
  }
}

export async function generateForMeeting(
  seed: Seed,
  meetingId: string,
  opts: { apiKey: string; model: string; log?: (msg: string) => void },
): Promise<{ summary: MeetingSummary; candidates: Candidates }> {
  const log = opts.log ?? (() => {});
  const ctx = buildContext(seed, meetingId);
  const messages: Message[] = [{ role: "user", content: buildUserPrompt(ctx) }];

  let output: ModelOutput | undefined;
  for (let attempt = 0; attempt < 2 && !output; attempt++) {
    const text = await callClaude(messages, opts);
    const parsed = parseJson(text);
    const errors = parsed.error
      ? [parsed.error]
      : validateModelOutput(parsed.value, ctx).errors;

    if (errors.length === 0) {
      output = validateModelOutput(parsed.value, ctx).value;
    } else if (attempt === 0) {
      log(`  first answer invalid (${errors.length} problem(s)); retrying once`);
      messages.push({ role: "assistant", content: text }, { role: "user", content: buildRetryPrompt(errors) });
    } else {
      throw new Error(`Model output still invalid after retry:\n  - ${errors.join("\n  - ")}`);
    }
  }
  if (!output) throw new Error("No usable model output."); // unreachable, keeps TS happy

  // A summary point is only as sourced as the claim it restates (#6 owns that
  // mapping), so sourceIds are copied from the claim rather than trusted from the model.
  const claims = new Map(ctx.claims.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const summaryPoints: MeetingSummary["summaryPoints"] = [];
  const unmatchedPoints: ModelOutput["summaryPoints"] = [];
  for (const p of output.summaryPoints) {
    const claim = p.claimId ? claims.get(p.claimId) : undefined;
    if (!claim || seen.has(claim.id)) {
      if (!claim) unmatchedPoints.push(p);
      continue;
    }
    seen.add(claim.id);
    summaryPoints.push({ text: p.text, claimId: claim.id, sourceIds: [...claim.sourceIds] });
  }

  const actionItems: ActionItem[] = output.actionItems.map((a, i) => ({
    id: `ai_${meetingId}_${String(i + 1).padStart(2, "0")}`,
    meetingId,
    text: a.text,
    ...(a.ownerId ? { ownerId: a.ownerId } : {}),
    ...(a.team ? { team: a.team } : {}),
  }));

  const summary: MeetingSummary = {
    meetingId,
    summaryPoints,
    actionItems,
    confusions: output.confusions.map((c) => ({
      text: c.text,
      ...(c.term ? { term: c.term } : {}),
      ...(c.segmentId ? { segmentId: c.segmentId } : {}),
    })),
    conflictIds: [...new Set(output.conflictIds)],
  };

  // Final safety net against the whole seed, same check as `--validate`.
  const { errors } = validateSummary(summary, seed, meetingId);
  if (errors.length) throw new Error(`Assembled summary failed validation:\n  - ${errors.join("\n  - ")}`);

  return {
    summary,
    candidates: {
      meetingId,
      model: opts.model,
      generatedAt: new Date().toISOString(),
      unmatchedPoints,
      conflictCandidates: output.conflictCandidates,
      unsourcedClaims: output.unsourcedClaims,
      docContradictions: output.docContradictions,
    },
  };
}

// Atomic write (temp file + rename), same habit as the rest of the repo's data code.
function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  fs.renameSync(tmp, file);
}

export const summaryPath = (meetingId: string) => path.join(CACHE_DIR, `${meetingId}.json`);
export const candidatesPath = (meetingId: string) => path.join(CACHE_DIR, `${meetingId}.candidates.json`);

export function writeOutputs(summary: MeetingSummary, candidates: Candidates): void {
  writeJson(summaryPath(summary.meetingId), summary);
  writeJson(candidatesPath(summary.meetingId), candidates);
}
