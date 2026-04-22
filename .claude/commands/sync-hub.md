Run all hub sync scripts to regenerate data derived from the courses repo.

Execute the following from the hub repo root:

```bash
cd "$(git rev-parse --show-toplevel)" && node scripts/sync.mjs
```

This runs:
1. `sync-course-structure.mjs` → `config/courses/*.json` (modules + milestones)
2. `sync-checklists.mjs` → `checklists/{courseId}/{NN}.md`
3. `sync-issue-template.mjs` → `.github/ISSUE_TEMPLATE/review-request.yml`
4. `sync-student-urls.mjs` → `config/courses/*.json` url fields (from `courses/generated/student-urls.json`, if present)

The dashboard (`docs/index.html`) is built and deployed in CI by `.github/workflows/dashboard.yml` — it is not regenerated locally.

Student-view URL *scraping* is a separate manual step owned by the courses repo — run it only when Thinkific lessons change:

```bash
cd "$(git rev-parse --show-toplevel)/../courses/tools" && npx tsx scrape-student-urls.ts
```

That writes `courses/generated/student-urls.json`, which `/sync-hub` then reads.

After the sync:

1. Read `hub/config/courses/*.json` and flag any milestones with empty `url` fields.
2. Report a summary:
   - Modules and milestones synced per course
   - Checklist files generated per course
   - Issue template: projects / courses / modules counts
   - Student URLs: modules/milestones matched per course (or "skipped" if scrape JSON missing)
   - Unmatched milestones (empty URL fields)
3. Ring the terminal bell when done:
   ```
   powershell -command "[console]::beep(300, 150); Start-Sleep -Milliseconds 80; [console]::beep(380, 150); Start-Sleep -Milliseconds 80; [console]::beep(460, 150); Start-Sleep -Milliseconds 80; [console]::beep(520, 400)"
   ```

Do NOT commit the changes — follow the post-task workflow and use `/commit` separately.
