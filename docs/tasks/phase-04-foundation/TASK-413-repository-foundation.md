# TASK-413 — Repository foundation helpers

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-413
- **Task Name:** Repository foundation — error wrapping, read guards, row-mapping helpers
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.4 Database foundation
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-405, TASK-406, TASK-410, TASK-412
- **Blocks:** TASK-422, TASK-424, TASK-501, TASK-503, TASK-702, TASK-710, TASK-905
- **PRS References:** FR-026.3, FR-027.1, FR-027.3, §33, §34.2, NFR-003
- **Design References:** SA §B.1 row 4, SA §E.1 (`PersistenceError`, `IntegrityError`), SA §E.2 rule 2, DB §D.3 – D.4 (read guards, single-currency aggregates), ADR-0002

## 1. Objective

Give every repository one consistent way to run SQL, map SQLite failures to `PersistenceError` without leaking data, and validate values read back from the database before they reach the domain.

## 2. Background and Context

SA §E.2 rule 2: repositories wrap every SQLite call and rethrow `PersistenceError{code, context:{op, sqliteCode}}`. DB §D.4: every value read from SQL passes `assertSafeMinor`. DB §D.3: aggregates `GROUP BY currency`; more than one group is an `IntegrityError`.

## 3. Requirements

1. `runRepo<T>(op: string, fn: () => Promise<T>): Promise<T>` — catches any error, maps SQLite codes: `SQLITE_FULL` → `DB_FULL`; `SQLITE_CONSTRAINT*` → `DB_CONSTRAINT` (with the trigger message `CURRENCY_LOCKED`/`CURRENCY_MISMATCH` surfaced as the matching `BusinessRuleError`/`IntegrityError`); other write errors → `DB_WRITE_FAILED`; read errors → `DB_READ_FAILED` (caller declares `kind: 'read'|'write'`). `context` holds `op` and `sqliteCode` only.
2. Read guards: `readMinor(row, column)` → `assertSafeMinor`; `readCurrency(value)` → registry lookup or `IntegrityError('UNKNOWN_CURRENCY')`; `readLocalDate`, `readMonthKey` → domain parsers, failing with `IntegrityError`.
3. `singleCurrencyTotal(rows: {currency, total}[], expected)` → `Money` (0 when no rows) or `IntegrityError('CURRENCY_MISMATCH')` when more than one currency group or a group ≠ expected.
4. `withTransaction(db, op, fn)` = `runRepo(op, () => db.withTransactionAsync(fn))`.
5. Helpers are generic; no table-specific code.

## 4. Scope

### Included
- `base.ts` helpers and tests using the real SQLite adapter (provoke constraint, FK and trigger failures on the v1 schema).

### Excluded
- Concrete repositories (TASK-422, 501, 503, …).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/repositories/base.ts` | CREATE *(proposed path)* | `runRepo`, `withTransaction`, read guards, `singleCurrencyTotal` |
| `src/data/repositories/base.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Determine the SQLite error-code shape from both adapters (expo-sqlite message/`code`, node:sqlite `errcode`) and normalise in one function `sqliteCodeOf(error)`.
2. Use the logger once per mapped error (`logger.error(appError)`); do not log in services as well for the same error (SA §E.2 rule 3 says services log — choose **one** place: repositories do **not** log; services log). Document this in a header comment.
3. Sentinel test: a failing insert carrying amount `987654321` and note `SENTINEL_NOTE` produces a `PersistenceError` whose `message`, `context` and serialised form contain neither.

## 7. Dependencies

- TASK-405 (errors), TASK-406 (`assertSafeMinor`, registry), TASK-410 (real engine), TASK-412 (schema to provoke real constraint errors).

## 8. Acceptance Criteria

- [ ] FK violation → `PersistenceError` code `DB_CONSTRAINT`, `context.op` set, `context.sqliteCode` set.
- [ ] Trigger `CURRENCY_LOCKED` → `BusinessRuleError('CURRENCY_LOCKED')`.
- [ ] Simulated `SQLITE_FULL` → `DB_FULL`.
- [ ] Reading a row with `amount_minor = 2^53` → `IntegrityError('UNSAFE_INTEGER')`.
- [ ] Two currency groups → `IntegrityError('CURRENCY_MISMATCH')`; zero groups → `Money` 0.
- [ ] Sentinel values never appear in errors.

## 9. Testing Requirements

- **Unit Tests:** guard functions.
- **Integration Tests (database):** error mapping on the real schema.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/data/repositories/base
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: logging responsibility (services, not repositories) documented in code.

## 12. Risks and Notes

- `SQLITE_FULL` cannot be produced naturally in tests; use an adapter double that throws a synthetic error with that code.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
