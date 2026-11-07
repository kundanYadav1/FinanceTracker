# TASK-804 — Budget warning rules (BUD-OVER, BUD-WARN)

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-804
- **Task Name:** Rules `BUD-OVER` and `BUD-WARN`
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.3 Recommendation rules
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-803
- **Blocks:** TASK-807
- **PRS References:** FR-014, FR-016.1, FR-017, FR-017.1, FR-008.6, §32
- **Design References:** RE §C.1, RE §C.2, RE §E.3 (language rules), BL §B.5 – B.6

## 1. Objective

Generate budget recommendations when spending approaches or exceeds a budget in effect for the current month, as suggestions for discretionary/overall budgets and insights for essential/unclassified categories.

## 2. Background and Context

RE §C.1 (`BUD-OVER`, High): exceeded (incl. zero budget with spend), no potential savings (money already spent). RE §C.2 (`BUD-WARN`, Medium): Warning status. Kind is Suggestion for discretionary or overall scope, Insight otherwise. Exact templates are in RE §C.1/C.2.

## 3. Requirements

1. `rules/budgetRules.ts` *(proposed path)* exporting two rules over `ctx.budgetEvaluations` (current month).
2. Titles, reasons and suggested actions use RE §C.1/C.2 templates verbatim (with `{Category}`, `{Month}`, amounts via formatters). Overall `BUD-OVER` action lists up to 3 discretionary categories with spend this month.
3. Essential/unclassified: `kind:'insight'`, `suggestedAction` = the neutral adjust-budget sentence for BUD-OVER / remaining-amount fact for BUD-WARN as per RE (no reduction suggestion), `potentialSavings: null`.
4. `supportingMetrics`: budget, spent, utilization (or "not shown" for zero budget), remaining/over.
5. `explanation`: rule name + condition text.
6. `magnitude`: overspent minor (BUD-OVER) / remaining minor (BUD-WARN).
7. Register both in `rules/index.ts`.

## 4. Scope

### Included
- Two rules, templates, tests.

### Excluded
- Merge with anomaly rules (TASK-807).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/recommendations/rules/budgetRules.ts` | CREATE *(proposed path)* | Rules |
| `src/domain/recommendations/rules/index.ts` | MODIFY | Register |
| `src/domain/recommendations/rules/budgetRules.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Use FR-014 example (92.0 %, ₹240.00 remains) as a test row.

## 7. Dependencies

- TASK-803.

## 8. Acceptance Criteria

- [ ] 92 % shopping budget → BUD-WARN, Medium, suggestion, reason "You have used 92.0% of your Shopping budget. ₹240.00 remains for November."
- [ ] Exceeded discretionary → BUD-OVER High suggestion with "₹360.00 over"; no potential savings.
- [ ] Exceeded essential (e.g. Rent) → insight, no reduction wording, no potential savings.
- [ ] Zero budget with spend → BUD-OVER with the zero-budget reason.
- [ ] Healthy budgets produce nothing.

## 9. Testing Requirements

- **Unit Tests:** all items.

## 10. Verification Commands

```bash
npx jest src/domain/recommendations/rules
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Parallel with TASK-805/806; only `rules/index.ts` is shared (append-only).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
