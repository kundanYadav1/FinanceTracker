# TASK-905 — JSON export schema and snapshot builder

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-905
- **Task Name:** Export format (Zod schema, `formatVersion` 1) and consistent snapshot builder
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.3 Backup (export)
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-412, TASK-413, TASK-501, TASK-503, TASK-702, TASK-710
- **Blocks:** TASK-906
- **PRS References:** FR-022, FR-022.1, FR-024, FR-023 (format prepared for future restore), NFR-001, §34
- **Design References:** SEC §6 steps 2 and 5 (JSON shape, chunking), SA §C "Backup & Restore", DEP §1 (zod), TS §4 #11

## 1. Objective

Produce a complete, versioned JSON export of all user data from one consistent read snapshot, with money as integer minor units, validated by a schema a future restore can reuse.

## 2. Background and Context

SEC §6 gives the JSON shape: `format: "financetracker-export"`, `formatVersion: 1`, `schemaVersion`, `exportedAt`, `appVersion`, `profile`, `categories`, `paymentMethods`, `transactions`, `budgetVersions`, `savingsGoals` (and goal balance events if OD-09 adopted — include them so the export can reconstruct goals' history). FR-023 restore is deferred; this task does not implement import.

## 3. Requirements

1. `domain/export/schema.ts` *(proposed path)*: Zod schema for the full document; money fields are integers + currency strings.
2. `exportRepo.readSnapshot(db)` in one read transaction → typed rows for every table (`exportRepo` named in SA §B.2).
3. `buildExport(snapshot, meta)` → `ExportDocument`; `serializeExport(doc)` → string built in chunks (e.g. transactions serialised in batches of 1,000 with `await` yields) to avoid blocking UI (SEC §6.5).
4. Never includes derived values (totals, statuses, recommendations).

## 4. Scope

### Included
- Schema, repository snapshot, builder, chunked serializer, tests.

### Excluded
- File writing and sharing (TASK-906). Restore/validation of imports (deferred TASK-993).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/export/schema.ts` | CREATE *(proposed path)* | Export schema |
| `src/data/repositories/exportRepo.ts` | CREATE | Snapshot read |
| `src/features/data-export/services/exportBuilder.ts` | CREATE *(proposed path)* | Build + serialize |
| `src/features/data-export/index.ts` | CREATE | Public API |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Test with a fixture covering every table; parse the serialized output back and validate with the schema.

## 7. Dependencies

- TASK-412/413, TASK-501, TASK-503, TASK-702, TASK-710 (row types).

## 8. Acceptance Criteria (TS §4 #11)

- [ ] Output validates against the schema.
- [ ] All money values are integers with currency.
- [ ] Record counts equal DB counts for every table.
- [ ] 50,000-transaction fixture serialises without a single synchronous block > 100 ms *(proposed measure; checked with a timing test that yields between chunks)*.

## 9. Testing Requirements

- **Unit Tests:** schema, builder.
- **Integration Tests:** snapshot + build on real SQLite.

## 10. Verification Commands

```bash
npx jest src/domain/export src/data/repositories/exportRepo src/features/data-export
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Export file is unencrypted by design (FR-022.2 warning in TASK-906).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
