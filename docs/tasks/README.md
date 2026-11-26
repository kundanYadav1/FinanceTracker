# FinanceTracker — Implementation Task Plan (Phase 3: TASK)

> **Plan status: PROVISIONAL.** Execution gate **G0 is closed**. The PRS v1.1 final re-review is not recorded ([OD-01](../design/open-decisions.md#od-01)), every Phase 2 design document is marked *Provisional*, and ADR-0001 – ADR-0012 are *Proposed*. No task in this plan may be executed until G0 passes. See [master-task-plan.md §10](master-task-plan.md#10-external-blockers-and-approval-gates).

This directory turns the Phase 2 design (`docs/design/`) into small, dependency-ordered implementation tasks for AI coding agents.

## How to read this plan

| Document | Purpose |
|---|---|
| [master-task-plan.md](master-task-plan.md) | Overview, phases, features, task counts, critical sequence, milestones, risks, blockers |
| [task-registry.md](task-registry.md) | Every task ID with phase, priority, dependencies and status (the single status board) |
| [dependency-graph.md](dependency-graph.md) | Mermaid dependency graphs, critical path, parallel groups, approval-gated tasks |
| [execution-roadmap.md](execution-roadmap.md) | Ordered execution waves, prerequisites, integration checkpoints, merge-conflict hotspots |
| [implementation-matrix.md](implementation-matrix.md) | Every PRS requirement → design → tasks → verification |
| [testing-matrix.md](testing-matrix.md) | Every task → required test levels and objective verification |
| [agent-execution-guide.md](agent-execution-guide.md) | How a coding agent picks up, executes, verifies and reports a task; change management |
| [design-gaps.md](design-gaps.md) | Gaps found while planning (DG-xx); not fixed here, reported for DESIGN |
| [deferred-backlog.md](deferred-backlog.md) | Reserved IDs for MVP+ / deferred work that has no approved specification |
| [phase-3-review.md](phase-3-review.md) | Final Phase 3 consistency review and planning report |

Task documents:

| Directory | Phase | Tasks |
|---|---|---|
| [phase-04-foundation/](phase-04-foundation/) | 4 — Application Foundation | TASK-401 – TASK-424 |
| [phase-05-transactions/](phase-05-transactions/) | 5 — Transaction Management | TASK-501 – TASK-512 |
| [phase-06-dashboard-analytics/](phase-06-dashboard-analytics/) | 6 — Dashboard & Analytics | TASK-601 – TASK-608 |
| [phase-07-budget-savings/](phase-07-budget-savings/) | 7 — Budgets & Savings Goals | TASK-701 – TASK-716 |
| [phase-08-recommendations/](phase-08-recommendations/) | 8 — Recommendation Engine | TASK-801 – TASK-811 |
| [phase-09-security-release/](phase-09-security-release/) | 9 — Security, Backup & Release | TASK-901 – TASK-917 |

## Conventions

- **Task IDs are stable.** They are never reused or renumbered. Retired tasks keep their file with status `DEFERRED` or a "Superseded by" note ([agent-execution-guide §8](agent-execution-guide.md#8-change-management)).
- **Design references** use the abbreviations from [requirements-traceability](../design/requirements-traceability.md): SA, DB, NAV, UX, BL, RE, ST, SEC, TS, DEP, OD, ADR.
- **Paths** come from [SA §B.2](../design/system-architecture.md#b2-proposed-source-tree) and [NAV §B](../design/navigation-design.md#b-route-structure-proposed). A file-level path that the design does not name exactly is marked *(proposed path)* in the task.
- **Statuses:** `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `DONE`, `DEFERRED`. Only the executing agent changes a status, and only according to the agent execution guide.
