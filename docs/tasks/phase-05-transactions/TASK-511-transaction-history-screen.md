# TASK-511 — Transaction history screen

> **PROVISIONAL** — Gate G0 closed. Inherits DG-03 via TASK-504/510.

## Task Metadata

- **Task ID:** TASK-511
- **Task Name:** Transactions tab — grouped, paginated history with search, filter chips, period summary strip and FAB
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.3 History, search & filters
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-504, TASK-506, TASK-508, TASK-509, TASK-510
- **Blocks:** TASK-512, TASK-606, TASK-607
- **PRS References:** FR-002 (view, search, filter, by date, by category), FR-002.2, FR-002.3, FR-003 (history), FR-006.2, NFR-001.2, NFR-006.1, US-001, US-002
- **Design References:** UX §C.1, UX §C.5 (no results state), UX §I "Transactions list" row, DB §I (pages of 50, FlatList), NAV §C (FAB → type choice), TS §3 `TransactionItem`/list row

## 1. Objective

Replace the Transactions tab placeholder with the full history screen.

## 2. Background and Context

UX §C.1 defines layout: search field, filter button with active count, chips row, period summary strip, `FlatList` grouped by date headers ("Today", "Yesterday", "Mon, 3 Nov 2026"), keyset pages of 50, row ≥ 56 dp with a combined accessibility label, FAB → type choice → add form.

## 3. Requirements

1. `useTransactionHistory()`: reads `transactionFilterStore`, loads first page + summary via service with topics `['transactions']`, `loadMore()` with cursor, resets on filter/query change.
2. `TransactionItem` row: `CategoryIcon`, category name, second line (note ellipsized + payment method for expenses), right-aligned signed `MoneyText`; accessibility label e.g. "Expense, 1,250 rupees 50 paise, Food (eating out), 4 November 2026, UPI"; tap → `/transactions/[id]`.
3. Section headers via `relativeDayLabel`; grouping is a pure helper.
4. Summary strip "Income ₹X · Expenses ₹Y" for the filtered set.
5. States: skeleton rows; footer spinner while paging; empty "No transactions in this period" + Add; no-results "No transactions match your search and filters." + Clear filters; inline error + Retry.
6. FAB → choice (Expense / Income) → `/transactions/new?type=…`.
7. Replace `src/app/(tabs)/transactions.tsx` placeholder with the feature screen.

## 4. Scope

### Included
- Hook, screen, row, grouping helper, tests.

### Excluded
- Performance measurement at 50k (TASK-910).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/(tabs)/transactions.tsx` | MODIFY | Render feature screen |
| `src/features/transactions/components/TransactionHistoryScreen.tsx` | CREATE | Screen |
| `src/features/transactions/components/TransactionItem.tsx` | CREATE | Row (UX §J) |
| `src/features/transactions/hooks/useTransactionHistory.ts` | CREATE | View-model |
| `src/features/transactions/grouping.ts` | CREATE *(proposed path)* | Date-section grouping |
| `src/features/transactions/index.ts` | MODIFY | Export `TransactionItem` (reused by dashboard recent list) |
| tests alongside | CREATE | Hook/component tests |

## 6. Implementation Instructions

1. `FlatList` (not SectionList) with header items interleaved, or `SectionList` — choose the one that preserves keyset paging simply; record the choice.
2. `keyExtractor` = transaction id; `getItemLayout` not required.

## 7. Dependencies

- TASK-415, TASK-504 (query), TASK-506 (SearchBar), TASK-508/509 (routes for add/detail), TASK-510 (filters).

## 8. Acceptance Criteria

- [ ] Rows are grouped under correct relative headers for a fixed clock.
- [ ] Scrolling to the end loads the next page without duplicates.
- [ ] Search narrows results; filters + search combine.
- [ ] Each empty/no-results/error state matches UX §I copy.
- [ ] After adding a transaction via the FAB, the list shows it without manual refresh.
- [ ] Row accessibility label matches the format in §3.2.

## 9. Testing Requirements

- **Unit Tests:** grouping helper.
- **Integration Tests:** in TASK-512.
- **UI Tests:** states, row label, FAB choice.
- **Manual Verification:** Android scrolling with ≥ 200 seeded rows.

## 10. Verification Commands

```bash
npx jest src/features/transactions
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- NFR-001.2 (≤ 300 ms save-to-visible) depends on this screen's refresh path; measured in TASK-910.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
