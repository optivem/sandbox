#!/usr/bin/env node

/**
 * Sync all sandbox data derived from the courses repo.
 * Runs the local sync scripts in order:
 *
 *   1. sync-course-structure.mjs  → config/courses/*.json (modules + milestones)
 *   2. sync-checklists.mjs        → checklists/{courseId}/{NN}.md
 *   3. sync-issue-template.mjs    → .github/ISSUE_TEMPLATE/review-request.yml
 *   4. sync-student-urls.mjs      → config/courses/*.json (url fields, from courses/generated/student-urls.json)
 *
 * Student-view URL *scraping* lives in the courses repo
 * (`courses/tools/scrape-student-urls.ts`) because it needs Playwright
 * + interactive login. Run that script separately when URLs change; its
 * output is committed as `courses/generated/student-urls.json` and this
 * orchestrator applies it to the sandbox configs.
 *
 * The dashboard (docs/index.html) is built and deployed in CI by
 * .github/workflows/dashboard.yml — it is not regenerated here.
 *
 * Usage: node scripts/sync.mjs
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run(label, moduleFile) {
  console.log(`\n── ${label} ──`);
  await import(pathToFileURL(join(__dirname, moduleFile)).href);
}

await run("Course structure",   "./sync-course-structure.mjs");
await run("Review checklists",  "./sync-checklists.mjs");
await run("Issue template",     "./sync-issue-template.mjs");
await run("Student URLs",       "./sync-student-urls.mjs");
