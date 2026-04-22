# 2026-04-22 — Rename `optivem/sandbox` → `optivem/reviews`

## Context

- **Current name**: `optivem/sandbox`. Misleading — "sandbox" in the Academy's domain means *student practice workspace*, but this repo is the instructor-side review coordination hub.
- **Target name**: `optivem/reviews`. Matches industry standard (Udacity's "Project Reviews" terminology) and the Academy's plural-collection naming convention (`actions`, `courses`). Chosen over `optivem/sandbox-reviews` on the student-perspective lens: students will share review links in portfolios / with employers, and `optivem/reviews/<name>` reads as a professional artifact where `sandbox-reviews` subtly frames their work as practice.
- **Broken state today**: the README and sync scripts already reference a nonexistent repo `optivem/atdd-bootcamp`. The rename is the opportunity to fix this drift in one pass.
- **Pages URL after rename**: `https://optivem.github.io/reviews/`.

## Inventory of references to update

Enumerated via grep across the full workspace. Totals:

| Location | Count | Notes |
|---|---|---|
| `sandbox/README.md` | 5 lines | Title + 4 URLs pointing at nonexistent `optivem/atdd-bootcamp` |
| `sandbox/docs/submission-guide.md` | 1 line | Dashboard URL |
| `sandbox/.github/workflows/auto-on-closed.yml` | 1 line | Dashboard URL in issue comment |
| `sandbox/.github/ISSUE_TEMPLATE/review-request.yml` | 1 line | Description mentions "sandbox project" — keep (student projects ARE sandboxes) |
| `sandbox/.github/actions/validate-issue/action.yml` | 1 line | Description mentions "sandbox project board" — keep |
| `sandbox/.claude/agents/sandbox-admin.md` | 4 lines (9, 24, 25, 33) | Hardcoded `optivem/sandbox` URLs; also consider renaming the agent itself |
| `courses/docs/plans/submission-pattern.md` | 5 lines (57, 61, 113, 137, 166) | Doc references |
| `courses/02-atdd/accelerator/course/*/0*-sandbox-project.md` | 15 files, 1 link each | Student submission links |
| `courses/01-pipeline/accelerator/course/*/0*-sandbox-project.md` | 5 files, 1 link each | Student submission links |
| `courses/.claude/agents/course-tester.md` | 1 line (178) | References `optivem/sandbox` URL pattern + local path `../../sandbox/docs/...` |
| `courses/tools/sync-bootcamp.ts` | 1 line (218) | Default path `"../atdd-bootcamp"` — targets a *different* repo (atdd-bootcamp), not sandbox/reviews; out of scope for this rename |
| `academy.code-workspace` | 1 line (16) | `"path": "sandbox"` |
| Claude harness `additionalWorkingDirectories` | (settings) | Contains `c:\GitHub\optivem\academy\sandbox` |

`sandbox/docs/index.html` is no longer tracked (gitignored; built and deployed by `dashboard.yml` via GitHub Pages Actions). After rename, the workflow will pass `reviews` as `GITHUB_REPO` and issue URLs will resolve correctly — no generator edits needed.

**Note on domain vocabulary**: the word "sandbox" as a student-project term stays everywhere. Only the `optivem/sandbox` repo slug and directory name change. E.g. "sandbox project" issue-template text, "04-sandbox-project.md" lesson filenames, `config/sandbox.json` config file — all remain.

## Execution order

Phases are sequenced so no reference is broken for more than a moment and GitHub's auto-redirect covers student traffic during the cutover.

### Phase 1 — Preflight

- [ ] Confirm clean git state in all affected repos: `sandbox`, `courses`, `claude`.
- [ ] Announce the rename to any reviewers currently mid-review (GitHub issue URLs change; browser bookmarks break).
- [ ] Verify no open PRs against `optivem/sandbox` (they'd need to be re-based after rename).

### Phase 2 — GitHub repo rename

- [ ] Rename on GitHub: `gh repo rename reviews -R optivem/sandbox`.
- [ ] Verify auto-redirect: `https://github.com/optivem/sandbox` should 301 → `https://github.com/optivem/reviews`.
- [ ] Verify Pages URL updated: `https://optivem.github.io/reviews/` should serve the dashboard. (GitHub automatically switches; the old `optivem.github.io/sandbox/` URL stops working.)
- [ ] Update local remote URL for the clone: `gh repo set-default optivem/reviews` (or re-point remote explicitly).

### Phase 3 — Local directory rename

- [ ] Close all editors/terminals/Claude sessions that reference `academy/sandbox`.
- [ ] Rename on disk: `academy/sandbox/` → `academy/reviews/`.
- [ ] Update `academy.code-workspace` line 16: `"path": "sandbox"` → `"path": "reviews"`.
- [ ] Update Claude harness `additionalWorkingDirectories` (in user-level Claude settings) — replace `c:\GitHub\optivem\academy\sandbox` with `c:\GitHub\optivem\academy\reviews`.
- [ ] Verify `/sync` skill still recognizes the renamed repo (check `check-actions-all` output).

### Phase 4 — In-repo content updates (inside `reviews/`)

**`README.md`**:

- [ ] Line 1: `# ATDD Bootcamp` → `# Optivem Reviews`.
- [ ] Line 3: `[ATDD Bootcamp Dashboard](https://optivem.github.io/atdd-bootcamp/)` → `[Reviews Dashboard](https://optivem.github.io/reviews/)`.
- [ ] Line 5: badge URL → `https://github.com/optivem/reviews/actions/workflows/dashboard.yml/badge.svg` and link target.
- [ ] Line 7: subtitle `ATDD Bootcamp - Sandbox Project Reviews` → `Optivem Academy — Sandbox Project Reviews` (keep "Sandbox Project" as domain term).
- [ ] Line 9: `github.com/optivem/atdd-bootcamp/issues/new/choose` → `github.com/optivem/reviews/issues/new/choose`.
- [ ] Line 13: same replacement.
- [ ] Line 67: verify and update Project Board link (`github.com/orgs/optivem/projects/18` — project number may need updating or staying the same).
- [ ] Line 71: `github.com/optivem/atdd-bootcamp/actions/workflows/dashboard.yml` → `github.com/optivem/reviews/actions/workflows/dashboard.yml`.

**`docs/submission-guide.md`**:

- [ ] Line 5: `https://optivem.github.io/sandbox/` → `https://optivem.github.io/reviews/`.

**`.github/workflows/auto-on-closed.yml`**:

- [ ] Line 32: `https://optivem.github.io/sandbox/` → `https://optivem.github.io/reviews/`.

**`.claude/agents/sandbox-admin.md`**:

- [ ] Replace `optivem/sandbox` → `optivem/reviews` on lines 9, 24, 25, 33.
- [ ] Decide on agent rename: `sandbox-admin` → `reviews-admin`? Recommended: **rename**, to match the new repo. If renaming, also update the `name:` frontmatter field and move/rename the file.

**Issue templates / actions** (no change needed):

- [ ] Confirm `.github/ISSUE_TEMPLATE/review-request.yml` description ("Submit your sandbox project for review") stays — "sandbox project" here refers to the *student's project*, not this repo.
- [ ] Confirm `.github/actions/validate-issue/action.yml` description stays for the same reason.

### Phase 5 — Cross-repo updates (`courses/` repo)

**Submission links in lesson files** (20 files total):

- [ ] Replace `https://github.com/optivem/sandbox/blob/main/docs/submission-guide.md` with `https://github.com/optivem/reviews/blob/main/docs/submission-guide.md` across:
  - `02-atdd/accelerator/course/01-getting-started/04-sandbox-project.md`
  - `02-atdd/accelerator/course/02-smoke-tests/05-sandbox-project.md`
  - `02-atdd/accelerator/course/03-e2e-tests/07-sandbox-project.md`
  - `02-atdd/accelerator/course/04-architecture-clients/10-sandbox-project.md`
  - `02-atdd/accelerator/course/05-architecture-drivers/07-sandbox-project.md`
  - `02-atdd/accelerator/course/06-architecture-channels/05-sandbox-project.md`
  - `02-atdd/accelerator/course/07-architecture-usecase-dsl/05-sandbox-project.md`
  - `02-atdd/accelerator/course/08-architecture-scenario-dsl/06-sandbox-project.md`
  - `02-atdd/accelerator/course/09-architecture-external-stubs/07-sandbox-project.md`
  - `02-atdd/accelerator/course/10-acceptance-tests/06-sandbox-project.md`
  - `02-atdd/accelerator/course/11-contract-tests/06-sandbox-project.md`
  - `02-atdd/accelerator/course/12-atdd-acceptance-criteria/06-sandbox-project.md`
  - `02-atdd/accelerator/course/13-atdd-acceptance-tests/05-sandbox-project.md`
  - `02-atdd/accelerator/course/14-atdd-contract-tests/05-sandbox-project.md`
  - `02-atdd/accelerator/course/15-structural-changes/04-sandbox-project.md`
  - `01-pipeline/accelerator/course/01-introduction/04-sandbox-project.md`
  - `01-pipeline/accelerator/course/02-commit-stage/08-sandbox-project.md`
  - `01-pipeline/accelerator/course/03-acceptance-stage/09-sandbox-project.md`
  - `01-pipeline/accelerator/course/04-qa-stage/05-sandbox-project.md`
  - `01-pipeline/accelerator/course/05-production-stage/06-sandbox-project.md`

**Doc references**:

- [ ] `docs/plans/submission-pattern.md` — 5 occurrences of `optivem/sandbox` → `optivem/reviews` (lines 57, 61, 113, 137, 166).
- [ ] `.claude/agents/course-tester.md` line 178 — update URL pattern reference `optivem/sandbox` → `optivem/reviews`, and local path `../../sandbox/docs/...` → `../../reviews/docs/...`.

**Tooling**:

- [ ] `tools/sync-bootcamp.ts` line 218: default `"../atdd-bootcamp"` — this targets a *different* repo (`atdd-bootcamp`), not sandbox/reviews, so it is **out of scope for the rename**. Separate decision required: is `atdd-bootcamp` still a valid target, or is `sync-bootcamp.ts` orphaned dead code?

### Phase 6 — GitHub Pages verification

- [ ] Visit `https://optivem.github.io/reviews/` — confirm dashboard renders.
- [ ] Visit old URL `https://optivem.github.io/sandbox/` — expected: 404 (GitHub does NOT redirect Pages URLs on repo rename; only the `github.com` URLs auto-redirect).
- [ ] If old URL is bookmarked externally (social, course materials, emails) — accept breakage, don't try to preserve the old Pages URL.

### Phase 7 — Verification

- [ ] Trigger `dashboard.yml` workflow manually in the renamed repo; confirm success.
- [ ] Create a test review-request issue; confirm auto-labeling workflows fire and the dashboard picks it up.
- [ ] Open a `sandbox-project.md` lesson in the courses repo; click the submission link; confirm it lands on the correct repo (`optivem/reviews`).
- [ ] Run `/sync-sandbox` (from the renamed `reviews/` repo); confirm it completes cleanly.

### Phase 8 — Commit & cleanup

- [ ] Commit `reviews/` changes via `/commit` skill.
- [ ] Commit `courses/` changes via `/commit` skill.
- [ ] Commit `claude/` changes (workspace file, this plan, harness settings) via `/commit` skill.
- [ ] Delete this plan file once all items above are done.
- [ ] Delete `reviews/plans/` directory if empty.

## Rollback

If the rename causes unforeseen breakage (e.g. a CI workflow that hardcodes the repo slug in a way `gh repo rename`'s redirect doesn't cover):

1. Rename back: `gh repo rename sandbox -R optivem/reviews`.
2. Revert the three commits in `reviews/`, `courses/`, `claude/`.
3. Local directory rename back: `academy/reviews/` → `academy/sandbox/`.

GitHub's `gh repo rename` is non-destructive — it preserves issues, PRs, stars, forks, workflows. The only one-way effect is the GitHub Pages URL, which GitHub does not redirect.

## Open questions

None — decisions already made in the conversation leading to this plan:

- Target name: `optivem/reviews` (not `sandbox-reviews`, not `academy`, not `gradebook`, not `classroom`).
- Fix stale `atdd-bootcamp` references as part of this rename.
- Keep "sandbox" as a domain term for student projects everywhere else.
