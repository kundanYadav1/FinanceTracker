# TASK-601 — Transaction aggregate queries

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-601
- **Task Name:** Transaction aggregate queries for totals, category spend, monthly series, history bounds and recent items
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.1 Financial data aggregation
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-503, TASK-504, TASK-408
- **Blocks:** TASK-605, TASK-607, TASK-703, TASK-711, TASK-808, TASK-902
- **PRS References:** FR-006, FR-007, FR-008.4, FR-011.1, FR-013.1, FR-018.1, FR-019.3, FR-019.6, NFR-001.1, NFR-001.2, §33
- **Design References:** DB §I (covering indexes, ≤ 6 dashboard queries, aggregate in SQL), DB §F (spend query), DB §D.3 (GROUP BY currency), SA §D.4 – D.7, RE §A.1 (input aggregates), TS §2 "Aggregates" (brute-force reference)

## 1. Objective

Provide every SQL aggregate the dashboard, reports, budgets, goals and recommendations need, computed in SQLite with index support and validated against a brute-force reference.

## 2. Background and Context

DB §I: never load all rows into JS; aggregates use covering indexes. Consumers: dashboard summary (D.4), budgets (D.5), goals expected saving (D.6), recommendation input (RE §A.1), reports (FR-018.1).

## 3. Requirements

Add to `transactionsRepo` (all via `runRepo`, all money through `singleCurrencyTotal` or per-row guards):
1. `sumByType(db, start, end)` → `{ income: Money, expenses: Money, hasTransactions: boolean }`.
2. `sumExpensesByCategory(db, start, end)` → `{ categoryId, spent: Money }[]` (only categories with spend).
3. `monthlyTotals(db, fromMonth, toMonth)` → `{ month, income, expenses, hasTransactions }[]` for **every** month in range (missing months filled with zero and `hasTransactions:false`), using `GROUP BY substr(transaction_date,1,7), type`.
4. `categoryMonthSpend(db, fromMonth, toMonth)` → `{ categoryId, month, spent }[]` for expense categories.
5. `earliestTransactionDate(db)` → `LocalDate | null`.
6. `recent(db, limit)` → latest `limit` list items by `(transaction_date, created_at, id)` desc.
7. `existsAny(db)` → boolean (used by TASK-902 currency lock UI).
8. Verify with `EXPLAIN QUERY PLAN` that 1–4 use `ix_tx_date_type_amount` or `ix_tx_category_date_amount`; record plans in the report.

## 4. Scope

### Included
- Repository aggregate functions and DB tests.

### Excluded
- Domain calculations on top of aggregates (TASK-602/603/708/709/802).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/repositories/transactionsRepo.ts` | MODIFY | Add aggregate functions |
| `src/data/repositories/transactionsAggregates.test.ts` | CREATE *(proposed path)* | Brute-force reference tests |

## 6. Implementation Instructions

1. Build randomized fixtures (seeded PRNG, ≥ 1,000 rows across 18 months incl. Feb of a leap year) and compare every aggregate to a JS reference computed from the same fixture.
2. Month bounds come from `monthStart`/`monthEnd` (TASK-408).

## 7. Dependencies

- TASK-503/504 (repo file must exist and be stable — sequential edits), TASK-408 (month math).

## 8. Acceptance Criteria

- [ ] Every function equals the brute-force reference on randomized fixtures.
- [ ] `monthlyTotals` returns one row per month in range, including empty months.
- [ ] Mixed-currency rows (inserted by temporarily bypassing triggers in the test DB) cause `IntegrityError`, never a sum.
- [ ] Query plans use the covering indexes.
- [ ] Repository coverage ≥ 85 %.

## 9. Testing Requirements

- **Unit Tests:** month-filling helper.
- **Integration Tests (database):** all acceptance items.
- **UI Tests:** not required.
- **Manual Verification:** timing at 50k in TASK-910.

## 10. Verification Commands

```bash
npx jest src/data/repositories
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus recorded query plans.

## 12. Risks and Notes

- Hotspot: last of three sequential edits to `transactionsRepo.ts` (503 → 504 → 601).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
