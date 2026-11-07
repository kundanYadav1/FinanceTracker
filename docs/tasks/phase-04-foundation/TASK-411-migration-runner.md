# TASK-411 — Migration runner, pre-migration backup and legacy guard

> **PROVISIONAL / BLOCKED** — requires [OD-14](../../design/open-decisions.md#od-14) (re-baseline; PO confirms no device holds real draft data) and ADR-0005/ADR-0009 acceptance.

## Task Metadata

- **Task ID:** TASK-411
- **Task Name:** Migration runner on `PRAGMA user_version`, pre-migration backup, legacy draft guard, immutability check
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.4 Database foundation
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-14, OD-19 via TASK-410)
- **Estimated Complexity:** LARGE
- **Dependencies:** TASK-409, TASK-410
- **Blocks:** TASK-412, TASK-421, TASK-424, TASK-904, TASK-908, TASK-911
- **PRS References:** FR-026.5, FR-027.2, NFR-002, NFR-007, AGENTS.md §11
- **Design References:** DB §J.1 – J.4, DB §J.6, DB §J.8, ADR-0005, ADR-0009, TS §2 "Migrations" row, [DG-08](../design-gaps.md)

## 1. Objective

Implement the forward-only migration runner that upgrades the database atomically per version, refuses to touch newer schemas, backs up existing databases before upgrading, refuses to destroy legacy draft data, and verifies integrity after migrating.

## 2. Background and Context

ADR-0009 replaces the broken `schema_migrations` runner (it queried the table before creating it) with `PRAGMA user_version`. DB §J.2 is the exact startup algorithm; §J.4 defines rollback/backup; §J.6 defines the legacy guard; §J.1 requires a test that fails if an applied migration's SQL changes.

## 3. Requirements

1. Migration type `{ version: number; name: string; up: (db: Db) => Promise<void> }`; registry `migrations/index.ts` exporting an ordered array and `LATEST_VERSION`. Versions are contiguous from 1.
2. `migrate(db, { backup })` implements DB §J.2:
   - read `user_version` = v;
   - v > LATEST → `DatabaseUnavailableError('DB_SCHEMA_NEWER')`, no writes;
   - v = 0 and a `schema_migrations` table exists → legacy guard (§J.6): if draft `transactions`, `budgets`, `savings_goals` are all empty → drop all draft tables and continue as fresh; else → `DB_MIGRATION_FAILED` with code `LEGACY_DATA_PRESENT`, nothing dropped;
   - 0 < v < LATEST → call `backup(v)` first;
   - for each n in v+1..LATEST: `BEGIN; up(n); PRAGMA user_version = n; COMMIT` — on any error `ROLLBACK` and throw `DB_MIGRATION_FAILED` with `context:{ version:n }`;
   - afterwards `PRAGMA foreign_key_check` must return no rows and `PRAGMA quick_check` must return `ok`, else `DB_MIGRATION_FAILED`;
   - run `ANALYZE` after any applied migration (DB §I).
3. `backup.ts`: production `backupBeforeMigration(v)` uses expo-sqlite `backupDatabaseAsync` to `financetracker.pre-v{v}.db` in the same directory; keeps only the latest; `deleteMigrationBackups()` exported for TASK-421 (after successful launch) and TASK-904 (delete all data). Tests inject a fake backup function.
4. Rebuild helper for future CHECK/FK changes (DB §J.3): `rebuildTable(db, spec)` doing the 12-step procedure with a row-count assertion. Only unit-tested here; first used by a future migration.
5. Immutability check: `migrations/hashes.json` *(proposed path)* records a SHA-256 of each migration file's source; a Jest test recomputes and fails on mismatch. Runs in `npm test` (no CI exists, DG-08).
6. No migration deletes user rows (FR-026.5).

## 4. Scope

### Included
- Runner, registry scaffold (empty or with a test-only fake list), backup helpers, rebuild helper, hash test, tests.

### Excluded
- The baseline migration content (TASK-412). Startup UI (TASK-421). On-device upgrade verification (TASK-911).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/db/migrate.ts` | CREATE | Runner |
| `src/data/db/migrations/index.ts` | CREATE | Ordered registry, `LATEST_VERSION` |
| `src/data/db/migrations/types.ts` | CREATE *(proposed path)* | `Migration` type |
| `src/data/db/backup.ts` | CREATE | Pre-migration backup and cleanup |
| `src/data/db/rebuildTable.ts` | CREATE *(proposed path)* | DB §J.3 helper |
| `src/data/db/migrations/hashes.json` | CREATE *(proposed path)* | Recorded hashes |
| `src/data/db/migrate.test.ts`, `rebuildTable.test.ts`, `migrations/immutability.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Test the runner with fake migration lists injected via a parameter (`migrate(db, { migrations, backup })`), so behaviour is independent of TASK-412.
2. The legacy fixture recreates the draft schema from `src/db/schema.ts` v1–v2 SQL (copy the DDL into the test fixture; do not import the legacy module, which TASK-423 deletes).
3. `PRAGMA foreign_keys=OFF/ON` in `rebuildTable` must run outside the transaction.

## 7. Dependencies

- TASK-409 (`Db`), TASK-410 (real SQLite in tests).

## 8. Acceptance Criteria

- [ ] Fresh DB (v=0, no legacy table) migrates to LATEST without calling backup.
- [ ] v=1 of 2 calls backup once, then applies only migration 2.
- [ ] A migration that throws midway leaves `user_version` and data unchanged and raises `DB_MIGRATION_FAILED`.
- [ ] v > LATEST raises `DB_SCHEMA_NEWER` and performs no writes (verified by `total_changes()`).
- [ ] Legacy draft DB, empty → dropped and migrated; with one row → `LEGACY_DATA_PRESENT`, all draft tables and rows intact.
- [ ] A `foreign_key_check` violation after migration raises `DB_MIGRATION_FAILED`.
- [ ] Re-running `migrate` on a LATEST DB is a no-op.
- [ ] Changing a registered migration's source fails the immutability test.

## 9. Testing Requirements

- **Unit Tests:** rebuild helper row-count assertion and FK handling.
- **Integration Tests (database):** every acceptance item against the real SQLite adapter.
- **UI Tests:** not required.
- **Manual Verification:** deferred to TASK-911.

## 10. Verification Commands

```bash
npx jest src/data/db
npm run test:coverage -- src/data
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: all TS §2 "Migrations" scenarios that do not need the baseline schema are covered.

## 12. Risks and Notes

- **Data safety:** this is the code most able to destroy user data. Reviewer must check every DROP path is guarded.
- If OD-14 is answered "real data exists", the legacy branch becomes a conversion migration (DB §J.6 alternative) — re-plan via change management.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
