# Optivem Hub

**[Dashboard](https://optivem.github.io/hub/)**

[![dashboard](https://github.com/optivem/hub/actions/workflows/dashboard.yml/badge.svg)](https://github.com/optivem/hub/actions/workflows/dashboard.yml)

Optivem Academy — project submissions, reviews, and discussions

[Submit a Review Request](https://github.com/optivem/hub/issues/new/choose)

## How to submit your project for review

1. Click [**Submit a Review Request**](https://github.com/optivem/hub/issues/new/choose)
2. Select your project
3. Select the module
4. Submit the issue
5. When you're ready for review, add a comment on the issue

## Status tracking

All statuses are updated automatically — you don't need to change them manually.

| Status | Meaning |
|--------|---------|
| **Open** | Ticket created, waiting for you to submit for review |
| **In Review** | You've commented, waiting for reviewer |
| **In Progress** | Reviewer is working on feedback |
| **Done** | Review complete, ticket closed |

### Status transitions

```
                 ┌─────────────────────────────────────┐
                 │                                     │
                 ▼                                     │
  Issue created ──→ Open                               │
                    │                                  │
                    │ Student comments                 │
                    ▼                                  │
                 In Review                             │
                    │                                  │
                    ├── Reviewer comments ──→ In Progress
                    │                           │
                    │                           │ Student comments
                    │                           │
                    │                           └──→ In Review
                    │
                    └── Reviewer closes ──→ Done
```

### Trigger rules

| Event | Who | Result |
|-------|-----|--------|
| Issue created | Student | Status → **Open** |
| Comment | Student | Reopen if closed; status → **In Review** |
| Comment | Reviewer | Status → **In Progress** (skipped if closing) |
| Close | Reviewer | Status → **Done** |
| Close | Student | Auto-reopened with comment (students cannot close tickets) |
| Reopen | Anyone (no comment) | Status → **Open** |
| Reopen | Anyone (with comment) | Handled by comment rules above |

When you've addressed feedback, add a comment on your issue describing what you changed. The status will automatically move back to **In Review**.

## For Teachers

[Project Board](https://github.com/orgs/optivem/projects/18)

## Refresh

[Refresh Dashboard](https://github.com/optivem/hub/actions/workflows/dashboard.yml)
