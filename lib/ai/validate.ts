// Hand-written validation (no zod: CLAUDE.md says no new dependencies without
// asking). Two checkers:
//   validateModelOutput: the raw JSON Claude returned, before we trust it
//   validateSummary:     a finished data/ai-cache/<id>.json against the seed
//                        (Phase 3: "no summary point has an invalid claimId or sourceId")

import type { TeamId, Claim } from "../types";
import type { MeetingContext, Seed } from "./seed";

const CLAIM_KINDS: Claim["kind"][] = ["decision", "number", "commitment", "statement"];

export interface ModelOutput {
  summaryPoints: { text: string; claimId: string | null; segmentIds: string[] }[];
  actionItems: { text: string; ownerId: string | null; team: TeamId | null }[];
  confusions: { text: string; term: string | null; segmentId: string | null }[];
  conflictIds: string[];
  conflictCandidates: {
    title: string;
    teamA: TeamId;
    teamB: TeamId;
    claimAText: string;
    claimBText: string;
    explanation: string;
    confidence: number;
    suggestedQuestions: string[];
    segmentIds: string[];
  }[];
  unsourcedClaims: {
    text: string;
    team: TeamId | null;
    kind: Claim["kind"];
    segmentIds: string[];
    reason: string;
  }[];
  docContradictions: {
    claimId: string | null;
    claimText: string;
    sourceId: string;
    explanation: string;
  }[];
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

export function validateModelOutput(
  raw: unknown,
  ctx: MeetingContext,
): { errors: string[]; value?: ModelOutput } {
  if (!isObj(raw)) return { errors: ["Top level must be a JSON object."] };

  const errors: string[] = [];
  const segmentIds = new Set(ctx.transcript.map((s) => s.id));
  const claimIds = new Set(ctx.claims.map((c) => c.id));
  const sourceIds = new Set(ctx.sources.map((s) => s.id));
  const conflictIds = new Set(ctx.conflicts.map((x) => x.id));
  const personIds = new Set(ctx.attendees.map((p) => p.id));
  const teamIds = new Set(ctx.teamIds);

  // A missing section is treated as empty; a section of the wrong type is an error.
  const list = (key: string): Obj[] => {
    const v = raw[key];
    if (v === undefined || v === null) return [];
    if (!Array.isArray(v)) {
      errors.push(`"${key}" must be an array.`);
      return [];
    }
    return v.map((item, i) => {
      if (isObj(item)) return item;
      errors.push(`${key}[${i}] must be an object.`);
      return {};
    });
  };
  const strList = (v: unknown, where: string, known?: Set<string>, what?: string): string[] => {
    if (v === undefined || v === null) return [];
    if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
      errors.push(`${where} must be an array of strings.`);
      return [];
    }
    for (const x of v as string[]) {
      if (known && !known.has(x)) errors.push(`${where} has unknown ${what} "${x}".`);
    }
    return v as string[];
  };
  const optId = (v: unknown, where: string, known: Set<string>, what: string): string | null => {
    if (v === undefined || v === null) return null;
    if (typeof v !== "string" || !known.has(v)) {
      errors.push(`${where} "${String(v)}" is not a known ${what}; use an id from the lists or null.`);
      return null;
    }
    return v;
  };
  const team = (v: unknown, where: string): TeamId | null => optId(v, where, teamIds, "team id") as TeamId | null;

  const summaryPoints = list("summaryPoints").map((p, i) => {
    const w = `summaryPoints[${i}]`;
    if (!isStr(p.text)) errors.push(`${w}.text must be a non-empty string.`);
    return {
      text: String(p.text ?? ""),
      claimId: optId(p.claimId, `${w}.claimId`, claimIds, "claim id"),
      segmentIds: strList(p.segmentIds, `${w}.segmentIds`, segmentIds, "segment id"),
    };
  });
  if (summaryPoints.length === 0) errors.push(`"summaryPoints" must contain at least one point.`);

  const actionItems = list("actionItems").map((a, i) => {
    const w = `actionItems[${i}]`;
    if (!isStr(a.text)) errors.push(`${w}.text must be a non-empty string.`);
    return {
      text: String(a.text ?? ""),
      ownerId: optId(a.ownerId, `${w}.ownerId`, personIds, "attendee person id"),
      team: team(a.team, `${w}.team`),
    };
  });

  const confusions = list("confusions").map((c, i) => {
    const w = `confusions[${i}]`;
    if (!isStr(c.text)) errors.push(`${w}.text must be a non-empty string.`);
    return {
      text: String(c.text ?? ""),
      term: isStr(c.term) ? c.term : null,
      segmentId: optId(c.segmentId, `${w}.segmentId`, segmentIds, "segment id"),
    };
  });

  const conflictIdList = strList(raw.conflictIds, "conflictIds", conflictIds, "conflict id");

  const conflictCandidates = list("conflictCandidates").map((c, i) => {
    const w = `conflictCandidates[${i}]`;
    for (const k of ["title", "claimAText", "claimBText", "explanation"]) {
      if (!isStr(c[k])) errors.push(`${w}.${k} must be a non-empty string.`);
    }
    const conf = c.confidence;
    if (typeof conf !== "number" || conf < 0 || conf > 1) {
      errors.push(`${w}.confidence must be a number between 0 and 1.`);
    }
    return {
      title: String(c.title ?? ""),
      teamA: team(c.teamA, `${w}.teamA`) as TeamId,
      teamB: team(c.teamB, `${w}.teamB`) as TeamId,
      claimAText: String(c.claimAText ?? ""),
      claimBText: String(c.claimBText ?? ""),
      explanation: String(c.explanation ?? ""),
      confidence: typeof conf === "number" ? conf : 0,
      suggestedQuestions: strList(c.suggestedQuestions, `${w}.suggestedQuestions`),
      segmentIds: strList(c.segmentIds, `${w}.segmentIds`, segmentIds, "segment id"),
    };
  });

