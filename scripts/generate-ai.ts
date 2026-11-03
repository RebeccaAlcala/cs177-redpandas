// Generates data/ai-cache/<meetingId>.json for each seed meeting.
//
//   npx tsx scripts/generate-ai.ts                 all meetings that don't have a cache file yet
//   npx tsx scripts/generate-ai.ts m_001 m_002     just these
//   npx tsx scripts/generate-ai.ts --force         overwrite existing cache files (loses hand edits!)
//   npx tsx scripts/generate-ai.ts --dry-run       print the prompt, call nothing (no API key needed)
//   npx tsx scripts/generate-ai.ts --validate      check existing cache files against the seed, no API
//   npx tsx scripts/generate-ai.ts --model=<id>    override the model (or set ANTHROPIC_MODEL)
//
// The key goes in a local, gitignored .env at the repo root: ANTHROPIC_API_KEY=sk-ant-...

import fs from "fs";
import path from "path";
import { loadSeed, buildContext } from "../lib/ai/seed";
import { SYSTEM_PROMPT, buildUserPrompt } from "../lib/ai/prompts";
import { validateSummary } from "../lib/ai/validate";
import {
  DEFAULT_MODEL,
  generateForMeeting,
  writeOutputs,
  summaryPath,
} from "../lib/ai/generate";

// Tiny .env loader so nobody needs a dotenv dependency. Real env vars win.
function loadEnvFile(): void {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || line.trim().startsWith("#")) continue;
      if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  } catch {
    // no .env is fine (e.g. --dry-run / --validate)
  }
}

function validateAll(ids: string[]): number {
  const seed = loadSeed();
  let failed = 0;
  for (const id of ids) {
    const file = summaryPath(id);
    if (!fs.existsSync(file)) {
      console.log(`✗ ${id}: no cache file at data/ai-cache/${id}.json`);
      failed++;
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      console.log(`✗ ${id}: not valid JSON (${(err as Error).message})`);
      failed++;
      continue;
    }
    const { errors, warnings } = validateSummary(parsed, seed, id);
    console.log(`${errors.length ? "✗" : "✓"} ${id}`);
    errors.forEach((e) => console.log(`    error:   ${e}`));
    warnings.forEach((w) => console.log(`    warning: ${w}`));
    if (errors.length) failed++;
  }
  return failed;
}

async function main(): Promise<void> {
  loadEnvFile();
  const args = process.argv.slice(2);
  const flag = (name: string) => args.includes(`--${name}`);
  const modelArg = args.find((a) => a.startsWith("--model="))?.slice("--model=".length);
  const model = modelArg ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const seed = loadSeed();
  const requested = args.filter((a) => !a.startsWith("--"));
  const ids = requested.length ? requested : seed.meetings.map((m) => m.id);
  if (ids.length === 0) {
    console.error("No meetings found in data/seed/meetings.json.");
    process.exit(1);
  }

  if (flag("validate")) {
    const failed = validateAll(ids);
    console.log(failed ? `\n${failed} of ${ids.length} meeting(s) need attention.` : `\nAll ${ids.length} cache file(s) valid.`);
    process.exit(failed ? 1 : 0);
  }

  if (flag("dry-run")) {
    for (const id of ids) {
      console.log(`===== ${id}: SYSTEM =====\n${SYSTEM_PROMPT}\n\n===== ${id}: USER =====\n${buildUserPrompt(buildContext(seed, id))}\n`);
    }
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set. Put it in .env at the repo root (gitignored), or export it.");
    process.exit(1);
  }

  console.log(`Model: ${model}`);
  let failed = 0;
  for (const id of ids) {
    if (!flag("force") && fs.existsSync(summaryPath(id))) {
      console.log(`- ${id}: cache exists, skipping (use --force to overwrite)`);
      continue;
    }
    try {
      console.log(`- ${id}: generating...`);
      const { summary, candidates } = await generateForMeeting(seed, id, { apiKey, model, log: console.log });
      writeOutputs(summary, candidates);
      console.log(
        `  wrote data/ai-cache/${id}.json: ${summary.summaryPoints.length} points, ` +
          `${summary.actionItems.length} action items, ${summary.confusions.length} confusions, ` +
          `${summary.conflictIds.length} known conflicts`,
      );
      const extra = candidates.unmatchedPoints.length + candidates.conflictCandidates.length +
        candidates.unsourcedClaims.length + candidates.docContradictions.length;
      if (extra) console.log(`  ${extra} item(s) for review in data/ai-cache/${id}.candidates.json`);
    } catch (err) {
      failed++;
      console.error(`  FAILED ${id}: ${(err as Error).message}`);
    }
  }

  console.log("\nChecking cache against the seed...");
  const invalid = validateAll(ids.filter((id) => fs.existsSync(summaryPath(id))));
  process.exit(failed || invalid ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
