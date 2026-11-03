// Loads the seed JSON for the AI script. Workstream 4 may read data/seed
// directly (CLAUDE.md); the website itself still goes through lib/data.ts.
// Unlike lib/data.ts this THROWS on malformed JSON: a script should fail loudly
// rather than quietly generate a summary from half the data.

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
  Conflict,
} from "../types";

export const SEED_DIR = path.join(process.cwd(), "data", "seed");
export const CACHE_DIR = path.join(process.cwd(), "data", "ai-cache");

export interface Seed {
  teams: Team[];
  people: Person[];
  features: Feature[];
  meetings: Meeting[];
  transcripts: TranscriptSegment[];
  sources: Source[];
  claims: Claim[];
  conflicts: Conflict[];
}

function read<T>(file: string): T[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), "utf8")) as T[];
  } catch (err) {
    // A file that doesn't exist yet is just "no data"; a broken one is a bug.
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new Error(`Could not read data/seed/${file}: ${(err as Error).message}`);
  }
}

export function loadSeed(): Seed {
  return {
    teams: read<Team>("teams.json"),
    people: read<Person>("people.json"),
    features: read<Feature>("features.json"),
    meetings: read<Meeting>("meetings.json"),
    transcripts: read<TranscriptSegment>("transcripts.json"),
    sources: read<Source>("sources.json"),
    claims: read<Claim>("claims.json"),
    conflicts: read<Conflict>("conflicts.json"),
  };
}

// Everything the model is shown (and everything its answer is checked against)
// for one meeting.
export interface MeetingContext {
  meeting: Meeting;
  feature?: Feature;
  attendees: Person[];
  transcript: TranscriptSegment[];
  claims: Claim[]; // canonical claims (from #6) for this meeting
  sources: Source[]; // every source: Slack threads and docs are the "context" for contradictions
  conflicts: Conflict[]; // canonical conflicts for this meeting's feature
  teamIds: string[];
}

export function buildContext(seed: Seed, meetingId: string): MeetingContext {
  const meeting = seed.meetings.find((m) => m.id === meetingId);
  if (!meeting) throw new Error(`No meeting "${meetingId}" in data/seed/meetings.json`);

  const transcript = seed.transcripts
    .filter((s) => s.meetingId === meetingId)
    .sort((a, b) => a.startSec - b.startSec);
  if (transcript.length === 0) {
    throw new Error(`Meeting ${meetingId} has no transcript segments in data/seed/transcripts.json`);
  }

  return {
    meeting,
    feature: seed.features.find((f) => f.id === meeting.featureId),
    attendees: meeting.attendeeIds
      .map((id) => seed.people.find((p) => p.id === id))
      .filter((p): p is Person => Boolean(p)),
    transcript,
    claims: seed.claims.filter((c) => c.meetingId === meetingId),
    sources: seed.sources,
    conflicts: seed.conflicts.filter((x) => x.featureId === meeting.featureId),
    teamIds: seed.teams.map((t) => t.id),
  };
}
