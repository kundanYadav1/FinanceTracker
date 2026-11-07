# TASK-503 — Transaction repository: create, read, update, delete

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-503
- **Task Name:** Transaction repository CRUD (idempotent insert, full-replacement update, hard delete)
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.2 Transaction core
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-412, TASK-413, TASK-502
- **Blocks:** TASK-504, TASK-505, TASK-601, TASK-905
- **PRS References:** FR-002, FR-003, FR-026.1, FR-026.3, FR-026.4, NFR-002
- **Design References:** DB §B.4, §B.5 (hard delete), SA §D.1 (PK conflict = already saved), SA §D.2 (full replacement, change count 0 → NotFound), SA §D.3, TS §2 "CRUD", "Data integrity"

## 1. Objective

Persist transactions with exactly-once semantics per save action, full-replacement updates, and hard deletes, mapping rows to the domain type with read guards.

## 2. Background and Context

FR-026.4: one save action creates at most one record — the client `draftId` is the primary key, so a duplicate insert of the same ID is a no-op success (SA §D.1). SA §D.2: update replaces all user fields (clearing a note works) and fails with NotFound when 0 rows change.

## 3. Requirements

1. `insert(db, draft & { id, createdAt, updatedAt })` → `{ inserted: boolean }`: on PRIMARY KEY conflict for the same `id` return `inserted:false` (not an error). Use `INSERT … ON CONFLICT(id) DO NOTHING` and check `changes`.
2. `getById(db, id)` → `Transaction | null` with read guards (`readMinor`, `readCurrency`, `readLocalDate`).
3. `update(db, id, draft, updatedAt)` → `UPDATE … SET type, amount_minor, currency, category_id, payment_method_id, transaction_date, note, is_recurring, updated_at WHERE id=?`; `changes = 0` → returns `{ updated:false }` (service maps to `NotFoundError`). `id`/`created_at` never change.
4. `remove(db, id)` → `{ deleted: boolean }`.
5. All calls through `runRepo` with ops `transactions.insert|get|update|delete`.
6. Row mapper is exported for reuse by TASK-504/601.

## 4. Scope

### Included
- CRUD functions, mapper, DB tests.

### Excluded
- List/search/filter (TASK-504). Aggregates (TASK-601). Validation (TASK-502/505).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/repositories/transactionsRepo.ts` | CREATE | CRUD + mapper |
| `src/data/repositories/transactionsRepo.test.ts` | CREATE | DB tests |

## 6. Implementation Instructions

1. Use parameterised SQL only.
2. Tests use `createTestDb({ migrate: true })` and complete onboarding via `profileRepo` first (currency trigger).

## 7. Dependencies

- TASK-412 (schema), TASK-413 (helpers), TASK-502 (types).

## 8. Acceptance Criteria

- [ ] Same `id` inserted twice → one row; second call returns `inserted:false`.
- [ ] Update with `note: null` clears the note; `created_at` unchanged; `updated_at` changed.
- [ ] Update/delete of a missing id → `false` flags, no error.
- [ ] Expense ↔ income type change via update works when category/payment method are consistent; inconsistent → `PersistenceError DB_CONSTRAINT`.
- [ ] A failure in a multi-statement transaction leaves no partial rows (FR-026.3).
- [ ] Repository coverage ≥ 85 %.

## 9. Testing Requirements

- **Unit Tests:** mapper guard failures (non-integer amount injected via raw SQL bypass is impossible due to CHECK — test the guard with a mocked row).
- **Integration Tests (database):** all acceptance items.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/data/repositories/transactionsRepo
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- `transactionsRepo.ts` is extended by TASK-504 and TASK-601 — they must run after this task (file hotspot).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
