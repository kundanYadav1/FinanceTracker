# TASK-510 — Transaction filter store and filter sheet

> **PROVISIONAL / BLOCKED** — "All time" option needs [DG-03](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-510
- **Task Name:** `transactionFilterStore`, filter sheet modal and active-filter chips
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.3 History, search & filters
- **Priority:** MEDIUM
- **Status:** BLOCKED (DG-03)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-414, TASK-419, TASK-420, TASK-501, TASK-504, TASK-506
- **Blocks:** TASK-511, TASK-512, TASK-607
- **PRS References:** FR-002 (filter, by date, by category), FR-002.3, FR-003 (filter income), FR-019, FR-019.4
- **Design References:** ST §2 (`transactionFilterStore`), NAV §B (`transactions/filters.tsx` modal), UX §C.1 (filter chips), UX §C.5 (filter sheet), TS §3 (list/filter states)

## 1. Objective

Let the user combine period, type, category and payment-method filters for the history list, held in a store separate from the dashboard period.

## 2. Background and Context

ST §2: filters live in `transactionFilterStore` so filtering history does not change the dashboard; Reports sets these filters before navigating (TASK-607). UX §C.5: sheet with Period (This month · Last month · Custom · All time), Type, Category (filtered by type), Payment method (disabled when Type = Income), Reset, Apply.

## 3. Requirements

1. `transactionFilterStore`: `{ period: { kind:'current' } | { kind:'previous' } | Period | { kind:'all' }, type?, categoryId?, paymentMethodId?, query }` *(the `current` intent mirrors ST §2's period-store rule; `all` per DG-03)*; actions `setFilters`, `setQuery`, `reset`, `activeCount`. Default: current month, no filters (UX §I).
2. `toTransactionQuery(filters, today)` pure helper → `TransactionQuery` (TASK-504).
3. Route `src/app/transactions/filters.tsx` (modal) → `FilterSheet`: edits a local copy, Apply writes to the store, Reset clears. Custom range uses two `DateSelector`s validated by `validateCustomRange`.
4. Selecting Type = Income clears and disables payment method; changing type clears an incompatible category.
5. `ActiveFilterChips` component: one removable chip per active filter.

## 4. Scope

### Included
- Store, mapping helper, filter route + sheet, chips, tests.

### Excluded
- The history screen itself (TASK-511).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/store/transactionFilterStore.ts` | CREATE | Filter state (ST §2) |
| `src/features/transactions/filters.ts` | CREATE *(proposed path)* | `toTransactionQuery` |
| `src/app/transactions/filters.tsx` | CREATE | Modal route |
| `src/features/transactions/components/FilterSheet.tsx` | CREATE | Sheet UI |
| `src/features/transactions/components/ActiveFilterChips.tsx` | CREATE | Chips |
| `src/app/_layout.tsx` | MODIFY | Register modal |
| tests alongside | CREATE | Store, helper, component tests |

## 6. Implementation Instructions

1. `current`/`previous` intents resolve against `clock.today()` at query time so a month rollover is followed.
2. Category options come from the transactions service (`listCategories(type)`), not from a repo import.

## 7. Dependencies

- TASK-414 (store conventions), TASK-419 (Chip, SegmentedControl), TASK-420 (routes), TASK-501 (categories), TASK-504 (`TransactionQuery`), TASK-506 (`DateSelector`).

## 8. Acceptance Criteria

- [ ] Combined filters map to the expected `TransactionQuery`.
- [ ] Type = Income disables and clears payment method.
- [ ] Custom range with start > end cannot be applied (message names the field).
- [ ] Reset returns to current month, no filters; `activeCount` = 0.
- [ ] Changing filters does not change any dashboard state (no `periodStore` import).

## 9. Testing Requirements

- **Unit Tests:** store, `toTransactionQuery` (incl. month rollover).
- **Integration Tests:** via TASK-512.
- **UI Tests:** FilterSheet interactions, chips removal.
- **Manual Verification:** Android filter sheet.

## 10. Verification Commands

```bash
npx jest src/shared/store src/features/transactions
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- DG-03 decision may change the period union; keep it in one type.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
