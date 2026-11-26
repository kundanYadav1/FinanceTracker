# TASK-408 — Calendar date domain

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-408
- **Task Name:** Calendar date domain — LocalDate, MonthKey, Period, month math, display formatting
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.3 Domain primitives
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-402, TASK-404
- **Blocks:** TASK-424, TASK-502, TASK-504, TASK-506, TASK-601, TASK-604, TASK-702, TASK-708, TASK-710, TASK-801, TASK-802
- **PRS References:** FR-019, FR-019.1 – FR-019.7, FR-010.1
- **Design References:** BL §0 (types), BL §C.1 – C.13, ADR-0003, TS §1 "Dates" row

## 1. Objective

Provide integer-based, time-zone-safe calendar date types and month arithmetic that all financial periods, budgets, goals and recommendations use.

## 2. Background and Context

ADR-0003 stores financial dates as local calendar strings. BL §C forbids `new Date('YYYY-MM-DD')`, defines inclusive month boundaries with the Gregorian leap rule, complete vs incomplete months, custom-range rules, and allows `date-fns` for display only (C.13).

## 3. Requirements

1. Branded types `LocalDate` (`YYYY-MM-DD`) and `MonthKey` (`YYYY-MM`); constructors `toLocalDate(y, m, d)` and `parseLocalDate(s): Result<LocalDate, ValidationError('DATE_INVALID')>` rejecting impossible dates (2026-02-30, 2026-2-1).
2. Month math: `monthOf(date)`, `monthIndex(m) = y·12 + (m−1)`, `fromMonthIndex`, `addMonths(m, n)`, `monthStart(m)`, `monthEnd(m)` (leap rule `y%4==0 && (y%100!=0 || y%400==0)`), `daysInMonth`, `monthsBetweenInclusive(a, b)`.
3. `isCompleteMonth(m, today)` ⇔ `today > monthEnd(m)` (C.5); `currentMonth(today)`, `previousMonth(today)`.
4. `Period = { kind:'month'; month } | { kind:'custom'; start; end }`; `periodBounds(p)`; `validateCustomRange(start, end, today)` → errors for start > end, end > today, span > 10 years (`CUSTOM_RANGE_INVALID`) (C.7).
5. `MIN_TRANSACTION_DATE = '2000-01-01'` constant (pending OD-12; value configurable in one place).
6. Display (C.13): `formatDate(d)` → "6 Nov 2026", `formatMonth(m)` → "Nov 2026" and "November 2026" (long), `relativeDayLabel(d, today)` → "Today"/"Yesterday"/"Mon, 3 Nov 2026". Uses `date-fns` `format` on `new Date(y, m−1, d, 12)` only.
7. Update `src/shared/lib/clock.ts` so `Clock.today()` returns `LocalDate` via `toLocalDate` (TASK-404 left a plain string).

## 4. Scope

### Included
- Date types, math, period helpers, display, tests (3 TZs).

### Excluded
- History-sufficiency rule C.6 (TASK-802, depends on OD-22). Goal saving periods (TASK-708 uses `monthIndex`).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/dates/localDate.ts` | CREATE *(proposed path)* | LocalDate type, parse, construct |
| `src/domain/dates/month.ts` | CREATE *(proposed path)* | MonthKey and month math |
| `src/domain/dates/period.ts` | CREATE *(proposed path)* | Period, bounds, custom-range validation |
| `src/domain/dates/display.ts` | CREATE *(proposed path)* | date-fns display helpers |
| `src/domain/dates/index.ts` | CREATE | Exports |
| `src/shared/lib/clock.ts` | MODIFY | Return `LocalDate` |
| `src/domain/dates/*.test.ts` | CREATE | Unit tests |

## 6. Implementation Instructions

1. All comparisons are lexical on zero-padded strings (C.1).
2. Display functions are the only place `Date` objects are created inside `domain/`; add a comment pointing to C.13.
3. Run the suite with `npm run test:tz`.

## 7. Dependencies

- TASK-402 (TZ runner), TASK-404 (Clock, Result).

## 8. Acceptance Criteria

- [ ] `monthEnd`: Feb 2024 → 29, Feb 2025 → 28, Feb 2000 → 29, Feb 2100 → 28; all 12 months of 2026 correct.
- [ ] `addMonths('2026-01', -1)` = `'2025-12'`; `addMonths('2026-11', 14)` = `'2028-01'`.
- [ ] `isCompleteMonth('2026-10', '2026-10-31')` = false; with today `'2026-11-01'` = true.
- [ ] `parseLocalDate('2026-02-30')` and `('2026-2-1')` fail with `DATE_INVALID`.
- [ ] Custom range start > end, end > today, and span > 10 years are rejected.
- [ ] All tests pass under the three `test:tz` zones; display output identical across zones.

## 9. Testing Requirements

- **Unit Tests:** every TS §1 "Dates" case; leap-year table; year boundaries; display labels for today/yesterday/other.
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/dates src/shared/lib/clock
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: three-zone run green.

## 12. Risks and Notes

- OD-12 may change `MIN_TRANSACTION_DATE`; keep it a single exported constant.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
