# Meeting Source Tracer (cs177-redpandas)

A prototype website for product managers: record meetings, catch cross-team conflict, and trace every claim back to its source. All data is mocked for the demo.

**Deadline:** Monday, Nov 2 (night)

## Start here (everyone)

1. Pull the latest: `git pull origin main`
2. Open your AI coding tool in this repo (Claude Code, Cursor, etc.)
3. Tell it your workstream number, for example: **"I'm workstream 3."**
   - It reads `CLAUDE.md`, finds your task file, and knows what to build.

| # | Workstream | Task file |
|---|---|---|
| 1 | Platform + onboarding | `tasks/01-platform.md` |
| 2 | Meetings + transcript | `tasks/02-meetings.md` |
| 3 | Features + team views | `tasks/03-features.md` |
| 4 | AI pipeline | `tasks/04-ai.md` |
| 5 | Source tracing | `tasks/05-tracing.md` |
| 6 | Decisions, conflicts, seed data + demo | `tasks/06-decisions-data.md` |

## Docs

- `PLAN.md`: scope, schedule, handoffs between people, demo story
- `docs/CONTRACT.md`: shared data types, data functions, routes, component props, git rules
- `CLAUDE.md`: instructions your AI tool follows

## Run locally

Once workstream 1 has pushed the scaffold:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
