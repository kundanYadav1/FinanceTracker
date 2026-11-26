# ADR-0005 — Re-baseline the draft database schema

**Status:** Proposed (2026-11-06). Depends on [OD-14](../design/open-decisions.md#od-14).

## Context
Draft migrations v1–v2 (`src/db/schema.ts`) conflict with PRS v1.1:
- Budgets use arbitrary periods and have no overall budget.
- The goal `status` field mixes lifecycle state with tracking state.
- There is no spending class.
- There are no integrity CHECKs.
- A payment-method ID has a typo.

The draft migration runner also queries `schema_migrations` before any migration creates it, so a fresh install cannot initialize. No normal installation can therefore hold draft data. CLAUDE.md says never to edit existing migrations; the purpose of that rule is to protect user data on schemas that have shipped.

## Decision
Retire the draft migrations. Ship a new **baseline migration 1** ([database-design](../design/database-design.md)), versioned with `PRAGMA user_version` (ADR-0009). This happens only after the product owner confirms that no device with real user data runs the draft build.

Add a **legacy guard** for any database with `user_version = 0` that contains a `schema_migrations` table:
- If its draft tables hold no transactions, budgets or goals, drop them.
- Otherwise, stop startup with `LEGACY_DATA_PRESENT` and delete nothing.

## Alternatives
- **Conversion migration v3 on top of the draft:** keeps the draft quirks permanently, loses information for budget periods that are not calendar months, and still requires fixing the broken runner. It is specified as the fallback in database-design §J.6.

## Consequences
- \+ A clean schema that matches the PRS, with database-level integrity from day one.
- − A one-time, recorded exception to the "never edit migrations" rule. CLAUDE.md needs an update once this ADR is accepted.
