# ADR-0003 — Financial dates as local calendar-date strings

**Status:** Proposed (2026-11-06)

## Context
FR-019.1 says a transaction date has no time of day or time zone and must never shift. The draft uses `new Date('YYYY-MM-DD')`. JavaScript parses that as UTC midnight, so the date moves to the previous day in time zones west of UTC. Android and iOS (both on Hermes) must produce identical results (NFR-005).

## Decision
- Financial dates are `LocalDate` strings in `YYYY-MM-DD` form. Months are `MonthKey` strings in `YYYY-MM` form. Both are validated in the DB (`date(x)=x`) and in the domain layer.
- "Today" comes only from `Clock.today()`, which builds it from the device's local year, month and day.
- Month arithmetic uses an integer month index (`y*12+m-1`) and a hand-written leap-year rule.
- Audit timestamps (`created_at`, `updated_at`) are UTC ISO instants. They are never used to assign a transaction to a period.
- `date-fns` is used only for display formatting, through a `Date` built at local noon.

## Alternatives
- **UTC timestamps for transactions:** rejected. A time-zone change would move transactions between days and months (review R-07).
- **Epoch-day integers:** valid, but harder to read in SQL and in exports.

## Consequences
- \+ Totals never change because of time-zone travel or DST.
- \+ Lexical comparison in SQL works, and plain indexes apply.
- − After travelling west, a transaction can appear to be "after today". This is handled by checking the future-date rule only when the user changes the date.
