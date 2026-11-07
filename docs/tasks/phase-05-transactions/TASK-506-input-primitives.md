# TASK-506 — Input primitives: AmountInput, DateSelector, SearchBar

> **PROVISIONAL / BLOCKED** — `DateSelector` needs the new dependency `@react-native-community/datetimepicker` approved under [OD-16](../../design/open-decisions.md#od-16); date bounds depend on [OD-12](../../design/open-decisions.md#od-12).

## Task Metadata

- **Task ID:** TASK-506
- **Task Name:** Input primitives — `AmountInput`, `DateSelector` (native picker), `SearchBar`
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.4 Transaction UI
- **Priority:** HIGH
- **Status:** BLOCKED (OD-16, OD-12)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-407, TASK-408, TASK-417, TASK-419
- **Blocks:** TASK-507, TASK-510, TASK-511, TASK-604, TASK-704, TASK-712
- **PRS References:** FR-003A.3, FR-003A.9, FR-019.4, FR-019.5, FR-002.2, NFR-006.1
- **Design References:** UX §C.2 (amount field), UX §C.5 (debounced search), UX §C.7 (date selection), UX §J rows (AmountInput, DateSelector, SearchBar), DEP §3 (datetimepicker), BL §C.13

## 1. Objective

Provide the three reusable inputs every form uses: an amount field with a live formatted preview, a date selector limited to valid dates, and a debounced search field.

## 2. Background and Context

UX §C.2: amount autofocus, `decimal-pad`, live preview, comma-decimal message; parsing is done by the schema, not the component. UX §C.7: Today/Yesterday chips + native picker with `maximumDate = today`, `minimumDate = 2000-01-01`; the picker's local Y/M/D is converted with `toLocalDate`; JS `Date` is never stored.

## 3. Requirements

1. Install `@react-native-community/datetimepicker` with `npx expo install` (only after OD-16 approval). No other dependency.
2. `AmountInput({ value: string, onChangeText, label, error?, autoFocus? })`: `keyboardType="decimal-pad"`; preview line below shows `formatMoney(parseAmount(...))` only when parse succeeds; label + error linked for accessibility.
3. `DateSelector({ value: LocalDate, onChange, min: LocalDate, max: LocalDate, label, quickChips?: boolean })`: chips Today/Yesterday (hidden if outside bounds), a chip showing the chosen date (`formatDate`) that opens the native picker; spoken date label. Converts picker output via `toLocalDate(getFullYear, getMonth()+1, getDate)`.
4. `SearchBar({ value, onChangeDebounced, placeholder })`: 250 ms debounce, clear button with label.
5. All inputs meet 48 dp targets and pass `expectAccessible`.

## 4. Scope

### Included
- Dependency install, three components, tests.

### Excluded
- Form composition (TASK-507), period picker (TASK-604).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `package.json`, `package-lock.json` | MODIFY | Add datetimepicker via `npx expo install` |
| `src/shared/ui/AmountInput.tsx` | CREATE | Amount input |
| `src/shared/ui/DateSelector.tsx` | CREATE | Date input |
| `src/shared/ui/SearchBar.tsx` | CREATE | Search input |
| `src/shared/ui/dateConversion.ts` | CREATE *(proposed path)* | `fromPickerDate` |
| `src/shared/ui/index.ts` | MODIFY | Exports |
| `src/shared/ui/*.test.tsx` | CREATE | Component tests |

## 6. Implementation Instructions

1. Mock the native picker in Jest (`jest.mock('@react-native-community/datetimepicker', …)`) to emit a chosen `Date`.
2. Put the picker-`Date` → `LocalDate` conversion in a pure helper `fromPickerDate(d)` in `src/shared/ui/dateConversion.ts` *(proposed path)*; it imports only `@/domain/dates`. Run its test in all three zones with `npm run test:tz -- src/shared/ui/dateConversion` (the TASK-402 runner forwards extra path arguments).

## 7. Dependencies

- TASK-407 (format/parse for preview), TASK-408 (LocalDate), TASK-417 (a11y helper, tokens), TASK-419 (`Chip`).

## 8. Acceptance Criteria

- [ ] Typing `1250.5` shows preview "₹1,250.50"; typing `12,50` shows no preview (the schema shows the error).
- [ ] Picker cannot select after `max` or before `min`; selecting 31 Dec 23:30 local produces `YYYY-12-31` in all zones.
- [ ] Search callback fires once 250 ms after the last keystroke.
- [ ] `expectAccessible` passes for all three.
- [ ] `npx expo-doctor` passes after the install.

## 9. Testing Requirements

- **Unit Tests:** `fromPickerDate` under `test:tz`.
- **Integration Tests:** not required.
- **UI Tests:** RNTL for the three components.
- **Manual Verification:** native picker on Android dev build.

## 10. Verification Commands

```bash
npx jest src/shared/ui
npm run test:tz
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## 11. Definition of Done

Global DoD plus OD-16 approval reference in the completion report.

## 12. Risks and Notes

- If OD-16 rejects the package, the alternative is `@expo/ui` (installed) with per-platform APIs — re-plan via change management.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
