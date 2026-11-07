# TASK-606 — Dashboard screen (summary, actions, recent transactions)

> **PROVISIONAL / BLOCKED** — recent-transactions empty copy needs [DG-04](../design-gaps.md); greeting thresholds need [DG-10](../design-gaps.md); section order per [OD-07](../../design/open-decisions.md#od-07) (optional).

## Task Metadata

- **Task ID:** TASK-606
- **Task Name:** Home dashboard screen — greeting, period chip, SummaryCard, add buttons, recent transactions, section slots
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.4 Dashboard
- **Priority:** HIGH
- **Status:** BLOCKED (DG-04, DG-10)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-419, TASK-508, TASK-511, TASK-604, TASK-605
- **Blocks:** TASK-608, TASK-707, TASK-901
- **PRS References:** FR-006, FR-006.1, FR-006.2, FR-007.0 – FR-007.3, FR-024, NFR-006.1, US-001
- **Design References:** UX §B (layout, section table), UX §I "Dashboard" row, NAV §C "Dashboard navigation", TS §3 `SummaryCard` row

## 1. Objective

Replace the Home placeholder with the dashboard's summary portion, leaving clearly ordered slots that Phases 7–8 fill with budget, recommendation and goal sections.

## 2. Background and Context

UX §B: greeting + gear, period chip, Savings hero card (label rule, rate or "not available"), income/expense side by side (stacked at large font), Add expense/Add income buttons, then Budgets → Suggestions → Goals → Recent transactions. Each section has its own skeleton/empty/error state.

## 3. Requirements

1. `DashboardScreen` composes: header greeting ("Good morning/afternoon/evening, {name}" — thresholds per DG-10), `PeriodSelector`, `SummaryCard`, action buttons → `/transactions/new?type=…`, then section slots in design order: `budgetsSection`, `recommendationsSection`, `goalsSection` (render nothing until Phases 7–8 provide them), `RecentTransactionsSection`.
2. The settings gear is **not** added here (route does not exist until TASK-901, which adds it).
3. `SummaryCard`: hero `MoneyText` with savings label; `PercentText` rate; income/expense rows; negative savings shows minus + "Spent more than earned"; empty period shows zeros **with** "No transactions in this period" + Add action (FR-006.2).
4. `RecentTransactionsSection`: last 5 via `TransactionItem` (from transactions index), "See all" → Transactions tab; empty copy per DG-04 decision.
5. Each section: skeleton while loading, inline `ErrorState` + Retry on error; failure in one section does not hide others.
6. Large font: summary rows stack vertically.

## 4. Scope

### Included
- Screen, `SummaryCard`, recent section, tests; replace `(tabs)/index.tsx` placeholder.

### Excluded
- Budget/goal/recommendation sections (TASK-707, TASK-715, TASK-810), settings gear (TASK-901).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/(tabs)/index.tsx` | MODIFY | Render `DashboardScreen` |
| `src/features/dashboard/components/DashboardScreen.tsx` | CREATE | Screen with ordered section slots |
| `src/features/dashboard/components/SummaryCard.tsx` | CREATE | UX §J `SummaryCard` |
| `src/features/dashboard/components/RecentTransactionsSection.tsx` | CREATE | Recent list |
| `src/features/dashboard/greeting.ts` | CREATE *(proposed path)* | Time-of-day greeting helper (DG-10) |
| `src/features/dashboard/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Component tests |

## 6. Implementation Instructions

1. `DashboardScreen.tsx` is a shared-file hotspot for TASK-707, TASK-715, TASK-810 — keep each section a separate component imported in one place so later edits are one-line insertions.
2. Greeting helper takes the local hour as a parameter (testable).

## 7. Dependencies

- TASK-419 (MoneyText/PercentText), TASK-508 (add route), TASK-511 (`TransactionItem`), TASK-604 (period chip), TASK-605 (hooks).

## 8. Acceptance Criteria (TS §3 `SummaryCard` row + UX §B)

- [ ] Zero income → "Savings rate: not available — No income recorded for this period".
- [ ] Negative savings → minus sign + text label, not color only.
- [ ] Custom range → label "Savings".
- [ ] Empty period → explanation + Add action; no unexplained ₹0.00.
- [ ] Section error shows inline Retry while other sections render.
- [ ] Add expense/income buttons open the correct modal.

## 9. Testing Requirements

- **Unit Tests:** greeting helper.
- **Integration Tests:** TASK-608.
- **UI Tests:** acceptance items with mocked hooks; `expectAccessible`.
- **Manual Verification:** Android, largest font size stacking.

## 10. Verification Commands

```bash
npx jest src/features/dashboard
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- NFR-001.2 (dashboard ≤ 1 s at 50k) verified in TASK-910.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
