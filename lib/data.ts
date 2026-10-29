// Data access layer for Meeting Source Tracer.
// Owned by workstream 1. Every page/component reads data ONLY through these
// functions (see docs/CONTRACT.md section 2). They read the mocked JSON in
// data/seed synchronously, and AI output from data/ai-cache.
//
// Only #4 and #6 touch the JSON files directly; everyone else goes through here.

import fs from "fs";
import path from "path";
import type {
  Team,
  Person,
  Feature,
  Meeting,
  TranscriptSegment,
  Source,
  Claim,
  Decision,
  Conflict,
  MeetingSummary,
  TeamId,
} from "./types";

const SEED_DIR = path.join(process.cwd(), "data", "seed");
const AI_CACHE_DIR = path.join(process.cwd(), "data", "ai-cache");

// Read + parse a JSON file synchronously. Never throws: returns `fallback`
// when the file is missing or malformed, so pages can show an EmptyState
// instead of crashing (CLAUDE.md: "handle empty or missing data").
function readJson<T>(dir: string, file: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function seed<T>(file: string): T[] {
  return readJson<T[]>(SEED_DIR, file, []);
}

export function getTeams(): Team[] {
  return seed<Team>("teams.json");
}

export function getPeople(): Person[] {
  return seed<Person>("people.json");
}

export function getPerson(id: string): Person | undefined {
  return getPeople().find((p) => p.id === id);
}

export function getFeatures(): Feature[] {
  return seed<Feature>("features.json");
}

export function getFeature(id: string): Feature | undefined {
  return getFeatures().find((f) => f.id === id);
}

export function getMeetings(filter?: { featureId?: string }): Meeting[] {
  let list = seed<Meeting>("meetings.json");
  if (filter?.featureId) {
    list = list.filter((m) => m.featureId === filter.featureId);
  }
  return list;
}

export function getMeeting(id: string): Meeting | undefined {
  return getMeetings().find((m) => m.id === id);
}

export function getTranscript(meetingId: string): TranscriptSegment[] {
  return seed<TranscriptSegment>("transcripts.json")
    .filter((s) => s.meetingId === meetingId)
    .sort((a, b) => a.startSec - b.startSec);
}

export function getSource(id: string): Source | undefined {
  return seed<Source>("sources.json").find((s) => s.id === id);
}

export function getSources(ids: string[]): Source[] {
  const all = seed<Source>("sources.json");
  return ids
    .map((id) => all.find((s) => s.id === id))
    .filter((s): s is Source => Boolean(s));
}

export function getClaims(filter?: {
  featureId?: string;
  meetingId?: string;
  team?: TeamId;
}): Claim[] {
  let list = seed<Claim>("claims.json");
  if (filter?.featureId) list = list.filter((c) => c.featureId === filter.featureId);
  if (filter?.meetingId) list = list.filter((c) => c.meetingId === filter.meetingId);
  if (filter?.team) list = list.filter((c) => c.team === filter.team);
  return list;
}

export function getClaim(id: string): Claim | undefined {
  return seed<Claim>("claims.json").find((c) => c.id === id);
}

export function getDecisions(featureId?: string): Decision[] {
  const list = seed<Decision>("decisions.json");
  return featureId ? list.filter((d) => d.featureId === featureId) : list;
}

export function getConflicts(featureId?: string): Conflict[] {
  const list = seed<Conflict>("conflicts.json");
  return featureId ? list.filter((x) => x.featureId === featureId) : list;
}

// AI output lives in data/ai-cache/<meetingId>.json (owned by #4). Returns
// undefined until that file exists, so meeting pages must handle "no summary yet".
export function getMeetingSummary(meetingId: string): MeetingSummary | undefined {
  return readJson<MeetingSummary | undefined>(
    AI_CACHE_DIR,
    `${meetingId}.json`,
    undefined,
  );
}
