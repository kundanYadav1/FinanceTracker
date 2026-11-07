# ADR-0010 — Five-tab navigation with Budgets as a tab

**Status:** Proposed (2026-11-06). Requires product approval ([OD-02](../design/open-decisions.md#od-02)).

## Context
The MVP has six product areas (§5), but Android bottom navigation allows at most five items. The brief proposed Home · Transactions · Goals · Reports · Settings. AGENTS.md §4 forbids a new navigation structure without authorization.

## Decision (proposed)
- Tabs (`NativeTabs`): Home · Transactions · Budgets · Goals · Reports.
- Settings opens from a gear in the Home header.
- Recommendations are a route pushed from Home.
- Detail and form screens sit in the root Stack, above the tabs.
- Onboarding sits behind `Stack.Protected`.

## Alternatives
- **The original proposal** (Settings as a tab, Budgets pushed from Home): fully specified as the fallback in navigation-design.
- **JS `Tabs` navigator instead of `NativeTabs`:** kept as a fallback, because NativeTabs is marked unstable.

## Consequences
- \+ The core daily areas are one tap away.
- − Settings is less discoverable. The header gear and contextual links mitigate this.
