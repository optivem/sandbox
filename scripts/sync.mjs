#!/usr/bin/env node

/**
 * Sync all sandbox data derived from the courses repo.
 * Runs the local sync scripts in order:
 *
 *   1. sync-course-structure.mjs  → config/courses/*.json (modules + milestones)
 *   2. sync-checklists.mjs        → checklists/{courseId}/{NN}.md
 *   3. sync-issue-template.mjs    → .github/ISSUE_TEMPLATE/review-request.yml
 *   4. sync-student-urls.mjs      → config/courses/*.json (url fields, from courses/generated/student-urls.json)
 *   5. generate-dashboard.mjs     → docs/index.html (requires GITHUB_TOKEN/OWNER/REPO)
 *
 * Student-view URL *scraping* lives in the courses repo
 * (`courses/tools/scrape-student-urls.ts`) because it needs Playwright
 * + interactive login. Run that script separately when URLs change; its
 * output is committed as `courses/generated/student-urls.json` and this
 * orchestrator applies it to the sandbox configs.
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

if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
  await run("Dashboard",        "./generate-dashboard.mjs");
} else {
  console.log(`\n── Dashboard ──`);
  console.log("Skipped: set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO to include dashboard regeneration.");
  console.log("Tip: GITHUB_TOKEN=$(gh auth token) GITHUB_OWNER=optivem GITHUB_REPO=sandbox node scripts/sync.mjs");
}
