# TASK-418 — Feedback UI primitives

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-418
- **Task Name:** Feedback primitives — `Skeleton`, `EmptyState`, `ErrorState`, `ConfirmationDialog`, `FormErrorBanner`, `Toast`
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.6 Theme & shared UI
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-405, TASK-414, TASK-417
- **Blocks:** TASK-420, TASK-421, TASK-424, TASK-507, TASK-704, TASK-712, TASK-809
- **PRS References:** FR-006.2, FR-026.1, FR-026.2, FR-027.1, FR-027.2, NFR-006.1
- **Design References:** UX §I (UI states), UX §J rows (Skeleton, EmptyState, ErrorState, ConfirmationDialog, FormErrorBanner, Toast), NAV §D (states), TS §3 (`ConfirmationDialog` row)

## 1. Objective

Provide the components that express loading, empty, error, confirmation and save-failure states consistently across every screen.

## 2. Background and Context

UX §I defines the state matrix for every screen; NAV §D requires skeletons (no full-screen spinners) and no ₹0 placeholders; FR-026.1 requires confirmations that name the item; FR-027.1 requires a "not saved" banner that keeps values. UX §I: toasts are announced to screen readers.

## 3. Requirements

1. `Skeleton` blocks hidden from screen readers; a container prop announces "Loading".
2. `EmptyState({ icon, title, body, action? })`.
3. `ErrorState({ code, onRetry })` — message from `messageFor(code)`; Retry button.
4. `ConfirmationDialog({ title, message, confirmLabel, destructive, onConfirm, onCancel, busy? })` — modal; **cancel is the default focus**; confirm disabled while `busy`. The caller supplies the item-naming message (FR-026.1).
5. `FormErrorBanner({ kind: 'notSaved' | 'invalid', entity })` — live region (`accessibilityLiveRegion="polite"` on Android, announcement on iOS).
6. `Toast` host rendering `uiStore` queue; auto-dismiss *(proposed 3 s)*; announced via `AccessibilityInfo.announceForAccessibility`.

## 4. Scope

### Included
- Six components + tests.

### Excluded
- `DatabaseErrorScreen` (TASK-421).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/ui/Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx` | CREATE | State displays |
| `src/shared/ui/ConfirmationDialog.tsx` | CREATE | Destructive confirmations |
| `src/shared/ui/FormErrorBanner.tsx` | CREATE | Not-saved / invalid summary |
| `src/shared/ui/Toast.tsx` | CREATE | Toast host |
| `src/shared/ui/index.ts` | MODIFY | Exports |
| `src/shared/ui/*.test.tsx` | CREATE | Component tests |

## 6. Implementation Instructions

1. `ConfirmationDialog` uses RN `Modal`; set initial focus with `AccessibilityInfo.setAccessibilityFocus` on the cancel button.
2. Never render amounts in `ErrorState`/`FormErrorBanner` (messages come from the catalog).
3. Use `expectAccessible` (TASK-417) in every test.

## 7. Dependencies

- TASK-405 (message catalog), TASK-414 (`uiStore`), TASK-417 (buttons, a11y helper).

## 8. Acceptance Criteria

- [ ] `ConfirmationDialog` renders the supplied message verbatim; cancel has initial focus; confirm calls `onConfirm` once even on double press.
- [ ] `ErrorState` shows the catalog message for the given code and calls `onRetry`.
- [ ] `FormErrorBanner kind="notSaved" entity="expense"` shows "Your expense was not saved. Your entries are still here — please try again." (catalog wording).
- [ ] Toast is announced and auto-dismisses.
- [ ] Skeleton elements are hidden from accessibility.

## 9. Testing Requirements

- **Unit Tests:** not required beyond components.
- **Integration Tests:** not required.
- **UI Tests:** RNTL per component, including `expectAccessible`.
- **Manual Verification:** TalkBack announcement of toast (TASK-909).

## 10. Verification Commands

```bash
npx jest src/shared/ui
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Focus management in RN `Modal` differs across platforms; verified manually in TASK-909.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
