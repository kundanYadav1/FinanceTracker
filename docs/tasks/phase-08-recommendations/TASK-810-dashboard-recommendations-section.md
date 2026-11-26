# TASK-810 — Dashboard recommendations section

> **PROVISIONAL** — Gate G0 closed. Section order per OD-07 (optional).

## Task Metadata

- **Task ID:** TASK-810
- **Task Name:** Dashboard "Suggestions" section — top 3 recommendations or notices
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.5 Recommendation delivery
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-715, TASK-809
- **Blocks:** TASK-811, TASK-901
- **PRS References:** FR-006 (important recommendations), FR-006.1, FR-006.2, FR-012.3, FR-019.7
- **Design References:** UX §B row 9, NAV §C "Dashboard navigation"

## 1. Objective

Show at most three recommendations on Home, ordered by priority, or the notice explaining why there are none.

## 2. Background and Context

UX §B row 9: ≤ 3 cards; notices if none (e.g. "Spending comparisons need 3 complete months of history. You have 1."); always the current month, independent of the selected period; placed after Budgets and before Goals (OD-07).

## 3. Requirements

1. `RecommendationsSummarySection` using `useRecommendations` + `topForDashboard`.
2. Card tap → detail; "See all" → `/recommendations`.
3. Insert into the dashboard recommendations slot (last of the three hotspot edits).

## 4. Scope

### Included
- Section, dashboard insertion, tests.

### Excluded
- —

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/recommendations/components/RecommendationsSummarySection.tsx` | CREATE | Section |
| `src/features/recommendations/index.ts` | MODIFY | Export |
| `src/features/dashboard/components/DashboardScreen.tsx` | MODIFY | Insert (hotspot) |
| tests alongside | CREATE | Tests |

## 6. Implementation Instructions

1. Section must not read `periodStore`.

## 7. Dependencies

- TASK-715 (previous dashboard edit), TASK-809.

## 8. Acceptance Criteria

- [ ] ≤ 3 cards in ranked order.
- [ ] With no recommendations, the applicable notice is shown.
- [ ] Changing the dashboard period does not change this section.

## 9. Testing Requirements

- **UI Tests:** acceptance items.
- **Integration Tests:** TASK-811.

## 10. Verification Commands

```bash
npx jest src/features/recommendations src/features/dashboard
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
