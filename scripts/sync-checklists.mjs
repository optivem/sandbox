#!/usr/bin/env node

/**
 * Sync review checklists: scan sandbox-project.md files in each course module
 * and generate checklists/{courseId}/{NN}.md files from the "## Review Checklist"
 * section.
 *
 * Input  (source of truth): sandbox-project.md files in ../courses/{NN-courseId}/accelerator/course/{NN-module}/
 * Output (derived data)   : hub/checklists/{courseId}/{NN}.md
 *
 * Transformation: bullet lines starting with "- " become "- [ ]" checkboxes.
 * Other content (blank lines, **bold** section headers) is passed through.
 *
 * Usage: node scripts/sync-checklists.mjs [courses-root]
 *   courses-root defaults to ../courses (relative to hub repo root)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const coursesRoot = resolve(process.argv[2] || join(ROOT, "..", "courses"));

const COURSES = [
  { id: "pipeline", coursePath: join(coursesRoot, "01-pipeline", "accelerator", "course") },
  { id: "atdd",     coursePath: join(coursesRoot, "02-atdd",     "accelerator", "course") },
];

function extractReviewChecklist(markdown) {
  const match = markdown.match(/## Review Checklist\s*\n([\s\S]*?)(?=\n## |\n---|$)/);
  if (!match) return null;

  const lines = match[1].replace(/\s+$/, "").split("\n");
  const out = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    // Bullet → checkbox (preserve leading indent).
    const bullet = line.match(/^(\s*)-\s+(.*)$/);
    if (bullet) {
      out.push(`${bullet[1]}- [ ] ${bullet[2]}`);
      continue;
    }
    // Pass through other content (bold headers, etc.)
    out.push(line);
  }
  // Collapse leading/trailing blanks.
  while (out.length && out[0] === "") out.shift();
  while (out.length && out[out.length - 1] === "") out.pop();
  return out.join("\n") + "\n";
}

function scanModules(coursePath) {
  const dirs = readdirSync(coursePath)
    .filter(d => /^\d{2}-/.test(d) && !d.includes("DRAFT") && !d.includes("guide") && statSync(join(coursePath, d)).isDirectory())
    .sort();

  const results = [];
  for (const dir of dirs) {
    const moduleDir = join(coursePath, dir);
    const sandboxFile = readdirSync(moduleDir).find(f => f.includes("sandbox-project") && f.endsWith(".md"));
    if (!sandboxFile) continue;

    const content = readFileSync(join(moduleDir, sandboxFile), "utf-8");
    const checklist = extractReviewChecklist(content);
    if (!checklist) {
      console.warn(`  [skip] ${dir}: sandbox-project.md has no "## Review Checklist" section`);
      continue;
    }

    results.push({ number: dir.slice(0, 2), checklist });
  }
  return results;
}

for (const { id: courseId, coursePath } of COURSES) {
  if (!existsSync(coursePath)) {
    console.log(`Skipping ${courseId}: course path not found at ${coursePath}`);
    continue;
  }

  const outDir = join(ROOT, "checklists", courseId);
  mkdirSync(outDir, { recursive: true });

  // Remove existing generated files (NN.md only — leave non-numeric files alone).
  for (const f of readdirSync(outDir).filter(f => /^\d{2}\.md$/.test(f))) {
    unlinkSync(join(outDir, f));
  }

  const modules = scanModules(coursePath);
  for (const m of modules) {
    writeFileSync(join(outDir, `${m.number}.md`), m.checklist);
  }

  console.log(`${courseId}: ${modules.length} checklist files written to checklists/${courseId}/`);
}
