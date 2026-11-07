# TASK-406 — Money core and exact ratio arithmetic

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-406
- **Task Name:** Money core — currency registry, Money type, safe-integer arithmetic, Ratio and rounding helpers
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.3 Domain primitives
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-404, TASK-405
- **Blocks:** TASK-407, TASK-413, TASK-414, TASK-424, TASK-602, TASK-603, TASK-701, TASK-708, TASK-801, TASK-802
- **PRS References:** FR-001.2, FR-001.3, FR-003A.2, FR-007.4, FR-010.2, FR-017.1, NFR-003, §33, §34, §34.1, §34.2
- **Design References:** DB §D (items 1–5), BL §0 (core types, rounding helpers), ADR-0002

## 1. Objective

Provide exact, currency-safe money arithmetic and the three rounding helpers that every calculation in Phases 6–8 uses, so that no later task performs floating-point division on money.

## 2. Background and Context

ADR-0002 fixes money as integer minor units with an explicit currency. DB §D.4 sets safe limits and requires BigInt for all ratio math; DB §D.5 and BL §0 define `ceilDiv`, `floorDiv`, `roundHalfAwayFromZero` and `Ratio`. The draft `src/utils/money.ts` is replaced (SA §0) — it must not be imported or modified.

## 3. Requirements

1. `currencies.ts`: registry `{ INR: { code:'INR', minorDigits:2, symbol:'₹', grouping:'indian', maxPerRecordMinor: 9_999_999_999, anomalyMinExcessMinor: 50_000 } }` (DB §D.2, RE §C constants). `CurrencyCode = 'INR'`. `getCurrency(code)` throws `IntegrityError('UNKNOWN_CURRENCY')` for unknown codes.
2. `money.ts`: `Money = { readonly amountMinor: number; readonly currency: CurrencyCode }`; `money(amountMinor, currency)` asserts safe integer; `assertSafeMinor(n)` → `IntegrityError('UNSAFE_INTEGER')`; `add`, `subtract`, `sum(list, currency)`, `compare`, `isZero`, `negate`. Every binary op asserts equal currency → `IntegrityError('CURRENCY_MISMATCH')`; every result is safe-integer checked.
3. `ratio.ts`: `Ratio = { num: bigint; den: bigint }` with `den > 0n`; `ratio(a, b): Available<Ratio>` where `b = 0` → unavailable (reason supplied by caller); `ceilDiv(a, b)` and `floorDiv(a, b)` for integers (a ≥ 0, b > 0) returning `number`; `roundHalfAwayFromZero(r, scale): bigint` per the BL §0 formula `sign(num) × ⌊(2·|num|·scale + den) / (2·den)⌋`; `compareRatio`.
4. `Available<T>` type (BL §0) lives in `domain/format/available.ts` *(proposed path)* or `domain/money/available.ts`; pick one and export it from `domain/money/index.ts`.
5. No `number` division (`/`) is used on money anywhere in these modules (enforced by review + a test that greps the module source for `/ ` outside comments is **not** required; reviewers check).

## 4. Scope

### Included
- Registry, Money, arithmetic, Ratio, rounding helpers, `Available<T>`, tests.

### Excluded
- Parsing and formatting (TASK-407). Domain formulas (Phases 6–8).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/money/currencies.ts` | CREATE | Currency registry |
| `src/domain/money/money.ts` | CREATE *(proposed path)* | Money type + arithmetic |
| `src/domain/money/ratio.ts` | CREATE | Ratio + rounding (path named in DB §D.4) |
| `src/domain/money/available.ts` | CREATE *(proposed path)* | `Available<T>` |
| `src/domain/money/index.ts` | CREATE | Public exports |
| `src/domain/money/money.test.ts`, `ratio.test.ts` | CREATE | Unit tests |

## 6. Implementation Instructions

1. Use `BigInt` only inside `ratio.ts`; convert to `number` only after range checks.
2. `roundHalfAwayFromZero(r, scale)` returns the integer count of `1/scale` units (e.g. scale 1000 for tenths of a percent when `num` already includes ×100 — follow BL §B.4 conventions; document the convention in a JSDoc comment).
3. Table-driven tests with `it.each`.

## 7. Dependencies

- TASK-404 (`Result`), TASK-405 (`IntegrityError`).

## 8. Acceptance Criteria

- [ ] `add(INR 10, INR 20)` = 30 minor (0.10 + 0.20 = 0.30 exactly, BL §B.2).
- [ ] Mixing currencies throws `IntegrityError` with code `CURRENCY_MISMATCH` (test uses a fake second currency injected into the registry under test only).
- [ ] `sum` exceeding `Number.MAX_SAFE_INTEGER` throws `UNSAFE_INTEGER`.
- [ ] `ceilDiv(1_000_001, 3)` = 333,334; `floorDiv(390_000, 3)` = 130,000.
- [ ] Rounding table: 26.45 → 26.5; −26.45 → −26.5; 0.05 → 0.1; 99.95 → 100.0 (TS §1).
- [ ] `ratio(x, 0)` returns `unavailable`.
- [ ] Domain coverage ≥ 95 % for this module.

## 9. Testing Requirements

- **Unit Tests:** all items above plus boundaries at `maxPerRecordMinor`, zero, negative results of `subtract`, `compareRatio` with unequal denominators.
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/money
npm run test:coverage -- src/domain/money
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: the TS §1 "Money arithmetic & format" rounding rows (non-format part) all pass.

## 12. Risks and Notes

- Hermes supports `BigInt` on RN ≥ 0.70 (DEP §1); confirm `BigInt` literals compile under the jest-expo Babel preset.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
