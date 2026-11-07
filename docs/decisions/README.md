# Architecture Decision Records

Format: number, title, status, context, decision, alternatives, consequences.
Status values: **Proposed** (awaiting design approval), **Accepted**, **Superseded by ADR-xxxx**, **Rejected**.
All ADRs below were written in Phase 2 (DESIGN) on 2026-11-06. They are **Proposed** until the design is approved ([OD-01](../design/open-decisions.md#od-01)).

| ADR | Title | Status | Linked open decision |
|---|---|---|---|
| [0001](ADR-0001-layered-feature-architecture.md) | Layered, feature-based architecture with a pure domain core | Proposed | — |
| [0002](ADR-0002-money-integer-minor-units.md) | Money as integer minor units with explicit currency | Proposed | — |
| [0003](ADR-0003-local-calendar-dates.md) | Financial dates as local calendar-date strings | Proposed | — |
| [0004](ADR-0004-sqlite-source-of-truth.md) | SQLite as the single source of truth; Zustand for UI state only | Proposed | — |
| [0005](ADR-0005-schema-rebaseline.md) | Re-baseline the draft database schema | Proposed | OD-14 |
| [0006](ADR-0006-budget-effective-month-versions.md) | Budgets as effective-from-month versions | Proposed | OD-10 |
| [0007](ADR-0007-recommendations-computed-on-demand.md) | Recommendations computed on demand, not persisted | Proposed | — |
| [0008](ADR-0008-single-transactions-table.md) | One transactions table for income and expense | Proposed | — |
| [0009](ADR-0009-migrations-user-version.md) | Forward-only migrations on `PRAGMA user_version` with pre-migration backup | Proposed | — |
| [0010](ADR-0010-navigation-five-tabs.md) | Five-tab navigation with Budgets as a tab | Proposed | OD-02 |
| [0011](ADR-0011-os-backup-exclusion.md) | Exclude the database from OS cloud backups | Proposed | OD-15 |
| [0012](ADR-0012-no-database-encryption-mvp.md) | No application-level database encryption in the MVP | Proposed | — |