  const unsourcedClaims = list("unsourcedClaims").map((u, i) => {
    const w = `unsourcedClaims[${i}]`;
    if (!isStr(u.text)) errors.push(`${w}.text must be a non-empty string.`);
    if (!CLAIM_KINDS.includes(u.kind as Claim["kind"])) {
      errors.push(`${w}.kind must be one of ${CLAIM_KINDS.join(", ")}.`);
    }
    return {
      text: String(u.text ?? ""),
      team: team(u.team, `${w}.team`),
      kind: u.kind as Claim["kind"],
      segmentIds: strList(u.segmentIds, `${w}.segmentIds`, segmentIds, "segment id"),
      reason: String(u.reason ?? ""),
    };
  });

  const docContradictions = list("docContradictions").map((d, i) => {
    const w = `docContradictions[${i}]`;
    if (!isStr(d.claimText)) errors.push(`${w}.claimText must be a non-empty string.`);
    if (!isStr(d.sourceId) || !sourceIds.has(d.sourceId)) {
      errors.push(`${w}.sourceId "${String(d.sourceId)}" is not a known source id.`);
    }
    return {
      claimId: optId(d.claimId, `${w}.claimId`, claimIds, "claim id"),
      claimText: String(d.claimText ?? ""),
      sourceId: String(d.sourceId ?? ""),
      explanation: String(d.explanation ?? ""),
    };
  });

  if (errors.length) return { errors };
  return {
    errors,
    value: {
      summaryPoints,
      actionItems,
      confusions,
      conflictIds: conflictIdList,
      conflictCandidates,
      unsourcedClaims,
      docContradictions,
    },
  };
}

// Checks a finished cache file. `errors` mean other pages could break (dangling
// ids, wrong shape); `warnings` are things to eyeball (e.g. a point with no source,
// which is the intended "No source" flag for a deliberately unsourced claim).
export function validateSummary(
  summary: unknown,
  seed: Seed,
  meetingId: string,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isObj(summary)) return { errors: ["Summary must be a JSON object."], warnings };

  const claims = new Map(seed.claims.map((c) => [c.id, c]));
  const sourceIds = new Set(seed.sources.map((s) => s.id));
  const conflictIds = new Set(seed.conflicts.map((x) => x.id));
  const personIds = new Set(seed.people.map((p) => p.id));
  const teamIds = new Set(seed.teams.map((t) => t.id as string));
  const segmentIds = new Set(
    seed.transcripts.filter((s) => s.meetingId === meetingId).map((s) => s.id),
  );

  if (summary.meetingId !== meetingId) {
    errors.push(`meetingId is "${String(summary.meetingId)}", expected "${meetingId}".`);
  }

  const arr = (key: string): Obj[] => {
    const v = summary[key];
    if (!Array.isArray(v)) {
      errors.push(`"${key}" must be an array.`);
      return [];
    }
    return v.filter(isObj);
  };

  const points = arr("summaryPoints");
  if (points.length === 0) errors.push("summaryPoints is empty.");
  points.forEach((p, i) => {
    const w = `summaryPoints[${i}]`;
    if (!isStr(p.text)) errors.push(`${w}.text is missing.`);
    const claim = typeof p.claimId === "string" ? claims.get(p.claimId) : undefined;
    if (!claim) errors.push(`${w}.claimId "${String(p.claimId)}" does not exist in claims.json.`);
    if (!Array.isArray(p.sourceIds)) {
      errors.push(`${w}.sourceIds must be an array.`);
      return;
    }
    for (const id of p.sourceIds) {
      if (!sourceIds.has(String(id))) errors.push(`${w}.sourceId "${String(id)}" does not exist in sources.json.`);
    }
    if (p.sourceIds.length === 0) {
      warnings.push(`${w} (${String(p.claimId)}) has no sourceIds, so the UI will show "No source". Intended?`);
    }
  });

  arr("actionItems").forEach((a, i) => {
    const w = `actionItems[${i}]`;
    if (!isStr(a.id)) errors.push(`${w}.id is missing.`);
    if (a.meetingId !== meetingId) errors.push(`${w}.meetingId should be "${meetingId}".`);
    if (!isStr(a.text)) errors.push(`${w}.text is missing.`);
    if (a.ownerId !== undefined && !personIds.has(String(a.ownerId))) {
      errors.push(`${w}.ownerId "${String(a.ownerId)}" does not exist in people.json.`);
    }
    if (a.team !== undefined && !teamIds.has(String(a.team))) {
      errors.push(`${w}.team "${String(a.team)}" is not a team id.`);
    }
  });

  arr("confusions").forEach((c, i) => {
    const w = `confusions[${i}]`;
    if (!isStr(c.text)) errors.push(`${w}.text is missing.`);
    if (c.segmentId !== undefined && !segmentIds.has(String(c.segmentId))) {
      errors.push(`${w}.segmentId "${String(c.segmentId)}" is not a segment of ${meetingId}.`);
    }
  });

  const cids = summary.conflictIds;
  if (!Array.isArray(cids)) {
    errors.push(`"conflictIds" must be an array.`);
  } else {
    for (const id of cids) {
      if (!conflictIds.has(String(id))) errors.push(`conflictIds has "${String(id)}", not in conflicts.json.`);
    }
  }

  return { errors, warnings };
}
