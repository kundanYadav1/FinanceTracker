# TASK-409 — Db adapter interface and expo-sqlite connection

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-409
- **Task Name:** Db adapter interface and expo-sqlite connection with PRAGMAs
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.4 Database foundation
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-405
- **Blocks:** TASK-410, TASK-411, TASK-424
- **PRS References:** NFR-002, FR-026.3, FR-027.2, NFR-005
- **Design References:** SA §B.1 row 5, DB §B.0 "Foreign keys", DB §J.2 (PRAGMAs), SEC §2 "Durability", ST §4 rule 7, TS §0 "Testability enablers", ADR-0004, ADR-0012 (single `openDatabase()`)

## 1. Objective

Define the `Db` interface that all repositories depend on, and implement the production adapter over `expo-sqlite` that opens `financetracker.db` with the required PRAGMAs.

## 2. Background and Context

TS §0 requires repositories to depend on a `Db` interface (`runAsync`, `getAllAsync`, `getFirstAsync`, `execAsync`, `withTransactionAsync`) so tests can use a real SQLite engine. DB §J.2 sets `foreign_keys=ON`, `journal_mode=WAL`, `busy_timeout`; SEC §2 adds `synchronous=FULL`. ADR-0012 keeps opening in one function so SQLCipher can be added later. The draft `src/db/database.ts` is not reused (SA §0).

## 3. Requirements

1. `Db` interface *(proposed file `src/data/db/db.ts`)*: `runAsync(sql, params?) → { changes, lastInsertRowId }`, `getAllAsync<T>`, `getFirstAsync<T>`, `execAsync(sql)`, `withTransactionAsync(fn)`, `closeAsync()`. Params are positional or named primitives only (`string | number | null`).
2. `connection.ts`: `openDatabase(): Promise<Db>` opens `financetracker.db` via `openDatabaseAsync`, then — **outside any transaction** — `PRAGMA foreign_keys = ON`, `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = FULL`, `PRAGMA busy_timeout = 5000` *(value proposed)*; verifies `PRAGMA foreign_keys` reads back `1`. Failure → `DatabaseUnavailableError('DB_OPEN_FAILED')` with `context: { op:'db.open' }`.
3. A module-level singleton `getDb()` returns the opened adapter after TASK-421's gate has run; calling it before readiness throws `UnexpectedError` (programmer error).
4. `withTransactionAsync` uses expo-sqlite's `withTransactionAsync` (never `withExclusiveTransactionAsync`, ST §4.7).
5. No migrations here (TASK-411).

## 4. Scope

### Included
- Interface, production adapter, singleton accessor, unit tests with an `expo-sqlite` Jest mock **only for open/PRAGMA call order** (SQL behaviour is tested with the real engine in TASK-410+).

### Excluded
- Test adapter (TASK-410), migrations (TASK-411), startup UI (TASK-421).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/db/db.ts` | CREATE *(proposed path)* | `Db` interface + param types |
| `src/data/db/connection.ts` | CREATE | `openDatabase`, `getDb` |
| `src/data/db/connection.test.ts` | CREATE | PRAGMA order, error mapping |

## 6. Implementation Instructions

1. Wrap the expo-sqlite `SQLiteDatabase` in a thin object implementing `Db`; do not leak expo-sqlite types outside `src/data/db/`.
2. Keep the file name `financetracker.db` (same as the draft) — the legacy guard in TASK-411 handles draft databases.
3. Use `jest.mock('expo-sqlite', …)` to assert PRAGMA call order and the `DB_OPEN_FAILED` mapping.

## 7. Dependencies

- TASK-405: `DatabaseUnavailableError`, `UnexpectedError`, logger.

## 8. Acceptance Criteria

- [ ] PRAGMAs are executed before any other statement and outside a transaction.
- [ ] `foreign_keys` read-back of `0` causes `DB_OPEN_FAILED`.
- [ ] An open failure is mapped to `DatabaseUnavailableError` and logged with code only.
- [ ] No file outside `src/data/db/` imports `expo-sqlite` (lint/grep).

## 9. Testing Requirements

- **Unit Tests:** call order, error mapping, `getDb` before open.
- **Integration Tests:** covered by TASK-411/412 against the real engine.
- **UI Tests:** not required.
- **Manual Verification:** in TASK-424 (dev build opens the DB).

## 10. Verification Commands

```bash
npx jest src/data/db/connection
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: the `Db` interface is the only database type referenced by later repository tasks.

## 12. Risks and Notes

- expo-sqlite SDK 57 API names must be checked against installed type definitions (`node_modules/expo-sqlite/build/*.d.ts`) rather than assumed.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
