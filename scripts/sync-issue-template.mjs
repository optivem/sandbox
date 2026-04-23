#!/usr/bin/env node

/**
 * Sync the review-request issue template: generate
 * .github/ISSUE_TEMPLATE/review-request.yml from config/projects.json
 * and config/courses/*.json.
 *
 * Source of truth: config/ JSON files.
 * Output:          .github/ISSUE_TEMPLATE/review-request.yml
 *
 * Usage: node scripts/sync-issue-template.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadConfig } from "./load-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const config = loadConfig(ROOT);

const projectOptions = config.projects.map(p => `        - ${p.name}`).join("\n");
const courseOptions = config.courses.map(c => `        - ${c.name}`).join("\n");

const moduleOptions = config.courses.flatMap(c =>
  c.modules.map(m => `        - ${m.number} - ${m.name}`)
).join("\n");

const yaml = `name: "Module Review"
description: "Submit your sandbox project for review"
body:
  - type: dropdown
    id: project
    attributes:
      label: Project
      description: Select your project.
      options:
${projectOptions}
    validations:
      required: true
  - type: dropdown
    id: course
    attributes:
      label: Course
      description: Select the course you are submitting for.
      options:
${courseOptions}
    validations:
      required: true
  - type: dropdown
    id: module
    attributes:
      label: Module
      description: Select the module you are submitting for review.
      options:
${moduleOptions}
    validations:
      required: true
  - type: markdown
    attributes:
      value: |
        ## Review Checklist
        *This section will be auto-generated after submission.*
`;

const outPath = join(ROOT, ".github", "ISSUE_TEMPLATE", "review-request.yml");
writeFileSync(outPath, yaml, "utf-8");
console.log(`Wrote ${outPath}: ${config.projects.length} projects, ${config.courses.length} courses, ${config.courses.reduce((s, c) => s + c.modules.length, 0)} modules.`);
