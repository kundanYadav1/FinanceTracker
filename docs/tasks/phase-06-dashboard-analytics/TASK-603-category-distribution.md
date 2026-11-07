# TASK-603 — Category distribution calculator

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-603
- **Task Name:** Category distribution calculator (FR-018.1) with exact-sum invariant
- **Implementation Phase:** 6 — Dashboard & Analytics
- **Feature:** F6.2 Financial calculation services
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** TASK-406, TASK-501
- **Blocks:** TASK-607
- **PRS References:** FR-018.1, US-004, FR-007.4
- **Design References:** BL §B.13, TS §1 "Reports" row

## 1. Objective

Turn per-category expense totals into an ordered distribution with shares, guaranteeing the totals add up exactly to total expenses.

## 2. Background and Context

BL §B.13: order by amount desc then category `sort_order`; `share_c = total_c / X × 100` displayed per FR-007.4; invariant Σ total_c = X; no "total %" row; X = 0 → empty state.

## 3. Requirements

1. `calculateCategoryDistribution(rows: {categoryId, spent}[], categories: Category[], totalExpenses: Money)` → `{ kind:'empty' } | { kind:'distribution', items: { category, spent, share: Ratio }[], total: Money }`.
2. Throws `IntegrityError` if Σ rows ≠ `totalExpenses` (guards against SQL/filter drift).
3. Ordering: spent desc, then `sortOrder` asc, then id asc.

## 4. Scope

### Included
- Calculator + tests.

### Excluded
- Report UI (TASK-607).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/reports/categoryDistribution.ts` | CREATE *(proposed path; SA §B.2 `domain/reports`)* | Calculator |
| `src/domain/reports/index.ts` | CREATE | Exports |
| `src/domain/reports/categoryDistribution.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Property test: random category totals → Σ items = total, shares each in [0,100], order respected.

## 7. Dependencies

- TASK-406 (Money/Ratio), TASK-501 (Category type).

## 8. Acceptance Criteria

- [ ] Σ items.spent equals total exactly.
- [ ] Ties ordered by `sortOrder`.
- [ ] X = 0 → `empty`.
- [ ] Mismatched input sum → `IntegrityError`.

## 9. Testing Requirements

- **Unit Tests:** all items + property test.
- **Integration Tests:** via TASK-607/608.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/reports
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Displayed shares may not sum to 100.0 % (rounding); by design, no total-% row.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
