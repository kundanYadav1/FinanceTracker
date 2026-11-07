# Testing Matrix

> **PROVISIONAL.** Tooling per TS §0: Jest (`jest-expo`), React Native Testing Library, real SQLite via the TASK-410 adapter (OD-19), fixed `Clock`, 3-time-zone runs (`npm run test:tz`), coverage gates (domain ≥ 95 %, repositories ≥ 85 %). E2E tooling (Maestro) is not approved (DG-09).

**Legend:** **R** required · **O** optional/where practical · — not applicable.
Columns: **Unit** (pure functions) · **DB** (repository/constraint tests on real SQLite) · **UI** (RNTL component tests incl. `expectAccessible`) · **Int** (multi-module/workflow tests, `tests/integration/`) · **Mig** (migration tests) · **Dev** (manual check on Android device/emulator; iOS where stated) · **Reg** (regression: full suite must stay green; every task is R — shown only for checkpoints that *own* a regression run).

Every task also runs the global verification set: `npm test`, `npx tsc --noEmit`, `npx expo lint` (and `npx expo-doctor` when dependencies or config change).

## Phase 4 — Foundation

| Task | Unit | DB | UI | Int | Mig | Dev | Objective verification |
|---|---|---|---|---|---|---|---|
| 401 | R | — | — | — | — | — | Lint fixture test: one forbidden + one allowed import per SA §B.2 row |
| 402 | R | — | — | — | — | — | TZ canary proves `TZ` takes effect; coverage thresholds active |
| 403 | — | — | — | — | — | R | Merged manifest has no runtime permissions; app launches |
| 404 | R | — | — | — | — | — | ID format/uniqueness (100k); Clock local-date at 23:30 across 3 TZs |
| 405 | R | — | — | — | — | — | Catalog exhaustive; sentinel values absent from logger output |
| 406 | R | — | — | — | — | — | 0.10+0.20 = 30 minor; currency mismatch & overflow throw; rounding table |
| 407 | R | — | — | — | — | — | Every TS §1 parse/format row; round-trip property; identical in 3 TZs |
| 408 | R | — | — | — | — | — | Leap-year table; month arithmetic; complete-month boundary; 3 TZs |
| 409 | R | — | — | — | — | O | PRAGMA order; `DB_OPEN_FAILED` mapping |
| 410 | R | R | — | R | — | — | Adapter contract; works in `node` **and** `jest-expo` environments |
| 411 | R | R | — | — | R | — | Fresh/upgrade/failure/newer/legacy scenarios; immutability hash |
| 412 | — | R | — | — | R | O | Every DB §B constraint & trigger; seed counts; covering index plan |
| 413 | R | R | — | — | — | — | Error mapping per SQLite code; read guards; sentinel |
| 414 | R | — | — | — | — | — | Topic isolation of `useRevision`; no `persist` |
| 415 | R | — | R | — | — | — | Revision reload, stale-while-revalidate, superseded request, new-day refresh |
| 416 | R | — | R | — | — | O | WCAG contrast for all token pairs; theme resolution |
| 417 | R | — | R | — | — | O | Buttons ≥ 48 dp, busy ignores presses; icon map complete |
| 418 | — | — | R | — | — | O | Dialog default focus; catalog messages; toast announced |
| 419 | — | — | R | — | — | O | Unavailable rate text; status icon+text; progress clamp |
| 420 | R | — | R | — | — | R | Five tabs reachable on Android; not-found; param validation |
| 421 | R | R | R | R | — | R | TS §4 #10 (migration failure → error screen, no totals) |
| 422 | R | R | R | R | — | R | Fresh-install guard; persistence across restart |
| 423 | — | — | — | — | — | R | No imports of deleted paths; app launches |
| 424 | R | R | R | R | R | R | **Reg:** full suite + coverage + 3 TZs; Android fresh install evidence |

## Phase 5 — Transactions

