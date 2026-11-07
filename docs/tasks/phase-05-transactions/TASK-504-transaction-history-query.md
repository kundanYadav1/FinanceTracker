# TASK-504 — Transaction history query: pagination, filters, search, filtered summary

> **PROVISIONAL / BLOCKED** — "All time" filter period needs [DG-03](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-504
- **Task Name:** Transaction history query — keyset pagination, combined filters, note/category search, filtered income/expense summary
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.3 History, search & filters
- **Priority:** HIGH
- **Status:** BLOCKED (DG-03)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-503, TASK-408
- **Blocks:** TASK-510, TASK-511, TASK-601, TASK-703
- **PRS References:** FR-002 (view, search, filter, by date, by category), FR-002.2, FR-002.3, FR-003 (filter income), FR-019.4, NFR-001.1, NFR-001.2
- **Design References:** DB §I (`ix_tx_list`, keyset pagination, search LIKE escaping), UX §C.1 (period summary strip), UX §C.5 (filters), TS §2 "CRUD" (pagination no duplicates/gaps), "Aggregates"

## 1. Objective

Return transaction history pages fast at 50,000 rows, filtered by any combination of period, type, category and payment method, optionally searched by note/category name, plus the income/expense totals of the filtered set.

## 2. Background and Context

DB §I: keyset pagination on `(transaction_date DESC, created_at DESC, id DESC)` with page size 50; search uses `LIKE … ESCAPE '\'` on note and category name with `%`, `_`, `\` escaped. UX §C.1 needs a summary strip for the filtered set. UX §C.5 offers an "All time" period that the `Period` type cannot express (DG-03).

## 3. Requirements

1. `TransactionQuery = { period: Period | { kind: 'all' } /* per DG-03 */; type?: TransactionType; categoryId?: string; paymentMethodId?: string; search?: string }`.
2. `listPage(db, query, cursor?: { date, createdAt, id }, limit = 50)` → `{ items: TransactionListItem[], nextCursor | null }`. `TransactionListItem` = transaction + category name/icon/color + payment method name.
3. Search: trimmed, case-insensitive (ASCII LIKE), escapes `%`, `_`, `\`; matches note OR category name.
4. `summarize(db, query)` → `{ income: Money, expenses: Money, count }` using `SUM … GROUP BY type, currency` + `singleCurrencyTotal`.
5. Both functions use the same WHERE builder (one function, parameterised; no string interpolation of user input).
6. Query plans: with only a period filter, `listPage` uses `ix_tx_list`; record `EXPLAIN QUERY PLAN` output in the completion report.

## 4. Scope

### Included
- WHERE builder, `listPage`, `summarize`, tests.

### Excluded
- Dashboard/report aggregates (TASK-601). Filter UI (TASK-510).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/data/repositories/transactionsRepo.ts` | MODIFY | Add `listPage`, `summarize`, WHERE builder |
| `src/data/repositories/transactionsQuery.test.ts` | CREATE *(proposed path)* | DB tests |
| `src/domain/transactions/query.ts` | CREATE *(proposed path)* | `TransactionQuery` type + `escapeLike` (pure) |

## 6. Implementation Instructions

1. Keyset condition: `(transaction_date < ?) OR (transaction_date = ? AND (created_at < ? OR (created_at = ? AND id < ?)))`.
2. Seed a fixture with many equal dates/created_at values to test the tie-break.
3. Compare `summarize` against a brute-force JS sum over the fixture (TS §2 "Aggregates").

## 7. Dependencies

- TASK-503 (repo file, mapper), TASK-408 (`Period`, bounds).

## 8. Acceptance Criteria

- [ ] Paging through 500 rows with page size 50 returns every row exactly once in order, including ties on date and `created_at`.
- [ ] Every filter combination (period × type × category × method) returns the brute-force expected set.
- [ ] Search for `50%` matches a note "50% off" and not "500"; search `_` is literal; search is case-insensitive for ASCII.
- [ ] `summarize` equals the brute-force sums.
- [ ] `listPage` with a period filter uses `ix_tx_list` (plan recorded).

## 9. Testing Requirements

- **Unit Tests:** `escapeLike`.
- **Integration Tests (database):** all acceptance items.
- **UI Tests:** not required.
- **Manual Verification:** performance at 50k is measured in TASK-910.

## 10. Verification Commands

```bash
npx jest src/data/repositories src/domain/transactions
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- LIKE cannot use an index; DB §I expects < 100 ms at 50k; FTS5 is the documented escalation only if TASK-910 measurement fails.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
