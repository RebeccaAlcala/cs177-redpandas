// Live transcript analysis: send a raw meeting transcript to Claude and get back
// a summary, action items, detected cross-team conflicts, and unsourced-claim
// flags. Unlike lib/ai/generate.ts (which maps onto existing seed claims), this
// works on an arbitrary transcript with no pre-existing data.
//
// Uses plain fetch against the Messages API, mirroring lib/ai/generate.ts.

import type { LiveAnalysis, PriorMeetingContext } from "./analysis-types";

const DEFAULT_MODEL = "claude-sonnet-5-5";

const SYSTEM_PROMPT = `You analyze meeting transcripts for product managers.
From a raw transcript you extract:
- summaryPoints: the key decisions, numbers, and commitments, as short plain sentences.
- actionItems: concrete follow-ups, each with the owner's name if one is stated.
- conflicts: places where two people or teams disagree or define the same term
  differently. Give a short title, the two sides (teamA/teamB as names or teams),
  a one-sentence explanation, and a short quote from each side when available.
  Also give a "significance" from 0.0 to 1.0 for how confident you are this is a
  real, substantive cross-team conflict: 1.0 = an explicit, direct contradiction
  on a concrete point (a number, a policy, a commitment); ~0.5 = a soft or possible
  disagreement; below 0.4 = likely just different emphasis or wording rather than a
  true conflict. Use the full range so a reader can filter by it.
- unsourcedClaims: statements asserted as fact with no evidence, source, data, or
  document behind them. Say briefly why it is unsupported.
- confusions: terms or points left ambiguous or that different people seem to
  mean differently.

You may also be given PRIOR MEETINGS as context. When you are, detect conflicts
BOTH within the new transcript AND between the new transcript and those prior
meetings. When a conflict is between the new meeting and an earlier one, set
"sourceMeeting" to that prior meeting's EXACT title, put the NEW statement in
quoteA and the EARLIER statement in quoteB, and name the sides in teamA/teamB.
Only use a title that actually appears in the prior meetings, and only when there
is a genuine contradiction. For conflicts contained within the new transcript,
leave "sourceMeeting" out.

Only report conflicts and unsourced claims that are genuinely present. If a
category has nothing, return an empty array for it. Do not invent content that is
not supported by the transcript or the prior meetings.

Respond with ONLY a JSON object, no prose and no code fences, in exactly this shape:
{
  "summaryPoints": ["..."],
  "actionItems": [{ "text": "...", "owner": "optional name" }],
  "conflicts": [{ "title": "...", "teamA": "...", "teamB": "...", "explanation": "...", "quoteA": "...", "quoteB": "...", "significance": 0.0, "sourceMeeting": "optional exact prior meeting title" }],
  "unsourcedClaims": [{ "text": "...", "why": "..." }],
  "confusions": [{ "text": "...", "term": "optional term" }]
}`;

// Build a compact context block from prior meetings. Transcripts are truncated
// so the prompt stays within budget even with several meetings.
function buildPriorBlock(prior: PriorMeetingContext[]): string {
  if (prior.length === 0) return "";
  const blocks = prior.slice(0, 8).map((m) => {
    const points = m.summaryPoints.length
      ? m.summaryPoints.map((p) => `- ${p}`).join("\n")
      : "- (no summary)";
    const excerpt = (m.transcript ?? "").trim().slice(0, 1200);
    const transcriptPart = excerpt ? `\nTranscript excerpt:\n"""\n${excerpt}\n"""` : "";
    return `### ${m.title}\nSummary:\n${points}${transcriptPart}`;
  });
  return `PRIOR MEETINGS (earlier context — use these to catch contradictions with the new meeting):\n\n${blocks.join("\n\n")}\n\n`;
}

function buildUserPrompt(transcript: string, title: string, prior: PriorMeetingContext[]): string {
  return `${buildPriorBlock(prior)}NEW MEETING\nMeeting title: ${title || "Untitled meeting"}\n\nTranscript:\n"""\n${transcript.trim()}\n"""\n\nReturn the JSON object now.`;
}

// Tolerate a stray code fence or sentence around the JSON.
function parseJson(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, "");
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("The model did not return a JSON object.");
  }
  return JSON.parse(unfenced.slice(start, end + 1));
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function optStr(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

// Clamp a model-provided number to 0..1; fall back when missing/malformed.
function num01(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}

// Coerce the model's object into LiveAnalysis, dropping anything malformed so a
// bad field can never crash the page.
function coerce(raw: unknown): LiveAnalysis {
  const o = (raw ?? {}) as Record<string, unknown>;
  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
  return {
    summaryPoints: asStringArray(o.summaryPoints),
    actionItems: arr(o.actionItems)
      .map((a) => {
        const it = (a ?? {}) as Record<string, unknown>;
        return { text: str(it.text), owner: optStr(it.owner) };
      })
      .filter((a) => a.text.trim().length > 0),
    conflicts: arr(o.conflicts)
      .map((c) => {
        const it = (c ?? {}) as Record<string, unknown>;
        return {
          title: str(it.title),
          teamA: optStr(it.teamA),
          teamB: optStr(it.teamB),
          explanation: str(it.explanation),
          quoteA: optStr(it.quoteA),
          quoteB: optStr(it.quoteB),
          significance: num01(it.significance, 0.7),
          sourceMeeting: optStr(it.sourceMeeting),
        };
      })
      .filter((c) => c.title.trim().length > 0),
    unsourcedClaims: arr(o.unsourcedClaims)
      .map((u) => {
        const it = (u ?? {}) as Record<string, unknown>;
        return { text: str(it.text), why: str(it.why) };
      })
      .filter((u) => u.text.trim().length > 0),
    confusions: arr(o.confusions)
      .map((c) => {
        const it = (c ?? {}) as Record<string, unknown>;
        return { text: str(it.text), term: optStr(it.term) };
      })
      .filter((c) => c.text.trim().length > 0),
  };
}

export async function analyzeTranscript(
  transcript: string,
  title: string,
  apiKey: string,
  prior: PriorMeetingContext[] = [],
): Promise<LiveAnalysis> {
  const base = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const res = await fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(transcript, title, prior) }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");

  return coerce(parseJson(text));
}
