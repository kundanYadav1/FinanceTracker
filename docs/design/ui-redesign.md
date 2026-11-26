# UI redesign: Kosh design system

Source: the "FinanceTracker Redesign" canvas built on the Kosh design system (teal brand, marigold accent, Manrope + Fraunces).

## Mapping
- Tokens: `src/constants/theme.ts` (`Colors`, `Radius`, `Space`, `FontFamily`, `TapMin`). Legacy keys alias Kosh tokens.
- Components: `src/components/kosh/` (Button, Amount, ProgressBar, StatTile, TransactionRow, InsightCard, Chip, Segmented, BottomSheet, Field, Screen).
- Logic (no UI): `src/domain/overview.ts` — month totals, date grouping, budget state (80% warn, >100% over), monthly limit, rule-based insight (category ≥15% above 3-month average), goals gap.
- Display money: `formatRupees` in `src/utils/money.ts` (`Rs 1,00,000`; storage stays integer minor units, currency column unchanged).

## Decisions
- Four tabs (Home, Expenses, Budgets, Goals); Reports/Settings are not built yet.
- Stat tiles use a 2-column grid on phones (allowed by the StatTile guideline).
- Hide-amounts mask is session-only (store flag), not persisted.
- `load()` is now called from the root layout; the migration runner creates `schema_migrations` before reading it.
- Out of scope: edit budget/goal, empty-state illustrations, notifications, Nepali (Devanagari) label table.
