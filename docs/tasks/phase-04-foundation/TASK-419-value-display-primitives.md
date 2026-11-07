# TASK-419 — Value display UI primitives

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-419
- **Task Name:** Value display primitives — `MoneyText`, `PercentText`, `StatusBadge`, `ProgressBar`, `Chip`, `SegmentedControl`
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.6 Theme & shared UI
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-407, TASK-417
- **Blocks:** TASK-422, TASK-424, TASK-506, TASK-507, TASK-510, TASK-604, TASK-606, TASK-705, TASK-712, TASK-713, TASK-809
- **PRS References:** FR-007.1 – FR-007.4, FR-008.6, FR-008.8, §33.1, NFR-006.1 (not color alone)
- **Design References:** UX §A.4 (semantic money colors), UX §A.8 (progress bars), UX §A.9 (status icons), UX §J rows (MoneyText, PercentText, StatusBadge, ProgressBar, Chip, SegmentedControl), TS §3

## 1. Objective

Render money, percentages, statuses and progress consistently, using only domain formatters and never color alone to carry meaning.

## 2. Background and Context

UX §A.4: income `+` in `success`, expense `−` in `text`, negative savings in `error` with a text label. UX §A.8: progress bars clamp visually at 100 % and expose `progressbar` role/value. UX §A.9: each status has an icon and text.

## 3. Requirements

1. `MoneyText({ money, signDisplay, tone: 'neutral'|'income'|'expense'|'negative', variant })` — text via `formatMoney`, `tabular-nums`, `accessibilityLabel` via `spokenMoney`; never truncated (wraps).
2. `PercentText({ value: Available<Ratio> })` — `formatPercent` or "Not available — {reason}" via `reasonText`.
3. `StatusBadge({ status })` for `healthy | warning | exceeded | onTrack | atRisk | behind | completed | expired | active | paused | archived` — color + icon + text always.
4. `ProgressBar({ ratio: Ratio | null, tone })` — 8 dp, clamped fill, `accessibilityRole="progressbar"`, `accessibilityValue={{min:0,max:100,now}}` (floor), plus caller-provided text label.
5. `Chip({ label, selected?, onPress?, onRemove? })` with `accessibilityState.selected`; `SegmentedControl({ options, value, onChange })` with tab/radio semantics.

## 4. Scope

### Included
- Six components + tests.

### Excluded
- Feature cards (`SummaryCard`, `BudgetProgressCard`, `GoalProgressCard`) — feature tasks.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/shared/ui/MoneyText.tsx`, `PercentText.tsx` | CREATE | Value text |
| `src/shared/ui/StatusBadge.tsx`, `ProgressBar.tsx` | CREATE | Status visuals |
| `src/shared/ui/Chip.tsx`, `SegmentedControl.tsx` | CREATE | Selection controls |
| `src/shared/ui/index.ts` | MODIFY | Exports |
| `src/shared/ui/*.test.tsx` | CREATE | Component tests |

## 6. Implementation Instructions

1. Components receive domain values (`Money`, `Ratio`, `Available`) and call domain formatters — no arithmetic in components except clamping the bar width.
2. Bar width from `floorDiv`-style integer math on the Ratio (BL §B.9 "progress bar width uses floor").

## 7. Dependencies

- TASK-407 (formatters), TASK-417 (Icon, tokens, a11y helper).

## 8. Acceptance Criteria

- [ ] Negative savings renders "-₹3,000.00" with a text label and `error` tone.
- [ ] `PercentText` for `unavailable: NO_INCOME` renders the reason text, never "0%".
- [ ] Every `StatusBadge` status renders an icon and text.
- [ ] `ProgressBar` at 112 % renders a full bar and `accessibilityValue.now = 100`; caller text shows the real value.
- [ ] Chip/Segmented selected states are exposed to accessibility.

## 9. Testing Requirements

- **Unit Tests:** not required separately.
- **Integration Tests:** not required.
- **UI Tests:** RNTL for each acceptance item + `expectAccessible`.
- **Manual Verification:** largest font size wrapping in TASK-909.

## 10. Verification Commands

```bash
npx jest src/shared/ui
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None beyond platform font rendering of `₹`.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
