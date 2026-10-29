# Meeting Source Tracer: Prototype Plan

**Team:** cs177-redpandas (6 people)
**Deadline:** Monday, Nov 2 (night). Internal target: submit-ready by Monday 3 PM.
**Goal:** a clickable, mocked-data web prototype of the MVP 1 column from our story map: *record, summarize, and trace every point to its source.*

---

## 1. What we are (and aren't) building

**Building (MVP 1):**
- Connect-workspace screen (mock SSO, Calendar / Slack / Docs toggles, team tagging)
- Meetings list + meeting detail with speaker-labeled transcript and team tags
- Feature/project view: what Compliance, Risk, Security, and Eng each said about it
- AI after-meeting summaries with action items, plus conflict / confusion annotations
- Source badges on every summary point, click-through to the source (meeting timestamp, Slack thread, or doc)
- "Why" view: click a decision to see the discussion that led to it
- Decision log per feature, unsourced-claim flags

**Faking on purpose:**
- Slack, Google Docs, Calendar, SSO: all fixture data, no real OAuth
- Recording: pre-written transcripts (optional "paste transcript" button)
- AI: outputs are pre-generated and cached as JSON so the demo never depends on a live API call

**Not building:** anything in the green "Details" row that isn't in the blue MVP 1 row (live transcript following, bookmarks, redaction, notifications, timeline of decisions, etc.).

## 2. Stack

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | One repo, easy to deploy |
| Styling | Tailwind CSS | Fast to vibe code, consistent |
| Data | JSON files in `/data/seed` read through `lib/data.ts` | No DB setup, no migrations, no merge pain |
| AI | Claude API, run once per meeting by a script, output cached to `/data/ai-cache` | Reliable demo, cheap |
| Deploy | Vercel (free) | Shareable link for the demo |

## 3. The six workstreams

| # | Workstream | Owns (folders) | Task file |
|---|---|---|---|
| 1 | Platform + onboarding | `app/layout.tsx`, `app/page.tsx`, `app/connect/`, `components/ui/`, `lib/data.ts`, `lib/types.ts` | `tasks/01-platform.md` |
| 2 | Meetings + transcript | `app/meetings/`, `components/transcript/` | `tasks/02-meetings.md` |
| 3 | Features + team views | `app/features/`, `components/feature/` | `tasks/03-features.md` |
| 4 | AI pipeline | `lib/ai/`, `scripts/generate-ai.ts`, `data/ai-cache/` | `tasks/04-ai.md` |
| 5 | Source tracing | `components/source/`, `app/trace/` | `tasks/05-tracing.md` |
| 6 | Decisions, conflicts, seed data, demo | `app/decisions/`, `app/conflicts/`, `data/seed/`, `docs/demo-script.md` | `tasks/06-decisions-data.md` |

Everyone works against the shared contract in `docs/CONTRACT.md`. Read it first.

## 4. Schedule (Wed Oct 28 to Mon Nov 2)

| When | What | Who |
|---|---|---|
| **Wed night** | **Day 0:** everyone reads the contract and agrees (30 min call). #1 pushes the scaffold + `types.ts` + `data.ts` + a one-of-each stub fixture. #6 starts seed data. | All |
| **Thu** | **Build on stub data.** Each person builds their pages against the stub. #6 pushes the real seed data v1 by Thursday noon. #4 runs the AI script on seed meeting 1 by Thursday evening. | All |
| **Fri** | Finish pages. **PR everything to `main` by Friday night**, even if rough. | All |
| **Sat** | **Integrate.** Swap stubs for real seed + AI cache. Wire badges (#5) into summaries (#2, #3, #6). Fix breakages. | All |
| **Sun** | **Polish + feature freeze at 8 PM.** Visual consistency, empty states, bug bash, deploy to Vercel. #6 writes the demo script. | All |
| **Mon** | Rehearse the demo twice. Bug fixes only. Submit by 3 PM; use the rest as buffer. | All |

**Rule of thumb:** if something isn't working by Saturday, cut it, don't extend it.

## 5. Handoffs (the only places people depend on each other)

| Needs | From | By when | Fallback |
|---|---|---|---|
| Scaffold, `types.ts`, `data.ts`, stub fixture | #1 | Wed night | Everyone waits max 1 hr; #1 posts when pushed |
| Real seed data (meetings, Slack, docs, claims, decisions, conflicts) | #6 | Thu noon | Use stub until then |
| AI-generated summaries/claims/conflicts JSON | #4 | Thu eve (meeting 1), Fri eve (all) | #6 hand-writes the JSON in the same shape |
| `<SourceBadge>` and `<SourcePanel>` components | #5 | Fri | #2/#3/#6 use a plain placeholder chip until it lands |
| Shared UI pieces (Button, Card, TeamTag, PageHeader) | #1 | Thu morning | Use plain Tailwind |

## 6. Demo story (what we're building toward)

1. PM signs in (mock SSO) and sees connected sources.
2. PM opens a **feature** and sees what each team said about it.
3. PM reads an **AI summary** with a flagged **conflict** (e.g. Product and Compliance define "customer data" differently).
4. PM clicks a **source badge** and a side panel shows the exact Slack thread or transcript moment.
5. PM opens the **decision log** and clicks **"Why"** to see the discussion behind a decision.
6. PM spots an **unsourced claim** flag.

Every workstream should be able to point to which step of this story it supports.

## 7. Definition of done

- The demo story above works end to end on the deployed Vercel link
- No page crashes on missing data (empty states exist)
- Repo README explains how to run it locally
- Demo script rehearsed at least twice
