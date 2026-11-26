# TASK-604 — Period store and period picker

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-604
- **Task Name:** `periodStore`, `/period` modal and `PeriodSelector` chip (current / previous / custom range)
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.3 Date filters
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-408, TASK-414, TASK-419, TASK-420, TASK-506
- **Blocks:** TASK-605, TASK-606, TASK-607
- **PRS References:** FR-006.1 (default current month), FR-019, FR-019.3, FR-019.4, FR-019.7
- **Design References:** ST §2 ("Selected date period" row — stores intent `current`), NAV §B (`period.tsx` modal), NAV §C "Report filtering", UX §B row 2, BL §C.7, UX §J `PeriodSelector`

## 1. Objective

Let the user choose the period shown on Home and Reports (shared), defaulting to the current month and following month rollover while the app is open.

## 2. Background and Context

ST §2: one `periodStore` shared by Home and Reports, not persisted, resets to current month on cold start, stores intent `current` rather than a fixed month. Custom range rules come from BL §C.7.

## 3. Requirements

1. `periodStore`: `selection: { kind:'current' } | { kind:'previous' } | { kind:'custom', start, end }`; `setSelection`; `resolvePeriod(selection, today): Period` pure helper.
2. Route `src/app/period.tsx` (modal): options Current month · Previous month · Custom range (start/end `DateSelector`, `max = today`, `validateCustomRange` errors naming the field); Apply/Cancel.
3. `PeriodSelector` chip showing "November 2026", "October 2026" or "1 Oct – 15 Nov 2026"; opens `/period`.
4. No persistence middleware.

## 4. Scope

### Included
- Store, resolver, modal, chip, tests.

### Excluded
- Transaction-history filters (separate store, TASK-510).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/store/periodStore.ts` | CREATE | Shared period intent |
| `src/shared/ui/PeriodSelector.tsx` | CREATE | Chip |
| `src/features/dashboard/components/PeriodPickerScreen.tsx` | CREATE *(proposed path)* | Modal content |
| `src/features/dashboard/index.ts` | CREATE | Export picker screen |
| `src/app/period.tsx` | CREATE | Modal route |
| `src/app/_layout.tsx` | MODIFY | Register modal |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. `resolvePeriod` lives with the store (shared) but imports only `domain/dates`.
2. Test month rollover: selection `current`, clock moves from 30 Nov to 1 Dec → resolved period changes.

## 7. Dependencies

- TASK-408, TASK-414, TASK-419 (Chip), TASK-420 (routes), TASK-506 (DateSelector).

## 8. Acceptance Criteria

- [ ] Cold start → current month.
- [ ] `current` follows month rollover.
- [ ] Custom start > end, end > today, or span > 10 years cannot be applied; messages name the field.
- [ ] Chip text formats match §3.3.

## 9. Testing Requirements

- **Unit Tests:** `resolvePeriod`, chip label helper.
- **Integration Tests:** via TASK-608.
- **UI Tests:** modal validation and apply.
- **Manual Verification:** Android modal and pickers.

## 10. Verification Commands

```bash
npx jest src/shared/store src/shared/ui src/features/dashboard
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- FR-019.7: recommendations and goals must ignore this store (verified in TASK-811).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
