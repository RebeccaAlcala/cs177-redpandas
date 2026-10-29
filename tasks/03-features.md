# Workstream 3: Features + Team Views

**Owns:** `app/features/`, `components/feature/`
**Story map:** Browse by feature or project; interactive transcript to see what compliance, risk, security, and eng each said about it; compare team perspectives.

## Phase 1: Thu/Fri (build on stub data)
- [ ] `/features` list: cards with name, status, number of meetings, number of open conflicts. Search box + status filter.
- [ ] `/features/[id]` page with tabs or sections:
  - [ ] **Overview:** description, status, linked meetings (links to `/meetings/[id]`)
  - [ ] **By team (main feature):** columns for Compliance, Risk, Security, Eng (and Growth if present). Each column lists that team's claims on this feature (from `getClaims({featureId, team})`), each with a source badge placeholder and the meeting date.
  - [ ] **Conflicts:** list of conflicts for this feature (from `getConflicts(featureId)`), link to `/conflicts`
  - [ ] **Decisions:** compact list from `getDecisions(featureId)`, link to `/decisions`
- [ ] Filter bar: by team (multi-select), by claim kind (decisions / numbers / commitments)

## Phase 2: Sat
- [ ] Swap placeholders for `<SourceBadge>` and `<UnsourcedFlag>` from #5 (claims with empty `sourceIds` get the flag)
- [ ] **Side-by-side comparison:** when a conflict exists, highlight the two conflicting claims in their team columns (e.g. orange border) with a "Conflict" chip linking to the conflict

## Phase 3: Sun
- [ ] Empty states for features with no meetings, no claims for a team
- [ ] Layout check at laptop size (projector demo!)

## Nice to have
- [ ] "Related discussions" list: other meetings that mention the same feature, in date order

## Done when
- A PM opens a feature and immediately sees what each team said, with conflicts highlighted
- Every claim shows a source badge or an unsourced flag

## Starter prompt for your AI tool
> Read CLAUDE.md, docs/CONTRACT.md and tasks/03-features.md. I'm workstream 3. Build /features and /features/[id] with a by-team column view using lib/data.ts and the stub fixture. Only edit app/features/ and components/feature/.
