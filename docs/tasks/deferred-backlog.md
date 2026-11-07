# Deferred Backlog (reserved task IDs)

**Status of every item: DEFERRED.** None of these may be implemented in the MVP (PRS §5.1: "A requirement not listed as MVP shall not be implemented in the MVP"). Each needs its own SPEC → DESIGN before a task document is written. IDs are reserved so numbering stays stable; when an item is approved, its task document is created under the listed ID (split into new IDs from the same phase range if larger than one task).

| Reserved ID | Item | PRS status | Prerequisite before planning | Design material already available | MVP hooks already planned |
|---|---|---|---|---|---|
| TASK-590 | Recurring transaction schedules | FR-020 **MVP+** | FR-020 specification (generation mode, catch-up, duplicates, day 29–31, edit/delete effects) | DB §H (provisional `recurring_rules`, unique occurrence index, catch-up loop), TS §2 recurring row | `is_recurring` flag stored but read by nothing (TASK-412, 502) |
| TASK-591 | Custom category management | FR-004 custom **MVP+** | MVP+ approval; spending-class editing rules | DB §B.2 (`archived_at`, `is_system`) | Columns exist in baseline schema (TASK-412) |
| TASK-690 | Trend & history reports (savings trend, budget performance history, goal progress history) | FR-018.2 **MVP+** | MVP+ approval; chart-library decision (DEP §4) | Budget history kept in `budget_versions`; goal history only if OD-09 adopted | `monthlyTotals` aggregate (TASK-601) reusable |
| TASK-890 | `GOAL-EXPIRED` recommendation | Not in PRS (OD-08 proposed extension) | OD-08 approval | RE §C.7 | Expired tracking state computed (TASK-709) |
| TASK-891 | Recurring expense analysis (`RECUR-HIGH`, dedicated subscription rule) | FR-012 recurring input **MVP+** | TASK-590 | RE §B row 7, §C.7 | Subscriptions covered by `ANOM-DISC` in MVP (TASK-805) |
| TASK-990 | App lock, biometrics, app-switcher privacy cover | FR-025 app lock **MVP+** | App-lock specification | SEC §5 (architecture sketch) | `expo-secure-store` kept installed (TASK-403) |
| TASK-991 | Database encryption (SQLCipher) | **Deferred** (own spec, §5.1, §35) | Encryption specification; key-loss policy; export-compliance | SEC §3, ADR-0012 | Single `openDatabase()` (TASK-409) |
| TASK-992 | CSV export | FR-022.3 **MVP+** | MVP+ approval; column spec | — | Export snapshot builder (TASK-905) reusable |
| TASK-993 | JSON restore + backup validation | FR-023 **Deferred** | Restore specification (merge vs replace, reject unknown/newer `formatVersion`) | SEC §6 (versioned format) | Export Zod schema (TASK-905) designed for reuse |
| TASK-994 | Local notifications | FR-021 **MVP+** | Notification specification (permission timing, defaults, amounts on lock screen) | DEP §2 | `expo-notifications` removal/retention decided by OD-17 (TASK-403) |

Phase 9 items requested "if approved" — app lock, biometrics, database encryption, JSON restore, backup validation, notifications, CSV export — are **not approved** for the MVP and therefore appear only here.
