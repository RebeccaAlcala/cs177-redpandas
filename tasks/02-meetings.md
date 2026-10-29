# Workstream 2: Meetings + Transcript

**Owns:** `app/meetings/`, `components/transcript/`
**Story map:** Record meeting (auto-join, linked to a feature), speaker-labeled transcript with team tags.

## Phase 1: Thu/Fri (build on stub data)
- [ ] `/meetings` list: title, date, duration, linked feature, recording status badge (recorded / recording / scheduled), attendee avatars. Filter by feature.
- [ ] "Auto-join from calendar" mock: a banner or card showing upcoming meetings the bot "will auto-join", with a toggle per meeting and a **Start/Stop recording** button that just flips status in local state. Also a **"Link to feature"** dropdown on each meeting.
- [ ] `components/transcript/TranscriptViewer`: speaker-labeled lines, each with avatar, name, `TeamTag`, timestamp (mm:ss). Props: `meetingId`, `highlightSegmentId?` (scrolls to and highlights that line; #5 and #6 will use this to jump to a source moment).
- [ ] `/meetings/[id]`: header (title, date, feature), transcript on the left, **AI summary panel on the right** (reads `getMeetingSummary`; shows summary points, action items, confusion notes). Use a placeholder chip where `<SourceBadge>` will go.
- [ ] Support a URL param like `?segment=m_001_s014` so links can jump straight to a moment

## Phase 2: Sat
- [ ] Replace placeholder chips with `<SourceBadge sourceIds=... />` from #5
- [ ] Show conflict callouts inside the summary (use `conflictIds`, link to `/conflicts`)
- [ ] Highlight confusion/term annotations (e.g. "what Compliance means by 'customer data'") inline in the transcript if time allows

## Phase 3: Sun
- [ ] Empty/loading states, long transcript scrolling, mobile-ish layout check

## Nice to have (only if ahead)
- [ ] Transcript search box and filter by team

## Done when
- A meeting page shows a readable team-tagged transcript and the AI summary side by side
- `?segment=` jumps to and highlights the right line
- Start/Stop recording looks believable in the demo

## Starter prompt for your AI tool
> Read CLAUDE.md, docs/CONTRACT.md and tasks/02-meetings.md. I'm workstream 2. Build /meetings and /meetings/[id] and the TranscriptViewer component using the data functions in lib/data.ts and the stub fixture. Only edit app/meetings/ and components/transcript/.
