# ADR-0002 — Money as integer minor units with explicit currency

**Status:** Proposed (2026-11-06)

## Context
PRS §34 and AGENTS.md §7 forbid floating-point money. FR-001.3 requires a currency on every value. FR-003A.2 caps records at 9,999,999,999 minor units. FR-007.4 requires that rounding happen only for display. The draft `toCents` multiplies floats, and `savingsRate` returns a Money value for a percentage.

## Decision
- **Storage:** `INTEGER` minor units plus a `currency` column, with `CHECK (typeof(x)='integer')` and range CHECKs. Triggers enforce the primary currency.
- **TypeScript type:** `Money { amountMinor: number (safe integer); currency }`. Arithmetic checks that currencies match, and every operation and every read asserts `Number.isSafeInteger`.
- **Ratios, percentages and averages:** stored as exact `Ratio { num: bigint; den: bigint }`. They are rounded only at output, with an explicit mode (ceil, floor or half-away-from-zero).
- **Parsing and formatting:** parsing works on strings only, never floats. A custom deterministic formatter handles ₹, Indian grouping and a leading minus sign.
- **Precision source:** currency precision comes from a registry. The code never hardcodes 100.

## Alternatives
- **Decimal library** (dinero.js, big.js): unnecessary at these magnitudes, and adds a dependency.
- **BigInt for every amount:** awkward with React and JSON, and unnecessary below 2^53.
- **REAL columns:** forbidden.

## Consequences
- \+ Results are exact and deterministic, and overflow fails explicitly instead of silently.
- \+ Sums stay exact up to about 900k maximum-value records, which is 18× the NFR-001 volume.
- − BigInt ratio code needs care. Unit tests cover it.
- − The custom formatter needs tests for each supported currency.
