# Day 0 Contract

Everyone builds against this. If you want to change it, tell the team first.

## 1. Data model (`lib/types.ts`, owned by #1)

```ts
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
```

## 2. Data access (`lib/data.ts`, owned by #1)

**All pages read data only through these functions** (sync, reading JSON from `/data/seed` and `/data/ai-cache`):

```ts
getTeams(): Team[]
getPeople(): Person[]
getPerson(id): Person | undefined
getFeatures(): Feature[]
getFeature(id): Feature | undefined
getMeetings(filter?: { featureId?: string }): Meeting[]
getMeeting(id): Meeting | undefined
getTranscript(meetingId): TranscriptSegment[]
getSource(id): Source | undefined
getSources(ids: string[]): Source[]
getClaims(filter?: { featureId?: string; meetingId?: string; team?: TeamId }): Claim[]
getClaim(id): Claim | undefined
getDecisions(featureId?: string): Decision[]
getConflicts(featureId?: string): Conflict[]
getMeetingSummary(meetingId): MeetingSummary | undefined
```

Server components call these directly. Client components get data via props.

## 3. Folder ownership (only edit your own folders)

| # | Owner of |
|---|---|
| 1 | `app/layout.tsx`, `app/page.tsx`, `app/connect/`, `components/ui/`, `lib/data.ts`, `lib/types.ts`, config files |
| 2 | `app/meetings/`, `components/transcript/` |
| 3 | `app/features/`, `components/feature/` |
| 4 | `lib/ai/`, `scripts/`, `data/ai-cache/` |
| 5 | `components/source/`, `app/trace/` |
| 6 | `app/decisions/`, `app/conflicts/`, `data/seed/`, `docs/demo-script.md` |

Shared files (`package.json`, `tailwind.config`, nav links in layout): ask #1.

## 4. Shared components and their props (so people can use them before they exist)

```ts
// #1: components/ui/
<TeamTag team={TeamId} />                // colored pill
<Card title? children />
<PageHeader title subtitle? actions? />
<EmptyState message />

// #5: components/source/
<SourceBadge sourceIds={string[]} />      // shows icon + count; click opens SourcePanel
<SourcePanel sourceIds={string[]} open onClose />  // side panel with excerpt, "Open in original", jump-to-timestamp
<UnsourcedFlag />                        // red "No source" chip

// #2: components/transcript/
<TranscriptViewer meetingId={string} highlightSegmentId? />

// #4: lib/ai/
(no UI) produces data/ai-cache/<meetingId>.json (MeetingSummary shape)
```

If a component isn't merged yet, use a plain placeholder with the same props and swap later.

## 5. Routes (pages)

| Route | Owner | Purpose |
|---|---|---|
| `/` | 1 | Landing + mock SSO sign-in |
| `/connect` | 1 | Connect workspace + team tagging |
| `/meetings` | 2 | Meetings list |
| `/meetings/[id]` | 2 | Transcript + AI summary |
| `/features` | 3 | Features list |
| `/features/[id]` | 3 | Per-team views, summary, conflicts for a feature |
| `/decisions` | 6 | Decision log (filter by feature) |
| `/decisions/[id]` | 6 | "Why" view |
| `/conflicts` | 6 | Conflict dashboard |
| `/trace/[sourceId]` | 5 | Full-page source view (fallback for the side panel) |

Nav (in layout, #1): Meetings, Features, Decisions, Conflicts.

## 6. Fixture ID conventions

`m_001` meetings, `m_001_s014` segments, `src_007` sources, `c_012` claims, `d_003` decisions, `x_002` conflicts, `f_<slug>` features, `p_<slug>` people. #6 uses these everywhere so IDs link across files.

## 7. Seed data scenario (#6 builds this)

Three features, four meetings, planted conflicts. Suggested:
- **f_data_export** ("Customer data export"): Product and Compliance define "customer data" differently (Compliance includes derived/analytics data; Product means profile data only). Eng estimate depends on which.
- **f_auto_kyc** ("Automated identity checks"): Risk says false-positive threshold 2%; Eng built to 5% based on an old doc (contradicts a doc). Security raises a retention concern.
- **f_sso_login** ("Enterprise SSO"): Security requires MFA; Growth wants frictionless signup. One decision later overturned.

Include at least: 1 unsourced claim, 1 claim contradicting a doc, 1 overturned decision, Slack threads and docs that back up claims.

## 8. Git rules

- Branch per task: `ws<N>/<short-name>`
- Small PRs into `main`, one teammate reviews (a quick look is fine, no blocking)
- Pull `main` before each work session
- Never force-push `main`
- Merge at least once per day. Big unmerged branches are how we lose Sunday.
- Commit message: what you built in plain words

## 9. Using AI coding tools without stepping on each other

- Point your tool at `CLAUDE.md` and this file at the start of every session
- Tell it which workstream you are, and to only touch your folders
- If your AI wants to change a shared file, stop and ask the owner instead
