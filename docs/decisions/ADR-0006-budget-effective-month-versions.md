# ADR-0006 — Budgets as effective-from-month versions

**Status:** Proposed (2026-11-06)

## Context
FR-008.1 – FR-008.5 require:
- budgets per calendar month
- one overall budget, and at most one budget per category per month
- a budget carries forward until it is changed
- a change affects the current month and later months only
- past months keep the amount they had
- unspent budget does not carry over

## Decision
Use a single table, `budget_versions(scope_key, effective_from_month, amount_minor)`, with `UNIQUE(scope_key, effective_from_month)`. A NULL `amount_minor` means the budget was removed from that month.

- **Amount in effect for month M:** the latest version with `effective_from_month ≤ M`.
- **Create or change:** upsert the version for the current month.
- **Remove:** write a NULL version for the current month. If there is no earlier history, delete the current-month row instead.
- **Spending:** always computed from transactions.

## Alternatives
- **One row per budget per month (materialized monthly):** needs a job to roll budgets forward, which is fragile in an app that may go unopened for months.
- **A mutable budget row plus an audit log:** history is harder to reconstruct, and past-month reporting is error-prone.
- **Start/end-date periods (the draft approach):** allows overlapping and custom periods, which the PRS forbids.

## Consequences
- \+ History is exact by construction, no background job is needed, and overlaps are impossible.
- \+ The data needed for the MVP+ budget-performance report already exists.
- − The resolution query needs a GROUP BY. It is cheap because of the unique index.