| Task | Unit | DB | UI | Int | Mig | Dev | Objective verification |
|---|---|---|---|---|---|---|---|
| 501 | R | R | — | — | — | — | 19 categories/6 methods; last-used query ignores income |
| 502 | R | — | — | — | — | — | One test per BL §A.2 rule (code + field-naming message); edit date rule |
| 503 | O | R | — | — | — | — | Same-id double insert = 1 row; full-replacement update; partial-write rollback |
| 504 | R | R | — | — | — | — | Paging without gaps/duplicates; filters vs brute force; LIKE escaping |
| 505 | O | — | — | R | — | — | `CURRENCY_NOT_SET`; idempotency; no revision bump on failure; sentinel |
| 506 | R | — | R | — | — | R | `fromPickerDate` in 3 TZs; picker bounds; debounce |
| 507 | — | — | R | — | — | O | TS §3 `TransactionForm` row (all 6 assertions) |
| 508 | R | — | R | R | — | R | Save → one row → toast; double tap; failure keeps values |
| 509 | R | — | R | R | — | R | Edit persists; delete dialog names item; stale id |
| 510 | R | — | R | — | — | O | Filter → query mapping; income disables method; month rollover |
| 511 | R | — | R | O | — | R | Date grouping; paging; empty/no-results/error states |
| 512 | — | — | — | R | — | R | **Reg:** TS §4 list parts of #1/#2/#6; airplane mode; kill-after-save; reboot |

## Phase 6 — Dashboard & Analytics

| Task | Unit | DB | UI | Int | Mig | Dev | Objective verification |
|---|---|---|---|---|---|---|---|
| 601 | R | R | — | — | — | — | Every aggregate equals brute-force reference on randomized fixtures; query plans |
| 602 | R | — | — | — | — | — | FR-007 edge table incl. zero income, negative, 26.45 % rounding |
| 603 | R | — | — | — | — | — | Σ items = total (property); tie ordering |
| 604 | R | — | R | — | — | O | Current-month intent follows rollover; custom-range validation |
| 605 | — | — | O | R | — | — | Revision bump updates summary; empty flag |
| 606 | R | — | R | — | — | R | TS §3 `SummaryCard` row; section isolation; large-font stacking |
| 607 | — | — | R | R | — | O | Category sum invariant; drill-down filter |
| 608 | — | — | — | R | — | R | **Reg:** TS §4 #1, #2 dashboard parts; US-004 |

## Phase 7 — Budgets & Savings Goals

| Task | Unit | DB | UI | Int | Mig | Dev | Objective verification |
|---|---|---|---|---|---|---|---|
| 701 | R | — | — | — | — | — | Status boundaries 79.99/80/100/100.01 %; zero budget; never-negative remaining |
| 702 | — | R | — | — | — | — | TS §1 version-resolution cases; remove keeps history |
| 703 | R | — | — | R | — | — | Statuses + sort; past month read-only; validation; sentinel |
| 704 | — | — | R | — | — | O | Zero-budget note; categories already budgeted hidden |
| 705 | — | — | R | — | — | O | TS §3 `BudgetProgressCard` row; stepper bounds |
| 706 | — | — | R | — | — | O | "since" month; 6-month history; remove copy |
| 707 | — | — | R | — | — | O | Custom-range caption; ≤ 1 + 3 cards |
| 708 | R | — | — | — | — | — | FR-010.3 table; 1,000,001/3 = 333,334; 99.9 % cap; 3 TZs |
| 709 | R | — | — | — | — | — | Thresholds 100/75 %; E unavailable; > 600 months; **projection consistency property** |
| 710 | R | R | — | — | — | — | Goal validation rows; saved-amount event atomic (OD-09) |
| 711 | — | — | — | R | — | — | TS §4 #4; saved-amount update creates no transaction |
| 712 | — | — | R | — | — | O | Live preview; replace-to-detail |
| 713 | — | — | R | — | — | O | Each tracking state badge; requiredOnly header |
| 714 | — | — | R | — | — | O | Withdraw clamps at 0; projection reason; delete copy |
| 715 | — | — | R | — | — | O | Period-independent; ≤ 3 goals |
| 716 | — | — | — | R | — | R | **Reg:** TS §4 #3 (budget part), #4, #6 (partial), #7 |

## Phase 8 — Recommendation Engine

| Task | Unit | DB | UI | Int | Mig | Dev | Objective verification |
|---|---|---|---|---|---|---|---|
| 801 | R | — | — | — | — | — | Key format; single-owner constants |
| 802 | R | — | — | — | — | — | 20.0/19.9 %; ₹500.00/₹499.99; zero average; history 2 vs 3 |
| 803 | R | — | — | — | — | — | Ranking per RE §E.2; shuffled input → identical output |
| 804 | R | — | — | — | — | — | FR-014 example text; essential → insight |
| 805 | R | — | — | — | — | — | FR-013 example; potential savings ≤ excess (property) |
| 806 | R | — | — | — | — | — | FR-015 example; GAP-INFO when E unavailable |
| 807 | R | — | — | — | — | — | Merge order; banned phrases; essential-safety; determinism |
| 808 | — | — | O | R | — | — | Service = engine on hand-built input; period-independent; ≤ 6 queries |
| 809 | — | — | R | — | — | O | TS §3 recommendation rows; no dismiss control |
| 810 | — | — | R | — | — | O | ≤ 3 ranked cards or notice |
| 811 | — | — | — | R | — | R | **Reg:** TS §4 #3, #5, #6 recommendation parts; FR-019.7 |

