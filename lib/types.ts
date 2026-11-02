// Shared data model for Meeting Source Tracer.
// Owned by workstream 1. Copied from docs/CONTRACT.md. Additive changes only,
// and only after telling the team.

export type TeamId = "product" | "compliance" | "risk" | "security" | "eng" | "growth";
export type SourceType = "meeting" | "slack" | "doc";

export interface Team { id: TeamId; name: string; color: string; }

export interface Person {
  id: string;
  name: string;
  role: string;
  team: TeamId;
  avatar?: string;
}

export interface Feature {
  id: string;            // e.g. "f_data_export"
  name: string;
  description: string;
  status: "planning" | "in_progress" | "blocked" | "shipped";
}

export interface Meeting {
  id: string;            // e.g. "m_001"
  title: string;
  date: string;          // ISO
  durationMin: number;
  featureId?: string;
  attendeeIds: string[];
  recordingStatus: "recorded" | "recording" | "scheduled";
}

export interface TranscriptSegment {
  id: string;            // e.g. "m_001_s014"
  meetingId: string;
  speakerId: string;     // Person.id
  team: TeamId;
  startSec: number;
  text: string;
}

// A place a claim can be traced back to
export interface Source {
  id: string;            // e.g. "src_007"
  type: SourceType;
  title: string;         // "Compliance sync, Oct 14" / "#data-export thread" / "Privacy Policy v3"
  url?: string;          // mock link
  excerpt: string;       // the exact quoted text
  meetingId?: string;    // for type=meeting
  segmentId?: string;    // for type=meeting (jump target)
  timestampSec?: number; // for type=meeting
  authorId?: string;
  team?: TeamId;
  date: string;          // ISO
  version?: string;      // for docs
  status?: "current" | "updated" | "overturned"; // freshness tag
}

// Any statement in a summary / decision log / conflict
export interface Claim {
  id: string;            // "c_012"
  text: string;
  kind: "decision" | "number" | "commitment" | "statement";
  featureId?: string;
  meetingId?: string;
  team?: TeamId;
  sourceIds: string[];   // empty array = UNSOURCED (flag it)
  contradictsSourceId?: string; // set when it conflicts with an existing doc
}

export interface Decision {
  id: string;            // "d_003"
  featureId: string;
  text: string;
  date: string;
  madeByTeams: TeamId[];
  claimId: string;       // the claim backing this decision
  sourceIds: string[];
  whyMeetingId?: string;     // discussion that led to it
  whySegmentIds?: string[];  // segments to show in the "Why" view
}

export interface Conflict {
  id: string;            // "x_002"
  featureId: string;
  title: string;         // "Product and Compliance define 'customer data' differently"
  teamA: TeamId;
  teamB: TeamId;
  claimAId: string;
  claimBId: string;
  explanation: string;
  confidence: number;    // 0..1
  suggestedQuestions: string[];
}

export interface ActionItem {
  id: string;
  meetingId: string;
  text: string;
  ownerId?: string;
  team?: TeamId;
}

// AI output for one meeting (cached JSON in data/ai-cache/<meetingId>.json)
export interface MeetingSummary {
  meetingId: string;
  summaryPoints: { text: string; claimId: string; sourceIds: string[] }[];
  actionItems: ActionItem[];
  confusions: { text: string; term?: string; segmentId?: string }[]; // "what finance means by X"
  conflictIds: string[];
}
