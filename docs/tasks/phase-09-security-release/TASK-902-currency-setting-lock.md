# TASK-902 — Currency setting with lock

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-902
- **Task Name:** `/settings/currency` with FR-001.4 currency lock (service + UI)
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.1 Settings & privacy controls
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-601, TASK-702, TASK-710, TASK-901
- **Blocks:** TASK-904, TASK-909
- **PRS References:** FR-001.1, FR-001.2, FR-001.4, FR-025.1, §33
- **Design References:** DB §B.1 (lock trigger), SA §E.3 (`CURRENCY_LOCKED` message), UX §H "Currency" row, ST §3.3 (topics incl. `profile`), TS §4 #8

## 1. Objective

Show the primary currency and allow changing it only when no transaction, budget or goal exists; otherwise explain why it is locked.

## 2. Background and Context

FR-001.4. The DB trigger is defense in depth; the service checks first. INR is the only supported currency in the MVP (FR-001.2), so a change is effectively impossible today, but the lock behaviour must still be correct and tested (TS §4 #8).

## 3. Requirements

1. `settingsService.getCurrencyState()` → `{ currency, locked: boolean }` using `transactionsRepo.existsAny`, `budgetsRepo.hasAny`, `goalsRepo.hasAny`; topics `['transactions','budgets','goals','profile']`.
2. `settingsService.changeCurrency(code)`: registry check; locked → `BusinessRuleError('CURRENCY_LOCKED')`; trigger error mapped likewise; success → refresh snapshot, bump `profile`.
3. Screen: shows "Indian Rupee (₹ INR)"; change control enabled only when unlocked; locked → disabled with the FR-001.4 explanation text from the catalog.

## 4. Scope

### Included
- Service functions, route, screen, settings row, tests.

### Excluded
- Adding currencies (PRS change required).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/settings/services/settingsService.ts` | MODIFY | Currency state/change |
| `src/features/settings/components/CurrencyScreen.tsx` | CREATE | UI |
| `src/app/settings/currency.tsx` | CREATE | Route |
| `src/features/settings/components/SettingsScreen.tsx` | MODIFY | Add row |
| `tests/integration/currency-lock.test.tsx` | CREATE | TS §4 #8 |

## 6. Implementation Instructions

1. For the "change allowed" test, inject a second fake currency into the registry in the test only.

## 7. Dependencies

- TASK-601, TASK-702, TASK-710 (existence queries), TASK-901.

## 8. Acceptance Criteria

- [ ] Empty DB → change allowed (test currency).
- [ ] After one transaction (or budget, or goal) → refused with the explanation; the UI control is disabled.
- [ ] Trigger-level refusal maps to the same message.

## 9. Testing Requirements

- **Integration Tests:** TS §4 #8.
- **UI Tests:** locked/unlocked rendering.

## 10. Verification Commands

```bash
npx jest src/features/settings tests/integration/currency-lock
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
