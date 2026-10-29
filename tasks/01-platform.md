# Workstream 1: Platform + Onboarding

**You are the foundation.** Everyone else is blocked until you push the scaffold, so do that first (target: Wednesday night, within an hour of the contract call).

**Owns:** `app/layout.tsx`, `app/page.tsx`, `app/connect/`, `components/ui/`, `lib/data.ts`, `lib/types.ts`, config files (`package.json`, Tailwind, etc.)
**Story map:** Connect workspace (calendar, Slack, Docs) via company SSO; tag each team.

## Phase 0: Wed night (everyone is waiting on this)
- [x] `npx create-next-app` (TypeScript, Tailwind, App Router). Push to `main`.
- [x] Create `lib/types.ts` exactly as in `docs/CONTRACT.md`
- [x] Create `lib/data.ts` with all functions from the contract, reading `data/seed/*.json`
- [x] Create a **stub fixture** in `data/seed/` with one of every type (so others can build immediately). Tell #6 so they extend it instead of replacing the shape.
- [x] Push empty placeholder pages for all routes in the contract so nav links don't 404
- [ ] Post in team chat: "scaffold is up, pull main"

## Phase 1: Thu
- [ ] Shared UI: `TeamTag`, `Card`, `PageHeader`, `EmptyState`, plus a simple Button (push by Thursday morning)
- [ ] App shell in `layout.tsx`: sidebar/top nav (Meetings, Features, Decisions, Conflicts), consistent page width and typography
- [ ] Team colors defined once (compliance, risk, security, eng, growth, product)
- [ ] `/` landing page: product name, one-line pitch, **"Sign in with company SSO"** button (mock; goes to `/connect`)
- [ ] `/connect`: toggle cards for Google Calendar, Slack, Google Docs (fake "Connected" state); a channels/folders checklist; **team tagging** (assign each channel/folder to Compliance/Risk/Security/Eng/Growth). Save in `localStorage` only.
- [ ] After connecting, a "Go to meetings" button

## Phase 2: Fri/Sat
- [ ] Deploy to Vercel; share the link in the chat
- [ ] README: how to run locally (`npm install`, `npm run dev`)
- [ ] Help teammates with scaffold/data-layer issues (you are on call)

## Phase 3: Sun/Mon
- [ ] Visual consistency pass across all pages (spacing, fonts, colors)
- [ ] Loading/empty/404 states
- [ ] Verify the production build passes (`npm run build`) before final submission

## Done when
- Anyone can clone, `npm install`, `npm run dev` and see the app with working nav
- Connect flow looks real in a demo
- Production build is green and deployed

## Starter prompt for your AI tool
> Read CLAUDE.md and docs/CONTRACT.md. I'm workstream 1 (platform). Scaffold a Next.js App Router + TypeScript + Tailwind app, create lib/types.ts exactly from the contract, write lib/data.ts reading JSON from data/seed, add a stub fixture with one of each type, and add placeholder pages for every route in the contract.
