# TASK-501 — Category and payment-method domain and repositories

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-501
- **Task Name:** Category & payment-method domain types and read-only repositories (incl. last-used payment method)
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.1 Reference data
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-412, TASK-413
- **Blocks:** TASK-502, TASK-505, TASK-507, TASK-510, TASK-603, TASK-808, TASK-905
- **PRS References:** FR-004, FR-004.1, FR-005, FR-005.1, FR-003.1
- **Design References:** SA §C "Categories" row, DB §B.2, §B.3 (derived last-used query), DB §J.5, BL §A.3, ADR-0008

## 1. Objective

Expose the seeded categories (with spending class) and payment methods to the rest of the app through typed, read-only domain types and repositories.

## 2. Background and Context

Categories and payment methods are seeded, read-only in the MVP (custom categories are MVP+, see TASK-591 in the deferred backlog). SA §C: categories have no screens; they live as `domain/categories` + `categoriesRepo`. FR-005.1: payment method preselects the most recently used one, else Cash — derived, not stored (DB §B.3).

## 3. Requirements

1. Domain (`src/domain/categories/`): `TransactionType = 'income'|'expense'` *(shared with TASK-502; define here and re-export)*, `SpendingClass = 'essential'|'discretionary'|'unclassified'`, `Category { id, type, name, spendingClass: SpendingClass | null, iconKey, colorKey, sortOrder, isSystem, archived }`, `PaymentMethod { id, name, iconKey, sortOrder }`. Helpers `isDiscretionary(c)`, `isReductionEligible(c)` (= discretionary only, FR-016.1).
2. `categoriesRepo`: `listByType(db, type)` (non-archived, `sort_order`), `getById(db, id)`, `listAll(db)`; row mapping validates `spending_class` presence by type (else `IntegrityError`).
3. `paymentMethodsRepo`: `list(db)`, `getById(db, id)`, `lastUsedExpenseMethodId(db): string | null` per DB §B.3 query.
4. Default payment method resolver in domain: `defaultPaymentMethodId(lastUsed) = lastUsed ?? 'pm_cash'`.

## 4. Scope

### Included
- Domain types/helpers, two repositories, tests.

### Excluded
- UI pickers (TASK-507). Custom categories (deferred).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/categories/types.ts` | CREATE *(proposed path)* | Category/PaymentMethod/SpendingClass types |
| `src/domain/categories/rules.ts` | CREATE *(proposed path)* | `isReductionEligible`, default method |
| `src/domain/categories/index.ts` | CREATE | Exports |
| `src/data/repositories/categoriesRepo.ts` | CREATE | Reads |
| `src/data/repositories/paymentMethodsRepo.ts` | CREATE | Reads + last used |
| `*.test.ts` alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Use `runRepo` and read guards from TASK-413.
2. The last-used test inserts expenses with different `created_at` values and one income (must be ignored).

## 7. Dependencies

- TASK-412 (seeded tables), TASK-413 (repo helpers).

## 8. Acceptance Criteria

- [ ] `listByType('expense')` returns 13 categories in seed order with correct classes; `'income'` returns 6 with null class.
- [ ] `lastUsedExpenseMethodId` returns the method of the most recently created expense; `null` with no expenses; income rows ignored.
- [ ] `isReductionEligible` is true only for the 5 discretionary categories.

## 9. Testing Requirements

- **Unit Tests:** domain helpers.
- **Integration Tests (database):** repositories on the real schema.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/categories src/data/repositories/categoriesRepo src/data/repositories/paymentMethodsRepo
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