## Phase 9 — Security, Backup & Release

| Task | Unit | DB | UI | Int | Mig | Dev | Objective verification |
|---|---|---|---|---|---|---|---|
| 901 | — | — | R | R | — | R | Theme applies & persists; name limit |
| 902 | — | — | R | R | — | — | TS §4 #8 currency lock |
| 903 | — | — | R | — | — | O | Four NFR-004.2 statements; no encryption claim |
| 904 | — | R | R | R | — | R | TS §4 #9; failure injection leaves data intact; no backups/exports remain |
| 905 | R | R | — | R | — | — | TS §4 #11 schema validation, integer money, counts |
| 906 | R | — | R | R | — | R | Warning before write; temp file deleted on success and error; offline |
| 907 | — | — | — | — | — | R | `adb shell bmgr backupnow` output |
| 908 | R | — | — | — | — | R (iOS) | iOS hook returns excluded for 4 file kinds |
| 909 | — | — | R | — | — | R | Whole-screen a11y sweep; TalkBack; largest font |
| 910 | — | — | — | — | — | R | Median save-to-visible ≤ 300 ms; dashboard ≤ 1 s at 50k |
| 911 | — | — | — | — | R | R | Fresh install, in-place upgrade (counts + money checksums), legacy guard on device |
| 912 | — | — | — | — | — | R | Android checklist on 2 emulators + 1 device |
| 913 | — | — | — | — | — | R (iOS) | iOS checklist; VoiceOver; Dynamic Type |
| 914 | — | — | — | — | — | R | Config output; no permissions; no `fetch` |
| 915 | — | — | — | — | — | R | Production artefacts smoke-tested |
| 916 | — | — | — | — | — | O | Links resolve; no unverified claims |
| 917 | R | R | R | R | R | R | **Reg:** full suite + E2E/manual critical flows on production build; scope & privacy audits |

## Cross-cutting test coverage

| Test category | Where it lives | Owner tasks |
|---|---|---|
| Unit (domain) | `src/domain/**/*.test.ts` | 404 – 408, 502, 602, 603, 701, 708, 709, 801 – 807 |
| Database | `src/data/**/*.test.ts` | 410 – 413, 422, 501, 503, 504, 601, 702, 710, 904, 905 |
| Migration | `src/data/db/**` + device | 411, 412, 911 |
| UI component | `src/**/components/*.test.tsx`, `src/shared/ui/*.test.tsx` | all UI tasks; sweep in 909 |
| Integration / workflow | `tests/integration/*.test.tsx` | 421, 422, 505, 508, 509, 512, 605, 607, 608, 703, 711, 716, 808, 811, 902, 904, 905, 906 |
| Time-zone | `npm run test:tz` | 402 (tooling), 404, 406 – 408, 502, 506, 602, 708, 709, 802 |
| Privacy (sentinel) | helper from 505 | 405, 413, 505, 703, 711, 512, 917 |
| Accessibility | `expectAccessible` helper (417) + manual | every UI task; 909; 913 |
| Cross-platform | manual device | 912 (Android), 913 (iOS) |
| Performance | device | 910 |
| Regression | checkpoints | 424, 512, 608, 716, 811, 917 |

### Critical calculations and their edge-case coverage (AGENTS.md §12)

| Edge case | Task(s) |
|---|---|
| Zero income | 602 |
| Zero expenses | 602, 701 |
| Zero budget | 701, 705 |
| Goal already completed | 708, 709 |
| Past target date | 708, 710 |
| No transactions | 601, 602, 606, 709 |
| Negative balance (negative savings, E ≤ 0) | 602, 709 |
| Very large monetary values | 406, 407, 412, 602 |
| Leap years | 408, 708 |
| Month boundaries | 408, 601, 709, 802 |
| Currency precision | 406, 407 |
