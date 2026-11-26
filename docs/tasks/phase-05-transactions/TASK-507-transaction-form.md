# TASK-507 — Transaction form and pickers

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-507
- **Task Name:** `TransactionForm` (React Hook Form + Zod) with `CategoryPicker` and `PaymentMethodPicker`
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.4 Transaction UI
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-418, TASK-419, TASK-501, TASK-502, TASK-506
- **Blocks:** TASK-508, TASK-509, TASK-704
- **PRS References:** FR-002, FR-002.1, FR-003, FR-003.1, FR-003A.9, FR-005.1, FR-026.4, FR-027.1, NFR-006.1, US-001, US-002
- **Design References:** UX §C.2 (form layout & behaviour), UX §C.4, UX §C.6 (category picker), BL §A.3 (defaults), BL §A.4 (type switch), TS §3 `TransactionForm` row, UX §J rows

## 1. Objective

Build the single presentational form used for adding and editing both expenses and income, with inline field-naming errors, safe defaults, and protection against double submission.

## 2. Background and Context

Income and expense are modes of one form (SA §C). Income mode relabels "Category" as "Income source" and hides the payment method (FR-003.1). The recurring toggle is information only with helper text (UX §C.2). The form receives data and callbacks; it does not call services.

## 3. Requirements

1. Props: `{ mode: 'create'|'edit', initialValues, categories: {income, expense}, paymentMethods, today, currency, originalDate?, submitting: boolean, saveError?: AppError, onSubmit(values), onCancel(), onDirtyChange(dirty) }`.
2. RHF with `zodResolver(buildTransactionSchema(...))`; errors on blur and on submit; top summary `FormErrorBanner kind="invalid"` on submit when invalid.
3. Segmented type toggle (Expense | Income); switching calls `applyTypeSwitch`.
4. `CategoryPicker` grid (3–4 columns, ≥ 48 dp tiles, selected state with check icon + `accessibilityState.selected`); no default selection; spending class **not** shown (UX §C.6).
5. `PaymentMethodPicker` chip row (expense only), preselected from `initialValues`.
6. `DateSelector` with `min = MIN_TRANSACTION_DATE`, `max = today` (create) — in edit mode `max = max(today, originalDate)` so an unchanged later date (BL §C.8) remains selectable.
7. Note field with live counter `n/200`; recurring switch with helper "For your reference only — it doesn't create future entries."
8. Save disabled while `submitting`; double press → one `onSubmit`. When `saveError` is a persistence error, show `FormErrorBanner kind="notSaved"`, keeping values.

## 4. Scope

### Included
- `TransactionForm`, `CategoryPicker`, `PaymentMethodPicker`, component tests.

### Excluded
- Routes, hooks, service calls, discard confirmation (TASK-508).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/transactions/components/TransactionForm.tsx` | CREATE | Form |
| `src/features/transactions/components/CategoryPicker.tsx` | CREATE | Category grid (also used by budgets via `index.ts`) |
| `src/features/transactions/components/PaymentMethodPicker.tsx` | CREATE | Chips |
| `src/features/transactions/index.ts` | MODIFY | Export `CategoryPicker` for TASK-704 |
| `src/features/transactions/components/*.test.tsx` | CREATE | Component tests |

## 6. Implementation Instructions

1. No arithmetic or parsing in the component; the resolver does it.
2. Test with `@testing-library/react-native` `userEvent`; assert by role/label, not snapshot.

## 7. Dependencies

- TASK-418/419 (banners, chips, segmented control), TASK-501 (types), TASK-502 (schema, type switch), TASK-506 (inputs).

## 8. Acceptance Criteria (TS §3 `TransactionForm` row)

- [ ] Income mode hides payment method and labels "Income source".
- [ ] Inline errors name the field (e.g. "Amount can have at most 2 decimal places.").
- [ ] Save disabled while submitting; double press → one `onSubmit`.
- [ ] `saveError` shows the not-saved banner and keeps values.
- [ ] Type switch clears category and sets/clears the payment method.
- [ ] Default payment method preselected; no category preselected.
- [ ] `expectAccessible` passes.

## 9. Testing Requirements

- **Unit Tests:** not required separately.
- **Integration Tests:** via TASK-508/512.
- **UI Tests:** all acceptance items.
- **Manual Verification:** keyboard behaviour on Android in TASK-512.

## 10. Verification Commands

```bash
npx jest src/features/transactions/components
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- `CategoryPicker` is reused by TASK-704 through the transactions feature `index.ts` (feature-to-feature import rule).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
