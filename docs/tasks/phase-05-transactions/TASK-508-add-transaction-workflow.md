# TASK-508 — Add transaction workflow (expense and income)

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-508
- **Task Name:** Add expense / add income modal route with editor hook, idempotent save, discard confirmation and toast
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.5 Transaction workflows
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-415, TASK-420, TASK-505, TASK-507
- **Blocks:** TASK-509, TASK-511, TASK-512, TASK-606
- **PRS References:** FR-002 (add), FR-003 (add), FR-026.3, FR-026.4, FR-027.1, US-001, US-002, NFR-001.2 (save visible ≤ 300 ms)
- **Design References:** NAV §B (`transactions/new.tsx ?type=`), NAV §C "Add transaction", NAV §D "Modal behavior", SA §D.1 (draftId created once on mount), UX §C.2, UX §I "Add/Edit transaction" row

## 1. Objective

Let the user add an expense or income from a modal, saving exactly one record per save action, with clear success and failure feedback.

## 2. Background and Context

The prompt's separate "expense creation" and "income creation" workflows are a single workflow in the design (one form, `type` param) — both are delivered here. SA §D.1: `draftId = newId('tx')` is created once when the form mounts and is the idempotency key.

## 3. Requirements

1. Route `src/app/transactions/new.tsx`: validates `type` param with `parseRouteParams` (`expense|income`; absent → `expense`; anything else → not-found); renders `NewTransactionScreen` from the feature index.
2. `useTransactionEditor({ mode:'create', type })`: creates `draftId` once (`useState(() => newId('tx'))`), loads categories/payment methods/defaults via service (`useServiceQuery`), exposes `submit(values)`, `submitting`, `saveError`.
3. On `Ok`: dismiss modal, `showToast('Expense saved' | 'Income saved')`. On `Err`: stay open, values kept, banner shown (FR-027.1).
4. Dirty form: back, swipe-down and Cancel open "Discard this expense?" `ConfirmationDialog` (`usePreventRemove`).
5. Modal opened directly (deep link) with no back stack shows Close → `/(tabs)` (NAV §D "Deep links"); route performs no save on load.
6. Entry point: Transactions tab FAB (added in TASK-511); Home buttons (TASK-606). This task adds no entry points itself beyond making the route available.

## 4. Scope

### Included
- Route, screen container, editor hook (create mode), tests.

### Excluded
- Edit mode (TASK-509), entry-point buttons (TASK-511/606).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/transactions/new.tsx` | CREATE | Route (modal presentation) |
| `src/app/_layout.tsx` | MODIFY | Register `transactions/new` as modal in root Stack |
| `src/features/transactions/hooks/useTransactionEditor.ts` | CREATE | View-model |
| `src/features/transactions/components/NewTransactionScreen.tsx` | CREATE | Screen container |
| `src/features/transactions/index.ts` | MODIFY | Export screen |
| `src/features/transactions/hooks/useTransactionEditor.test.tsx` | CREATE | Hook tests |
| `tests/integration/add-transaction.test.tsx` | CREATE | Workflow test with real SQLite |

## 6. Implementation Instructions

1. Modal presentation: `presentation: 'modal'` (iOS) / full-screen slide-up on Android (NAV §C).
2. Integration test renders the screen with real services/repos on in-memory SQLite and fixed clock `2026-11-06`.

## 7. Dependencies

- TASK-415 (query hook), TASK-420 (root Stack), TASK-505 (service), TASK-507 (form).

## 8. Acceptance Criteria

- [ ] Saving a valid expense creates one row, closes the modal, shows the toast, bumps `transactions`.
- [ ] Rapid double tap on Save creates one row.
- [ ] Simulated failure keeps the modal open with values and the not-saved banner.
- [ ] Cancel on a dirty form asks for confirmation; on a clean form closes immediately.
- [ ] `?type=income` opens income mode; an absent `type` opens expense mode; any other value renders not-found (NAV §B notes).
- [ ] Direct deep link shows a Close button and performs no write.

## 9. Testing Requirements

- **Unit Tests:** hook (draftId stability across re-renders).
- **Integration Tests:** `tests/integration/add-transaction.test.tsx` covering save, double tap, failure.
- **UI Tests:** discard confirmation.
- **Manual Verification:** Android dev build add expense + income; hardware back with dirty form.

## 10. Verification Commands

```bash
npx jest src/features/transactions tests/integration/add-transaction
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus Android manual check.

## 12. Risks and Notes

- `usePreventRemove` availability in expo-router SDK 57 must be checked.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
