# Instructions for AI coding assistants (Claude Code, Cursor, Copilot, etc.)

This repo is a 6-person school prototype of **Meeting Source Tracer**: a website for product managers that records meetings, catches cross-team conflict, and traces every claim back to its source. Everything is **mocked data**. Deadline: **Monday Nov 2, night** (internal target: Monday 3 PM). Speed and a clean demo matter more than completeness.

---

## STEP 1: Find out which workstream the user is

The user will give you a number from 1 to 6 (for example "I'm 3", "workstream 4", or just "5").
**If they haven't told you a number, ask: "Which workstream number are you (1 to 6)?" and wait. Do not write any code until you know.**

| # | Workstream | Your task file | Folders you may edit |
|---|---|---|---|
| 1 | Platform + onboarding | `tasks/01-platform.md` | `app/layout.tsx`, `app/page.tsx`, `app/connect/`, `components/ui/`, `lib/data.ts`, `lib/types.ts`, config files (`package.json`, Tailwind, etc.) |
| 2 | Meetings + transcript | `tasks/02-meetings.md` | `app/meetings/`, `components/transcript/` |
| 3 | Features + team views | `tasks/03-features.md` | `app/features/`, `components/feature/` |
| 4 | AI pipeline | `tasks/04-ai.md` | `lib/ai/`, `scripts/`, `data/ai-cache/` |
| 5 | Source tracing | `tasks/05-tracing.md` | `components/source/`, `app/trace/` |
| 6 | Decisions, conflicts, seed data, demo | `tasks/06-decisions-data.md` | `app/decisions/`, `app/conflicts/`, `data/seed/`, `docs/demo-script.md` |

Every workstream may also edit its own task file (to tick off checkboxes).

## STEP 2: Load your context (do this at the start of every session)

1. Run `git pull origin main` to get everyone's latest work.
2. Read, in this order: `PLAN.md` (schedule and handoffs), `docs/CONTRACT.md` (shared types, data functions, routes, component props), and **your task file** from the table above.
3. Look at what already exists in your folders so you continue instead of redoing work.
4. Tell the user, briefly:
   - which workstream you are working on and which folders you will touch
   - what's done vs. not done in your task file (by checkbox)
   - the next 2 to 3 things you will build, in order
   - any dependency on another workstream (see "Handoffs" in `PLAN.md`) and what fallback you'll use

   Then **start building the first unchecked item**. Don't wait for approval unless something is genuinely unclear.

## STEP 3: Work rules

- **Follow your task file.** Work top to bottom through its checklist, by phase. Tick a box (`- [x]`) when the item is finished and works.
- **Only edit the folders in your row of the table.** If you need a change somewhere else, don't make it. Tell the user exactly what to ask the owner for (for example: "ask #5 to add prop X to `SourceBadge`").
- **`lib/types.ts` and `lib/data.ts` are shared.** Only workstream 1 edits them. If you need a new field or function, tell the user to request it from #1. Additive changes only.
- **Read data only through the functions in `lib/data.ts`.** Never import JSON from `data/` directly in pages or components (except #4 and #6, who work with the JSON files themselves).
- **Match the types and ID conventions in `docs/CONTRACT.md` exactly** (`m_001`, `src_007`, `c_012`, etc.). Other people's code depends on them.
- **Use shared components** (`TeamTag`, `Card`, `PageHeader`, `EmptyState`, `SourceBadge`, `SourcePanel`, `UnsourcedFlag`, `TranscriptViewer`) with the props listed in the contract. If a component hasn't been merged yet, use a plain placeholder with the same props and swap it in later.
- **Mocked everything.** No real OAuth, no real recording, no database, no live AI calls in the website (AI output is pre-generated JSON in `data/ai-cache/`).
- **Every page must handle empty or missing data without crashing.** Use `EmptyState`.
- **Stack:** Next.js (App Router), TypeScript, Tailwind. Do not add new dependencies without asking the user.
- **Keep it simple and demo-ready.** Cut scope before extending the deadline. If something isn't working by Saturday, cut it.
- **Design for a laptop screen / projector.** Clean, consistent, readable.

## STEP 4: Git workflow

- Make a branch for each task: `ws<N>/<short-name>` (for example `ws2/transcript-viewer`). Don't work directly on `main`.
- Commit small and often, with plain-language messages. Push your branch.
- Open a PR into `main` when a task works. Ask a teammate for a quick review. Merge at least once per day.
- Never force-push `main`. Pull `main` before each session and before opening a PR.
- If you hit a merge conflict in a file you don't own, stop and tell the user. Don't resolve it by overwriting someone else's work.

## When you finish a task or the user asks "what's next"

1. Tick the box in your task file.
2. Check the schedule in `PLAN.md` for what's due now.
3. Suggest the next unchecked item, or, if all of your current phase is done, tell the user what they can do to help a teammate (check the "Handoffs" table).

## If you're blocked

- Needing something from another workstream? Use the fallback listed in `PLAN.md` "Handoffs" and keep going. Never sit idle.
- Something in the contract seems wrong or missing? Tell the user to raise it with the team. Don't silently change the shared files.
