# TASK-410 — Real-SQLite test adapter and database test harness

> **PROVISIONAL / BLOCKED** — requires [OD-19](../../design/open-decisions.md#od-19) (test SQLite engine). See also [DG-01](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-410
- **Task Name:** Real-SQLite test adapter and database test harness
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.4 Database foundation
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-19)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-402, TASK-409
- **Blocks:** TASK-411, TASK-413, TASK-424
- **PRS References:** NFR-008, FR-026.3, FR-026.5
- **Design References:** TS §0 (Database row, testability enablers), DB §J.8, OD-19

## 1. Objective

Let Jest run repository, migration and integration tests against a real SQLite engine through the same `Db` interface the app uses — never against a mock.

## 2. Background and Context

OD-19 recommends Node's built-in `node:sqlite` (Node ≥ 22.13, local v22.13.1) behind the `Db` adapter; `better-sqlite3` is the fallback; mocks are rejected because they cannot verify SQL, constraints or migrations. DG-01 records an unverified risk: Jest 29 may not resolve the scheme-only builtin `node:sqlite`, and integration tests (TS §4) must run it inside the `jest-expo` (React Native) test environment as well.

## 3. Requirements

1. **Spike first (stop condition):** prove `node:sqlite` loads in (a) a test with `@jest-environment node` and (b) a test under the default `jest-expo` environment. If either fails and no config-only fix exists (e.g. `moduleNameMapper`, a custom resolver), stop and report per agent guide §5 — the fallback (`better-sqlite3`) needs a tech-lead decision.
2. `nodeSqliteDb.ts` implements `Db` over `DatabaseSync` (in-memory `:memory:` by default), mapping async methods to sync calls, `withTransactionAsync` → `BEGIN/COMMIT/ROLLBACK`, and SQLite errors to objects exposing the SQLite result code (needed by TASK-413 error mapping).
3. Applies the same PRAGMAs as `connection.ts` (`foreign_keys=ON`; WAL is not applicable in memory — documented).
4. `createTestDb({ migrate?: boolean })` returns a fresh adapter, optionally migrated to LATEST (migrate flag becomes usable after TASK-411/412).
5. The adapter lives under `src/data/db/testing/` and is imported only by `*.test.ts(x)` files (lint rule or path convention documented).
6. Pins Node: `.nvmrc` and `package.json` `engines.node` (`>=22.13.0` if OD-19 selects `node:sqlite`; otherwise per the chosen engine) — moved here from TASK-402.
7. Records the SQLite version used in tests vs. the device version (from `SELECT sqlite_version()`) in the completion report (OD-19 disadvantage).

## 4. Scope

### Included
- Spike, adapter, factory, adapter self-tests.

### Excluded
- Migrations and schema (TASK-411/412).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/db/testing/nodeSqliteDb.ts` | CREATE *(proposed path)* | `Db` over node:sqlite |
| `src/data/db/testing/createTestDb.ts` | CREATE *(proposed path)* | Factory for tests |
| `src/data/db/testing/nodeSqliteDb.test.ts` | CREATE | Adapter contract tests |
| `jest.config.js` | MODIFY (only if the spike needs a resolver/mapper) | Make `node:sqlite` resolvable |
| `.nvmrc` | CREATE | Node version pin (OD-19) |
| `package.json` | MODIFY | `engines.node` |

## 6. Implementation Instructions

1. Write the spike as the first adapter test; commit nothing else until it passes in both environments.
2. Contract tests: insert/select round trip; `changes` count; named and positional params; transaction rollback on thrown error; foreign-key violation raises an error exposing `SQLITE_CONSTRAINT_FOREIGNKEY` (or the numeric extended code).
3. Do not add npm dependencies in this task. If the fallback is chosen, a revised task adds `better-sqlite3` after approval.

## 7. Dependencies

- TASK-402 (test scripts), TASK-409 (`Db` interface).

## 8. Acceptance Criteria

- [ ] `node:sqlite` works in both the `node` and the `jest-expo` test environments (or the task is stopped with a report).
- [ ] Contract tests pass: round trip, rollback, FK enforcement, error code exposure.
- [ ] No production module imports `src/data/db/testing/**`.
- [ ] Test vs. device SQLite versions are recorded.
- [ ] `.nvmrc` and `engines.node` match the OD-19 decision.

## 9. Testing Requirements

- **Unit Tests:** adapter contract tests.
- **Integration Tests:** the jest-expo-environment spike is itself the integration check.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/data/db/testing
npm test
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: both environments proven; OD-19 outcome recorded in the completion report.

## 12. Risks and Notes

- `node:sqlite` is experimental; a Node upgrade may break it (OD-19). Pinning in TASK-402 mitigates.
- If SQLite versions differ materially (e.g. missing `RETURNING`/`UPSERT` support), migrations must target the older version.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
