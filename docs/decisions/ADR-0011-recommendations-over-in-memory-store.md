# ADR-0011 — Recommendation engine runs over the in-memory store

**Status:** Accepted (2026-11-26). Refines [ADR-0007](ADR-0007-recommendations-computed-on-demand.md).

## Context
The Phase 8 design (`docs/design/recommendation-engine-design.md`, TASK-801…811) assumes a `features/recommendations` service that loads SQL aggregates. The built app has no feature/service layer: screens call pure `src/domain/*` functions on data held in the Zustand store (`transactions`, `categories`, `budgetVersions`, `goals`). Categories have no Essential/Discretionary class (FR-004.1).

## Decision
- The engine is pure: `evaluateRecommendations({ now, transactions, categories, budgetVersions, goals })` in `src/domain/recommendations/`. `useRecommendations()` memoises it over the store slices and the calendar day. No loader, service, query or migration. Recommendations stay computed on display and unpersisted (ADR-0007).
- Spending class is a static map of the seeded category IDs in `categoryClass.ts`. Unknown categories are Unclassified (facts only, never a reduce suggestion). Custom categories do not exist yet; when they do, class must become data (a migration).
- History sufficiency, thresholds, rule IDs, ranking and wording follow the design unchanged (`historyMonths` counts a partial first month, per business-logic C.6).
- Extras beyond the design's rule list, informational only: the Subscriptions card also shows its share of the month's spending and the number of Recurring-flagged payments; the savings-gap card names each at-risk goal and the top 3 discretionary categories by average spend.
- The full list opens in a bottom sheet from the dashboard rather than a new tab or route (native tabs list only registered routes).

## Consequences
- Simple and fully unit-testable with a fixed clock; recommendations are always current.
- Cost is O(transactions) per recompute, fine for local data; revisit with SQL aggregates if the store stops holding all transactions.
