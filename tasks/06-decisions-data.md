# Workstream 6: Decisions, Conflicts, Seed Data + Demo

You have **two jobs**: (a) the seed data that makes the whole demo believable, and (b) the decision log and conflict pages. Seed data comes first because everyone integrates against it.

**Owns:** `app/decisions/`, `app/conflicts/`, `data/seed/`, `docs/demo-script.md`
**Story map:** Decision log (auto-built list of decisions per feature, each linked to its source); "Why" view; conflict summary with confidence and suggested follow-up questions.

## Phase 0/1: Wed night to Thu noon: SEED DATA v1 (top priority)
- [ ] Extend #1's stub fixture into real files in `data/seed/`: `teams.json`, `people.json`, `features.json`, `meetings.json`, `transcripts.json`, `sources.json`, `claims.json`, `decisions.json`, `conflicts.json`, `action-items.json` (match the shapes in `docs/CONTRACT.md` exactly, including ID conventions)
- [ ] Scenario (see CONTRACT section 7): 3 features, 4 meetings, ~15 people across teams, 8 to 15 transcript segments per meeting is enough
- [ ] Plant: conflicting definition ("customer data"), a claim contradicting a doc (2% vs 5%), an overturned decision, an unsourced claim, claims backed by several sources
- [ ] Sources must include Slack threads and docs (not only meetings) with realistic excerpts
- [ ] Make sure every `sourceId`, `claimId`, `segmentId` referenced exists. Write a tiny validation script (`scripts/validate-seed.ts` is owned by #4; coordinate, or run it ad hoc)
- [ ] **Push by Thursday noon** and tell the team
- [ ] Agree with #4 on Thursday who writes canonical claims/conflicts (suggested: you do; #4's summaries reference your claim IDs)

## Phase 1/2: Thu to Sat: pages
- [ ] `/decisions`: decision log grouped or filtered by feature. Each row: decision text, date, teams involved, `<SourceBadge>` (placeholder until #5 ships), freshness tag, "Why" link.
- [ ] `/decisions/[id]` **"Why" view:** the decision at the top, then the discussion that led to it (the `whySegmentIds` transcript lines shown inline with speaker and team), plus links to the full meeting
- [ ] `/conflicts` dashboard: cards with title, the two teams, side-by-side conflicting claims, AI explanation, confidence bar, suggested follow-up questions, source badges, link to the feature
- [ ] Sort conflicts by confidence; filter by feature or team

## Phase 3: Sun/Mon: demo
- [ ] `docs/demo-script.md`: a 5-minute walkthrough that matches the demo story in `PLAN.md` step by step, with exact clicks and who says what
- [ ] Full end-to-end QA on the deployed link; make a bug list and assign by workstream
- [ ] Run a rehearsal with the whole team Monday morning, then once more

## Nice to have
- [ ] Decision timeline view; filter by "overturned only"

## Done when
- Seed data is rich enough that every page has something interesting to show
- The decision log + Why view + conflict page are demo-ready
- A demo script exists and the team has rehearsed it

## Starter prompt for your AI tool
> Read CLAUDE.md, docs/CONTRACT.md and tasks/06-decisions-data.md. I'm workstream 6. First, write realistic seed JSON files in data/seed/ for 3 features and 4 meetings with planted conflicts, following the types in the contract exactly. Then build /decisions, /decisions/[id] and /conflicts. Only edit app/decisions/, app/conflicts/, data/seed/.
