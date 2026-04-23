# Dashboard Retirement

Retire the public HTML dashboard at `optivem.github.io/hub/`. All hub usage is internal (cohort members only) — no external visibility need. Learners and reviewers will work directly from the GitHub Project board.

**Context / decision drivers** (2026-04-23):
- Hub is internal-only; public Pages hosting has no audience.
- Hub-privacy cutover on 2026-07-02 would require GitHub Enterprise Cloud to keep Pages working on a private repo.
- GitHub Projects field-based views (Course / Sandbox Project / Module / Status) cover the functional needs now that Phase 2 of the field migration is verified.
- URL prefill for issue-form dropdowns is unreliable (`default: 0` + placeholder blocks it), so the dashboard's "+" prefill value was limited anyway.

**Not in scope:** Discussions setup and issue-template placeholder cleanup — explicitly parked.

Processing rule: remove each item from this file as it is executed; delete the file when empty; delete the `plans/` directory when empty.

---

## Submission flow handover

- [ ] Update [docs/submission-guide.md](../hub/docs/submission-guide.md) steps 1–3 to instruct learners to open the Project board → "+ Add item" → pick the sandbox-review template → submit. Remove all dashboard references.
- [ ] Communicate the change to current learners via the existing group-chat channel (no Announcements category yet).

## Code + workflow deletion

- [ ] Delete [scripts/generate-dashboard.mjs](../hub/scripts/generate-dashboard.mjs)
- [ ] Delete [scripts/dashboard-template.html](../hub/scripts/dashboard-template.html)
- [ ] Delete [scripts/dashboard.css](../hub/scripts/dashboard.css)
- [ ] Delete [.github/workflows/dashboard.yml](../hub/.github/workflows/dashboard.yml)

`scripts/load-config.mjs` and `scripts/load-config.cjs` are SHARED with sync scripts and composite actions — **do not delete**.

## docs/ folder

The dashboard workflow uploads `./docs/` as the Pages artifact. After retirement, `docs/` keeps its markdown content (`submission-guide.md`, `nda-compliance.md`, `starter/`) but is no longer Pages-bound.

- [ ] Confirm no regenerated `docs/index.html` is lingering; delete it if present.
- [ ] Decide whether `docs/` stays in place as a plain-markdown folder, or whether its contents move to a top-level location (e.g. `guides/`). Default: leave in place.

## Repository settings

- [ ] Disable GitHub Pages for `optivem/hub` (Settings → Pages → Source = None).
- [ ] Confirm `optivem.github.io/hub/` returns 404 after deploy deletion propagates.

## Verification

- [ ] After the above, create one test submission directly on the Project board to confirm the flow works end-to-end (template chooser → issue created → `auto-on-created` populates fields).
