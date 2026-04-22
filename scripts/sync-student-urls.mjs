#!/usr/bin/env node

/**
 * Apply student view URLs (Thinkific) from the scraped JSON produced by
 * the courses repo (`courses/generated/student-urls.json`) into
 * `config/courses/*.json`.
 *
 * Input:  ../courses/generated/student-urls.json
 * Output: config/courses/*.json (url fields)
 *
 * Courses publishes the raw scrape; sandbox does the mapping into its
 * own config schema. No cross-repo writes.
 *
 * Usage: node scripts/sync-student-urls.mjs [student-urls-json]
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const THINKIFIC_BASE = "https://optivem.thinkific.com";

const urlsJsonPath = resolve(
  process.argv[2] ||
  join(ROOT, "..", "courses", "generated", "student-urls.json")
);

function normalizeForMatch(s) {
  return s.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

function matchChapterToModule(chapterTitle, moduleNumber) {
  const m = chapterTitle.match(/^(\d+)\.\s*/);
  return m ? Number.parseInt(m[1], 10) === Number.parseInt(moduleNumber, 10) : false;
}

function matchLessonToMilestone(lessonTitle, milestoneName) {
  return normalizeForMatch(lessonTitle) === normalizeForMatch(milestoneName);
}

if (existsSync(urlsJsonPath)) {
  const scraped = JSON.parse(readFileSync(urlsJsonPath, "utf-8"));
  const coursesConfigDir = join(ROOT, "config", "courses");
  const entries = readdirSync(coursesConfigDir)
    .filter(f => f.endsWith(".json"))
    .sort()
    .map(f => ({ filename: f, course: JSON.parse(readFileSync(join(coursesConfigDir, f), "utf-8")) }));

  for (const { filename, course } of entries) {
    if (!course.courseSlug) continue;

    const chapters = scraped[course.courseSlug];
    if (!chapters) {
      console.log(`  ${course.courseSlug}: no scraped data — leaving URLs untouched.`);
      continue;
    }

    let matchedModules = 0;
    let matchedMilestones = 0;
    let unmatchedMilestones = 0;

    for (const module of course.modules) {
      const chapter = chapters.find(ch => matchChapterToModule(ch.title, module.number));
      if (!chapter) {
        console.log(`  ${course.courseSlug}: no chapter match for module ${module.number} - ${module.name}`);
        continue;
      }
      matchedModules++;

      if (chapter.lessons.length > 0) {
        module.url = `${THINKIFIC_BASE}${chapter.lessons[0].path}`;
      }

      const milestoneLessons = chapter.lessons.slice(1);
      for (const milestone of module.milestones) {
        const lesson = milestoneLessons.find(l => matchLessonToMilestone(l.title, milestone.name));
        if (lesson) {
          milestone.url = `${THINKIFIC_BASE}${lesson.path}`;
          matchedMilestones++;
        } else {
          unmatchedMilestones++;
        }
      }
    }

    writeFileSync(join(coursesConfigDir, filename), JSON.stringify(course, null, 2) + "\n", "utf-8");
    console.log(`  ${course.courseSlug}: ${matchedModules} modules, ${matchedMilestones} milestones matched, ${unmatchedMilestones} unmatched → ${filename}`);
  }
} else {
  console.log(`Skipping: ${urlsJsonPath} not found. Run scrape-student-urls in the courses repo first.`);
}
