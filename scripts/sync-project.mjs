#!/usr/bin/env node

/**
 * Sync custom-field schema on the hub GitHub Project board (config.board).
 *
 * Reconciles these fields on the board:
 *   - Sandbox Project — options from config.projects (key — name)
 *   - Module          — options from the modules of every course in board.courses
 *   - Status          — options from config.statuses (names only; option IDs
 *                       are project-specific and looked up at runtime)
 *   - Course          — added only when the board covers more than one course
 *
 * This script only touches field *schema* (fields and their options). Field
 * values on items are set per-issue by `.github/actions/set-project-fields`.
 *
 * Safety:
 *   - Dry-run by default; pass --add to create missing fields/options.
 *   - This script never deletes. Extras (options on the board but not in
 *     config) are surfaced as warnings — delete via the UI if needed.
 *   - Renames are not supported: the diff cannot tell a rename from
 *     "delete old + add new", so handle renames manually via the UI.
 *
 * Usage:
 *   node scripts/sync-project.mjs           # dry-run
 *   node scripts/sync-project.mjs --add     # apply additions
 */

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./load-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const ADD = args.includes("--add");

const THROTTLE_MS = 750;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- GraphQL helper (uses gh's auth token) --------------------------------
const TOKEN = execSync("gh auth token", { encoding: "utf-8" }).trim();

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "GraphQL-Features": "projects_next_graphql",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors, null, 2)}`);
  }
  return json.data;
}

// --- Expected schema ------------------------------------------------------

const config = loadConfig(ROOT);

const STATUS_COLORS = {
  "Open":        "GRAY",
  "In Progress": "YELLOW",
  "In Review":   "PURPLE",
  "Done":        "GREEN",
};

function coursesForBoard(board) {
  const ids = board.courses || (board.courseId ? [board.courseId] : []);
  return ids.map((id) => config.courses.find((c) => c.id === id)).filter(Boolean);
}

function expectedFieldsFor(board) {
  const courses = coursesForBoard(board);
  if (courses.length === 0) return null;
  const multiCourse = courses.length > 1;

  const studentProjectOptions = config.projects.map((p) => ({
    name: `${p.key} — ${p.name}`,
    color: "BLUE",
    description: p.repo || "",
  }));

  const moduleOptions = [];
  for (const course of courses) {
    for (const m of course.modules || []) {
      moduleOptions.push({
        name: `${m.number} - ${m.name}`,
        color: "YELLOW",
        description: multiCourse ? course.name : "",
      });
    }
  }

  const statusOptions = (config.statuses || []).map((s) => ({
    name: s.name,
    color: STATUS_COLORS[s.name] || "GRAY",
    description: "",
  }));

  // Field creation order determines display order in the GitHub Projects UI.
  // Order: most general (Course) → most specific (Status).
  const fields = {};
  if (multiCourse) {
    fields["Course"] = courses.map((c) => ({
      name: c.id.toUpperCase(),
      color: "PURPLE",
      description: c.name,
    }));
  }
  fields["Sandbox Project"] = studentProjectOptions;
  fields["Module"] = moduleOptions;
  fields["Status"] = statusOptions;

  return fields;
}

// --- Reconcile one board --------------------------------------------------

async function fetchBoardFields(projectId) {
  const data = await gql(
    `query($projectId: ID!) {
       node(id: $projectId) {
         ... on ProjectV2 {
           title
           fields(first: 50) {
             nodes {
               ... on ProjectV2SingleSelectField {
                 id name
                 options { id name }
               }
               ... on ProjectV2FieldCommon {
                 id name dataType
               }
             }
           }
         }
       }
     }`,
    { projectId }
  );
  const nodes = data.node.fields.nodes;
  const byName = new Map();
  for (const f of nodes) if (f?.name) byName.set(f.name, f);
  return { title: data.node.title, byName };
}

async function createField(projectId, name, options) {
  return gql(
    `mutation($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
       createProjectV2Field(input: {
         projectId: $projectId,
         dataType: SINGLE_SELECT,
         name: $name,
         singleSelectOptions: $options
       }) {
         projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
       }
     }`,
    { projectId, name, options }
  );
}

async function addOptionToField(projectId, fieldId, existingOptions, newOption) {
  // GraphQL replaces the full option list on update — preserve existing names/colors.
  const merged = [
    ...existingOptions.map((o) => ({ name: o.name, color: o.color || "GRAY", description: "" })),
    newOption,
  ];
  return gql(
    `mutation($fieldId: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
       updateProjectV2Field(input: {
         fieldId: $fieldId,
         singleSelectOptions: $options
       }) {
         projectV2Field { ... on ProjectV2SingleSelectField { id name } }
       }
     }`,
    { fieldId, options: merged }
  );
}

function diffOptions(actualField, expectedOptions) {
  const actualNames = new Set((actualField.options || []).map((o) => o.name));
  const toAdd = expectedOptions.filter((o) => !actualNames.has(o.name));
  const extra = (actualField.options || []).filter(
    (o) => !expectedOptions.some((e) => e.name === o.name)
  );
  return { toAdd, extra };
}

async function createMissingField(board, fieldName, expectedOptions) {
  console.log(`  + field: ${fieldName} (${expectedOptions.length} options)`);
  for (const o of expectedOptions) console.log(`      ${o.name}`);
  if (ADD) {
    await createField(board.id, fieldName, expectedOptions);
    await sleep(THROTTLE_MS);
  }
}

async function addMissingOptions(board, fieldName, actualField, toAdd) {
  console.log(`  ~ field: ${fieldName} — adding ${toAdd.length} option(s):`);
  for (const o of toAdd) console.log(`      + ${o.name}`);
  if (!ADD) return;
  await addOptionToField(board.id, actualField.id, actualField.options, toAdd[0]);
  await sleep(THROTTLE_MS);
  // If multiple to add, do one-by-one so merge stays correct.
  for (let i = 1; i < toAdd.length; i++) {
    const current = await fetchBoardFields(board.id);
    const currentField = current.byName.get(fieldName);
    await addOptionToField(board.id, currentField.id, currentField.options, toAdd[i]);
    await sleep(THROTTLE_MS);
  }
}

function reportExtras(fieldName, extra) {
  console.log(`  ! field: ${fieldName} — ${extra.length} extra option(s) kept (not in config):`);
  for (const o of extra) console.log(`      ? ${o.name}`);
}

async function reconcileField(board, fieldName, expectedOptions, actualField) {
  if (!actualField) {
    await createMissingField(board, fieldName, expectedOptions);
    return { created: 1, optionsAdded: 0, skipped: 0 };
  }
  const { toAdd, extra } = diffOptions(actualField, expectedOptions);
  if (toAdd.length === 0 && extra.length === 0) {
    console.log(`  ok:    ${fieldName} (${expectedOptions.length} options)`);
    return { created: 0, optionsAdded: 0, skipped: 1 };
  }
  if (toAdd.length > 0) await addMissingOptions(board, fieldName, actualField, toAdd);
  if (extra.length > 0) reportExtras(fieldName, extra);
  return { created: 0, optionsAdded: toAdd.length, skipped: 0 };
}

async function reconcileBoard(board) {
  const expected = expectedFieldsFor(board);
  if (!expected) {
    console.log(`  SKIP: no courses resolved for board ${board.url || board.id}`);
    return { created: 0, optionsAdded: 0, skipped: 0 };
  }

  const actual = await fetchBoardFields(board.id);
  console.log(`\n── ${actual.title} (${board.url}) ──`);

  let created = 0, optionsAdded = 0, skipped = 0;
  for (const [fieldName, expectedOptions] of Object.entries(expected)) {
    const r = await reconcileField(board, fieldName, expectedOptions, actual.byName.get(fieldName));
    created += r.created;
    optionsAdded += r.optionsAdded;
    skipped += r.skipped;
  }
  return { created, optionsAdded, skipped };
}

// --- Main -----------------------------------------------------------------

const mode = ADD ? "ADD" : "DRY-RUN";
console.log(`=== sync-project (${mode}) ===`);

if (!config.board?.id) {
  console.log("No board configured in config/board.json (board.id is missing).");
  process.exit(1);
}

const { created, optionsAdded, skipped } = await reconcileBoard(config.board);

console.log(
  `\nSummary: +${created} field(s), +${optionsAdded} option(s), ${skipped} ok\n`
);

if (!ADD) {
  console.log("Dry-run only. Re-run with --add to create missing fields/options.\n");
}
