// Prompts for the offline AI script. The model gets the transcript PLUS the
// canonical claims/conflicts/sources from data/seed so that its output points at
// IDs that already exist (agreed approach: #6 owns claims/decisions/conflicts,
// #4 owns summaries, action items and confusions that reference them).

import type { MeetingContext } from "./seed";

export const SYSTEM_PROMPT = `You are the analysis engine behind "Meeting Source Tracer", a tool for product managers that summarizes cross-team meetings and catches conflict between teams.

Rules:
- Use ONLY the meeting data you are given. Never invent facts, people, numbers, or IDs.
- Wherever an ID is required, copy it exactly from the lists provided. If nothing fits, use null (or an empty array). Do not make IDs up.
- Write for a busy product manager: plain language, one sentence per point, no jargon beyond what the teams used.
- Respond with a single JSON object and nothing else: no prose, no markdown, no code fences.`;

const OUTPUT_SPEC = `Return a JSON object with exactly these keys:

{
  "summaryPoints": [
    { "text": string, "claimId": string | null, "segmentIds": string[] }
  ],
  "actionItems": [
    { "text": string, "ownerId": string | null, "team": string | null }
  ],
  "confusions": [
    { "text": string, "term": string | null, "segmentId": string | null }
  ],
  "conflictIds": string[],
  "conflictCandidates": [
    {
      "title": string,
      "teamA": string, "teamB": string,
      "claimAText": string, "claimBText": string,
      "explanation": string,
      "confidence": number,
      "suggestedQuestions": string[],
      "segmentIds": string[]
    }
  ],
  "unsourcedClaims": [
    { "text": string, "team": string | null, "kind": "decision" | "number" | "commitment" | "statement", "segmentIds": string[], "reason": string }
  ],
  "docContradictions": [
    { "claimId": string | null, "claimText": string, "sourceId": string, "explanation": string }
  ]
}

Field guidance:
- summaryPoints: 3 to 8 points covering what was said and decided. Each point restates ONE known claim (set claimId to that claim's id) and lists the transcript segment ids it came from. Cover every known claim at least once. Only use claimId null for an important point that matches no known claim.
- actionItems: concrete follow-ups stated or clearly implied in the meeting. ownerId must be an attendee's person id, or null if no owner is clear. team must be a team id or null.
- confusions: terms that different teams appear to use differently (e.g. one team's meaning of a word versus another's). "text" explains the mismatch in one or two sentences, "term" is the word or phrase, "segmentId" is where it first came up.
- conflictIds: ids from "Known conflicts" that this meeting provides evidence for.
- conflictCandidates: contradictions between two different teams that are NOT already covered by a known conflict. Use team ids for teamA/teamB, a confidence between 0 and 1, and 2 to 3 follow-up questions the PM could ask. Empty array if there are none.
- unsourcedClaims: statements of fact, numbers, or commitments made in the meeting that are not backed by anything in the transcript itself, the known claims' sources, or the Slack/doc sources provided. Empty array if there are none.
- docContradictions: claims (known or newly spotted) that contradict the excerpt of a provided source (doc or Slack). Set claimId to the known claim's id if it is one, otherwise null. Empty array if there are none.
- Use empty arrays, not omitted keys, when a section has nothing.`;

function mmss(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function buildUserPrompt(ctx: MeetingContext): string {
  const { meeting, feature } = ctx;
  const nameOf = (id: string) => ctx.attendees.find((p) => p.id === id)?.name ?? id;

  const attendees = ctx.attendees
    .map((p) => `- ${p.id}: ${p.name}, ${p.role} (team: ${p.team})`)
    .join("\n");

  const transcript = ctx.transcript
    .map((s) => `[${s.id}] ${mmss(s.startSec)} ${nameOf(s.speakerId)} (${s.team}): ${s.text}`)
    .join("\n");

  const claims = ctx.claims.length
    ? ctx.claims
        .map((c) => {
          const src = c.sourceIds.length ? c.sourceIds.join(", ") : "NONE";
          const contra = c.contradictsSourceId ? `; contradicts ${c.contradictsSourceId}` : "";
          return `- ${c.id} [${c.team ?? "n/a"}, ${c.kind}] ${c.text} (sources: ${src}${contra})`;
        })
        .join("\n")
    : "(none)";

  const conflicts = ctx.conflicts.length
    ? ctx.conflicts
        .map(
          (x) =>
            `- ${x.id}: ${x.title} (${x.teamA} vs ${x.teamB}; claims ${x.claimAId} / ${x.claimBId}). ${x.explanation}`,
        )
        .join("\n")
    : "(none)";

  const sources = ctx.sources.length
    ? ctx.sources
        .map((s) => {
          const ver = s.version && !s.title.includes(s.version) ? ` ${s.version}` : "";
          return `- ${s.id} [${s.type}${s.team ? `, ${s.team}` : ""}, ${s.date.slice(0, 10)}] ${s.title}${ver}: "${s.excerpt}"`;
        })
        .join("\n")
    : "(none)";

  return `Meeting: ${meeting.title} (${meeting.id}), ${meeting.date.slice(0, 10)}, ${meeting.durationMin} min
Feature: ${feature ? `${feature.name} (${feature.id}): ${feature.description}` : "none"}
Valid team ids: ${ctx.teamIds.join(", ")}

Attendees:
${attendees || "(none)"}

Transcript (segment id, time, speaker, team):
${transcript}

Known claims for this meeting (canonical; reference these by id):
${claims}

Known conflicts for this feature (canonical; reference these by id):
${conflicts}

Sources available as context: Slack threads, docs, and transcript moments (use these to judge whether a claim is backed up or contradicted):
${sources}

${OUTPUT_SPEC}`;
}

// Sent as a follow-up turn when the first answer fails validation.
export function buildRetryPrompt(errors: string[]): string {
  return `Your previous answer had problems:
${errors.map((e) => `- ${e}`).join("\n")}

Reply again with the corrected JSON object only (same keys, no prose, no code fences). Use only ids from the lists in the original message.`;
}
