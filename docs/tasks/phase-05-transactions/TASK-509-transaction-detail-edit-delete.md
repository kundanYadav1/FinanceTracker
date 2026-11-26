# TASK-509 — Transaction detail, edit and delete

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-509
- **Task Name:** Transaction detail screen, edit modal and delete with item-naming confirmation
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.5 Transaction workflows
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-505, TASK-507, TASK-508
- **Blocks:** TASK-511, TASK-512, TASK-605
- **PRS References:** FR-002 (edit, delete), FR-003 (edit, delete), FR-026.1, FR-019.5, US-002
- **Design References:** NAV §B (`transactions/[id]/index.tsx`, `[id]/edit.tsx`), NAV §C "Transaction detail", "Edit transaction", NAV §D "Stale targets", UX §C.3, UX §C.4, SA §D.2 – D.3, BL §A.4

## 1. Objective

Let the user inspect any transaction, edit every field (including type), and delete it after a confirmation that names the item.

## 2. Background and Context

Delete lives on the detail screen only (not on the edit form) to avoid accidental deletes (NAV §C). The confirmation must name the item: "Delete expense of ₹1,250.50 for Food (eating out) on 4 Nov 2026? This can't be undone." (UX §C.3). Amounts in **UI dialogs** are allowed; FR-027.3 restricts errors/logs only.

## 3. Requirements

1. `src/app/transactions/[id]/index.tsx` (push): `TransactionDetailScreen` — signed amount, type label, category + spending class (expense), date, payment method, note, recurring caption "Marked as recurring — for your reference", "Last edited" caption; actions Edit, Delete.
2. `src/app/transactions/[id]/edit.tsx` (modal): `useTransactionEditor({ mode:'edit', id })` reusing `TransactionForm` with prefilled values and `originalDate`; Save → dismiss to detail; same discard and failure behaviour as TASK-508.
3. Delete → `ConfirmationDialog` with the item-naming message → `service.remove(id)` → navigate back; toast "Expense deleted".
4. Missing id or deleted record → "This item no longer exists." + Back (never crash, never partial data).
5. Detail data refreshes via `useServiceQuery(['transaction', id], ['transactions'], …)`.

## 4. Scope

### Included
- Two routes, detail screen, edit mode of the editor hook, delete flow, tests.

### Excluded
- List navigation into detail (TASK-511 row tap).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/transactions/[id]/index.tsx` | CREATE | Detail route |
| `src/app/transactions/[id]/edit.tsx` | CREATE | Edit route (modal) |
| `src/app/_layout.tsx` | MODIFY | Register edit modal |
| `src/features/transactions/components/TransactionDetailScreen.tsx` | CREATE | Detail UI |
| `src/features/transactions/hooks/useTransactionDetail.ts` | CREATE | Detail view-model + delete action |
| `src/features/transactions/hooks/useTransactionEditor.ts` | MODIFY | Edit mode |
| `src/features/transactions/index.ts` | MODIFY | Exports |
| `tests/integration/edit-delete-transaction.test.tsx` | CREATE | Workflow tests |

## 6. Implementation Instructions

1. Build the confirmation message with `formatMoney`, category name and `formatDate` in the hook (presentation formatting, not calculation).
2. Edit with an unchanged date later than today (time-zone case, BL §C.8) must save successfully.

## 7. Dependencies

- TASK-505 (service), TASK-507 (form), TASK-508 (editor hook, modal registration pattern).

## 8. Acceptance Criteria

- [ ] Detail shows every field listed in §3.1.
- [ ] Editing amount/category/date/note/type persists and the detail refreshes; clearing the note stores `null`.
- [ ] Delete dialog text names type, amount, category and date; Cancel is default; confirm deletes and returns.
- [ ] Opening a deleted id shows "This item no longer exists."
- [ ] Edit with an unchanged date later than today saves.

## 9. Testing Requirements

- **Unit Tests:** confirmation message builder.
- **Integration Tests:** edit and delete with real SQLite; stale id.
- **UI Tests:** detail rendering per type; `expectAccessible`.
- **Manual Verification:** Android edit/delete flow.

## 10. Verification Commands

```bash
npx jest src/features/transactions tests/integration/edit-delete-transaction
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
