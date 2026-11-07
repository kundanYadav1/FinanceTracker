# TASK-412 — Baseline schema migration 0001 with default data and constraint tests

> **PROVISIONAL / BLOCKED** — requires [OD-14](../../design/open-decisions.md#od-14) (re-baseline), [OD-06](../../design/open-decisions.md#od-06) (priority values in CHECK), [OD-09](../../design/open-decisions.md#od-09) (include `goal_balance_events`?), [OD-20](../../design/open-decisions.md#od-20) (label "Food (eating out)"), [OD-11](../../design/open-decisions.md#od-11) (name ≤ 40).

## Task Metadata

- **Task ID:** TASK-412
- **Task Name:** Baseline schema migration 0001 (tables, constraints, triggers, indexes, seed) and constraint test suite
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.4 Database foundation
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-14, OD-06, OD-09, OD-20, OD-11)
- **Estimated Complexity:** LARGE
- **Dependencies:** TASK-411
- **Blocks:** TASK-413, TASK-421, TASK-422, TASK-424, TASK-501, TASK-503, TASK-702, TASK-710, TASK-905, TASK-911
- **PRS References:** FR-001, FR-001.1, FR-001.3, FR-001.4, FR-003.1, FR-003A, FR-004, FR-004.1, FR-005, FR-008.2, FR-008.3, FR-009, FR-009.1, FR-009.2, FR-011.2, FR-019.1, NFR-001.1, NFR-003
- **Design References:** DB §A, §B.0 – B.8, §C, §D.1, §F, §I (indexes), §J.5 (seed), ADR-0005, ADR-0006, ADR-0008

## 1. Objective

Create migration version 1 that builds the complete MVP schema with all integrity constraints and seeds the default categories, payment methods and the profile row, and prove each constraint with database tests.

## 2. Background and Context

DB §B defines six MVP tables (`profile`, `categories`, `payment_methods`, `transactions`, `budget_versions`, `savings_goals`) plus optional `goal_balance_events` (OD-09). The SQL in the design is illustrative; this task produces the real migration. Seed rows are written **inside** `0001_baseline.ts` (DB §J.5) so the migration stays immutable; no separate `seed.ts` is created (the `seed.ts` entry in SA §B.2 is satisfied by the seed section of this file — noted for design review).

## 3. Requirements

1. Tables, columns, defaults and CHECKs exactly per DB §B.1 – B.7, including:
   - `CHECK (typeof(x)='integer')` + ranges on every money column; `CHECK (col = date(col))` on date columns; month GLOB/range check on `effective_from_month`;
   - composite FK `transactions(category_id, type) → categories(id, type)`; `UNIQUE(id, type)` on categories; payment-method presence CHECK by type;
   - `budget_versions` `scope`/`scope_key`/`category_id` table CHECK and `UNIQUE(scope_key, effective_from_month)`;
   - `savings_goals.priority` CHECK uses the OD-06 values (default `high|medium|low`, default `medium`); `lifecycle_status` CHECK.
2. Triggers: `trg_profile_currency_lock` (DB §B.1); currency-must-equal-profile triggers BEFORE INSERT and BEFORE UPDATE OF currency on `transactions`, `budget_versions`, `savings_goals` (DB §B.4) — these also reject inserts while `primary_currency IS NULL` (FR-001.1); a trigger that rejects `budget_versions` rows whose category is not an expense category (DB §B.6).
3. Indexes per DB §I table (all eight).
4. `goal_balance_events` (DB §B.8) **only if OD-09 = capture now**; otherwise omit (it can be added by a later migration).
5. Seed (DB §J.5): 13 expense + 6 income categories with the listed IDs, names (OD-20 label), spending classes, icon keys, `color_key` *(proposed: equal to `icon_key`, mapped to palette entries by TASK-416)*, `sort_order` in table order, `is_system=1`; 6 payment methods `pm_cash … pm_other` (fixing the draft typo); profile row `(1, '', NULL, 'system', NULL, now, now)`. All via `INSERT OR IGNORE`.
6. Register as version 1 in `migrations/index.ts`; record its hash in `hashes.json`.

## 4. Scope

### Included
- Migration file, registry/hash update, constraint/trigger/seed tests.

### Excluded
- Repositories (TASK-413+). Recurring tables (MVP+, DB §H). Any draft-data conversion.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/db/migrations/0001_baseline.ts` | CREATE | Baseline schema + seed (name from DB §J.1) |
| `src/data/db/migrations/index.ts` | MODIFY | Register v1 |
| `src/data/db/migrations/hashes.json` | MODIFY | Record v1 hash |
| `src/data/db/migrations/0001_baseline.test.ts` | CREATE | Constraint, trigger, index and seed tests |

## 6. Implementation Instructions

1. Write each statement separately (`db.execAsync` per statement or one batch) inside the runner's transaction; do not use `PRAGMA` inside `up`.
2. Use the real SQLite adapter (`createTestDb({ migrate: true })`) for tests.
3. Verify indexes exist via `PRAGMA index_list`, and that `EXPLAIN QUERY PLAN` for the period-total query in DB §I uses `ix_tx_date_type_amount` (covering).

## 7. Dependencies

- TASK-411: runner, registry, hash mechanism.

## 8. Acceptance Criteria

- [ ] Fresh DB migrates to v1; `PRAGMA foreign_key_check` empty; `quick_check` ok.
- [ ] Rejected (TS §2 "Constraints"): `amount_minor` 0, negative, 10,000,000,000, `12.5`, `'1250'`; dates `2026-02-30`, `2026-2-1`; expense without payment method; income with one; income transaction with an expense category; duplicate budget `(scope_key, month)`; note of 201 characters; transaction currency ≠ profile currency; any money row inserted while `primary_currency` is NULL; budget on an income category.
- [ ] Accepted: zero budget; note of 200 characters; saved amount > target.
- [ ] Currency change blocked when any transaction/budget/goal exists; allowed when all are empty.
- [ ] Deleting a category or payment method referenced by a transaction fails (RESTRICT).
- [ ] Seed: exactly 19 categories and 6 payment methods; spending classes match FR-004.1; running the seed statements twice creates no duplicates.
- [ ] Profile row exists with NULL currency and `system` theme.
- [ ] Covering index used for the period-total query.

## 9. Testing Requirements

- **Unit Tests:** not applicable (SQL).
- **Integration Tests (database):** all acceptance items, table-driven.
- **UI Tests:** not required.
- **Manual Verification:** fresh install on device in TASK-424.

## 10. Verification Commands

```bash
npx jest src/data/db/migrations
npm test
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: every constraint row in DB §B and every scenario in TS §2 "Constraints"/"Relationships" has a passing test.

## 12. Risks and Notes

- After this task is merged and any build is distributed, `0001_baseline.ts` is **immutable**. Any later fix is migration 2.
- OD-06/OD-09/OD-20/OD-11 decisions are baked into the schema; resolve them first to avoid an early migration 2.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
