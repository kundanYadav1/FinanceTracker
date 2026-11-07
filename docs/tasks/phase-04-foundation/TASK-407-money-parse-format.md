# TASK-407 — Money parsing and display formatting

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-407
- **Task Name:** Money parsing (`parseAmount`) and display formatting (`formatMoney`, `formatPercent`, spoken form)
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.3 Domain primitives
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-406
- **Blocks:** TASK-419, TASK-424, TASK-502, TASK-506, TASK-602, TASK-701, TASK-708, TASK-710
- **PRS References:** FR-003A.2, FR-003A.3, FR-003A.9, FR-007.4, §33.1, §34.1, NFR-006.1
- **Design References:** DB §D.6 (parse), DB §D.7 (format), BL §A.2 amount rows, BL §0 rounding, UX §A.4 (semantic sign), UX §J `MoneyText` (spoken form), TS §1 "Money parse" and "format" rows

## 1. Objective

Convert user-typed amount text to exact minor units without floating point, and render `Money` and percentages deterministically (₹, Indian grouping, leading minus, one decimal for percentages) on Android and iOS.

## 2. Background and Context

DB §D.6 defines a string-only grammar; BL §A.2 refines the accepted grouping forms and the comma-decimal rejection. DB §D.7 requires a custom formatter independent of device ICU. FR-007.4 requires half-away-from-zero rounding to one decimal for displayed percentages.

## 3. Requirements

1. `parseAmount(text, currency): Result<Money, ValidationError>`:
   - Trim; strip one leading `₹`.
   - Empty → `AMOUNT_REQUIRED`.
   - Integer part must match plain `^\d+$`, Western `^\d{1,3}(,\d{3})+$`, or Indian `^\d{1,2}(,\d{2})*,\d{3}$`; optional `.` + digits.
   - Comma-decimal shapes (`12,50`, `1.234,5`) → `AMOUNT_COMMA_DECIMAL`; other bad characters, signs, multiple dots, malformed grouping (`1,0,0`) → `AMOUNT_INVALID_CHARACTERS`.
   - Fraction digits > `minorDigits` → `AMOUNT_TOO_MANY_DECIMALS` (reject, never round).
   - Value built as `BigInt(int) * 10n ** d + BigInt(fracPadded)`; `0` → `AMOUNT_NOT_POSITIVE` (callers that allow zero — budgets, saved amount — use `parseNonNegativeAmount` with the same grammar); `> maxPerRecordMinor` → `AMOUNT_ABOVE_MAX`.
2. `formatMoney(m, { signDisplay?: 'auto' | 'always' })` → `₹1,00,000.00`, `-₹1,250.50`, `+₹50,000.00` (always). Indian grouping (3;2). No compact form (DB §D.7).
3. `formatPercent(r: Ratio)` → one decimal, half away from zero, `%` suffix, leading minus for negatives (FR-007.3/.4). `formatAvailablePercent(a: Available<Ratio>)` → value or `"Not available"` + reason via `reasonText`.
4. `spokenMoney(m)` → "1,250 rupees 50 paise" style text for accessibility labels (UX §C.1 example) *(proposed function name)*.
5. Money formatting lives in `domain/money/format.ts`; percentage formatting in `domain/format/percent.ts` *(proposed paths; SA §B.2 lists "format" under both)*.

## 4. Scope

### Included
- Parse, format, percent format, spoken form, tests.

### Excluded
- `AmountInput` component (TASK-506); `MoneyText`/`PercentText` components (TASK-419).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/money/parse.ts` | CREATE *(proposed path)* | `parseAmount`, `parseNonNegativeAmount` |
| `src/domain/money/format.ts` | CREATE *(proposed path)* | `formatMoney`, `spokenMoney` |
| `src/domain/format/percent.ts` | CREATE *(proposed path)* | `formatPercent`, `formatAvailablePercent` |
| `src/domain/format/index.ts` | CREATE | Exports (incl. `reasons.ts` from TASK-405) |
| `src/domain/money/index.ts` | MODIFY | Export parse/format |
| `src/domain/money/parse.test.ts`, `format.test.ts`, `src/domain/format/percent.test.ts` | CREATE | Unit tests |

## 6. Implementation Instructions

1. Never call `Number()`, `parseFloat()` or multiply on a decimal string.
2. Grouping for INR: last 3 digits, then groups of 2. Keep the algorithm registry-driven (`grouping: 'indian' | 'western'`).
3. Encode every TS §1 "Money parse" example as an `it.each` row.

## 7. Dependencies

- TASK-406 (registry, Money, Ratio, rounding).

## 8. Acceptance Criteria

- [ ] `"1250.5"` → 125050; `"1,250.50"` → 125050; `"1,00,000"` → 10,000,000; `"₹99,99,99,999.99"` → 9,999,999,999.
- [ ] `"99,99,99,999.991"` → `AMOUNT_TOO_MANY_DECIMALS`; `"100000000"` → `AMOUNT_ABOVE_MAX`; `"0"` / `"0.00"` → `AMOUNT_NOT_POSITIVE`; `"-5"`, `"1.2.3"`, `"1,0,0"` → `AMOUNT_INVALID_CHARACTERS`; `"12,50"` → `AMOUNT_COMMA_DECIMAL`; `""` → `AMOUNT_REQUIRED`; `" 12 "` → 1200.
- [ ] `formatMoney`: ₹0.00, ₹1,000.00, ₹1,00,000.00, ₹99,99,99,999.99, -₹1,250.50, +₹50,000.00.
- [ ] `formatPercent`: 26.45 % → "26.5%", −26.45 % → "-26.5%", 100 % → "100.0%".
- [ ] Output is identical under all three `test:tz` zones (no locale/ICU dependence).

## 9. Testing Requirements

- **Unit Tests:** every TS §1 parse/format row; property test: for random valid minor values `v`, `parseAmount(formatMoney(v) without ₹)` = `v`.
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/money src/domain/format
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: round-trip property test passes; no float arithmetic in parse/format.

## 12. Risks and Notes

- `₹` (U+20B9) must render on old Android fonts; checked during TASK-912.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
