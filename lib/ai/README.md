# AI pipeline (workstream 4)

The AI runs **offline, once per meeting**, and writes JSON into `data/ai-cache/`. The website only reads those files (through `getMeetingSummary` in `lib/data.ts`), so the demo never depends on a live API call and nobody else needs a key.

## One-time setup

1. Get an Anthropic API key.
2. Create `.env` at the repo root (it is gitignored, never commit it):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. `npm install` (nothing extra needed; the script uses `npx tsx`, which is downloaded on first use and does not touch `package.json`). Needs Node 20+.

## Run it

```bash
npx tsx scripts/generate-ai.ts                # every meeting that has no cache file yet
npx tsx scripts/generate-ai.ts m_001 m_003    # only these meetings
npx tsx scripts/generate-ai.ts --force        # overwrite existing cache files
npx tsx scripts/generate-ai.ts --dry-run      # print the prompts, call nothing, no key needed
npx tsx scripts/generate-ai.ts --validate     # check cache files against the seed, no key needed
```

Optional: `--model=<id>` or `ANTHROPIC_MODEL=<id>` to change the model (default in `lib/ai/generate.ts`).

> **Existing files are skipped unless you pass `--force`**, so hand edits are not lost by accident. Re-running with `--force` replaces the file, hand edits included.

## What it writes

For each meeting `m_xxx`:

| File | Shape | Who reads it |
|---|---|---|
| `data/ai-cache/m_xxx.json` | exactly `MeetingSummary` from `docs/CONTRACT.md` | the website |
| `data/ai-cache/m_xxx.candidates.json` | extras: summary points with no matching claim, new conflict candidates, unsourced claims, claims that contradict a doc | the team (e.g. #6) to review and promote into `data/seed/` by hand |

How the pieces fit:

- The model is shown the transcript **plus** the canonical claims, conflicts, Slack threads and docs from `data/seed/`. #6 owns those; the AI only references their ids.
- A summary point's `sourceIds` are copied from the claim it restates, not taken from the model. So a claim with `sourceIds: []` in `claims.json` shows the "No source" flag in the summary, on purpose.
- `conflictIds` only contains ids that exist in `conflicts.json`.
- Action items get ids like `ai_m_001_01`.

## Checks

- Model output is validated before it is trusted (shape, and that every id exists). If it fails, the model gets the problems back and one retry; after that the run fails for that meeting and writes nothing.
- `--validate` re-checks every cache file against the seed (dangling `claimId`/`sourceId`/`conflictId`/segment/person ids) and exits non-zero on errors. Run it after any seed change or hand edit. Warnings (e.g. a point with no sources) are for you to eyeball.

## If seed data changes

Re-run with `--force` for the affected meetings (or fix the JSON by hand), then `--validate`.
