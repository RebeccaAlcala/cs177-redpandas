# Workstream 5: Source Tracing

**This is the heart of the product** ("trace every claim back to its source"). Everyone else embeds your components, so ship the first version early.

**Owns:** `components/source/`, `app/trace/`
**Story map:** Click a summary point to view its source (meeting moment, Slack thread, or doc); source badges; "Why" view; show who said it and which team; check if it's still current.

## Phase 1: Thu/Fri (ship components by Friday)
- [ ] `<SourceBadge sourceIds={string[]} />`: small pill with the source type icon (meeting / Slack / doc) and a count ("2 sources"). Click opens `SourcePanel`. **Push a basic version Thursday so others can drop it in.**
- [ ] `<UnsourcedFlag />`: red/amber "No source" chip. Used when `sourceIds` is empty.
- [ ] `<SourcePanel sourceIds open onClose />`: slide-over panel from the right (no page navigation). For each source show:
  - [ ] type icon + title + date
  - [ ] **excerpt** (the quoted text)
  - [ ] who said it (avatar, name) and their `TeamTag`
  - [ ] **meeting source:** "Jump to moment (mm:ss)" button linking to `/meetings/<id>?segment=<segmentId>`
  - [ ] **Slack source:** looks like a Slack message with a mock "Open in Slack" button (can be a fake link)
  - [ ] **Doc source:** mock doc preview with the excerpt highlighted and a mock "Open in Docs" button
  - [ ] when a claim has several sources, list them all
- [ ] **Freshness tag** on each source from `status`: Current / Updated / Overturned (colored chip)
- [ ] `/trace/[sourceId]`: simple full-page version of the panel (fallback link target)

## Phase 2: Sat
- [ ] Help #2, #3, #6 integrate the badge into their pages
- [ ] **Contradiction indicator:** if a claim has `contradictsSourceId`, show a warning inside the panel ("This conflicts with Privacy Policy v3") with a link to that source
- [ ] Copy-link button (copies the `/trace/[sourceId]` URL)

## Phase 3: Sun
- [ ] Keyboard: Escape closes the panel; panel is scrollable with long excerpts
- [ ] Visual polish with #1's `ui` components

## Nice to have
- [ ] "Related context": other sources on the same topic listed under the main source

## Done when
- From any summary point, one click shows the exact source text, who said it, which team, and how fresh it is
- Unsourced claims are visibly flagged everywhere they appear

## Starter prompt for your AI tool
> Read CLAUDE.md, docs/CONTRACT.md and tasks/05-tracing.md. I'm workstream 5. Build SourceBadge, UnsourcedFlag, and a slide-over SourcePanel using getSources() from lib/data.ts and the stub fixture. Only edit components/source/ and app/trace/.
