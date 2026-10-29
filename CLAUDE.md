# Instructions for AI coding assistants (Claude Code, Cursor, etc.)

This repo is a 6-person school prototype of "Meeting Source Tracer": a tool for product managers that records meetings, catches cross-team conflict, and traces every claim to its source. Everything is **mocked data**. Speed and a clean demo matter more than completeness.

## Before writing any code
1. Read `docs/CONTRACT.md` (types, data access functions, folder ownership, git rules).
2. Read your person's task file in `tasks/`. Ask the user which workstream they are if it's not clear.

## Hard rules
- **Only edit files in the folders your workstream owns** (see CONTRACT.md section 3). If you need a change elsewhere, tell the user to ask the owner, or open a PR comment.
- **Never change `lib/types.ts` or `lib/data.ts` without telling the user**: those are shared. Additive changes only (new optional fields), announced in the team chat.
- **Read data only through `lib/data.ts`.** Do not import JSON files directly in pages.
- **No real integrations.** No real OAuth, no real recording, no database.
- Use Next.js App Router, TypeScript, Tailwind. Use shared components from `components/ui/` where they exist.
- Every page must handle empty/missing data without crashing.
- Keep it simple. No new dependencies without asking the user.

## Git
- Branch per task: `ws<N>/<short-name>` (e.g. `ws2/transcript-viewer`).
- Small PRs into `main`, at least one teammate review. Merge often (at least daily).
- Pull `main` before starting work each session.
