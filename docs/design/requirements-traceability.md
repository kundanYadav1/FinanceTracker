# D11 — Requirements Traceability

**Phase:** 2 — DESIGN · **Status:** Provisional ([OD-01](open-decisions.md#od-01)) · **Source:** PRS v1.1 (2026-11-06)

Abbreviations. **Docs:** SA = [system-architecture](system-architecture.md), DB = [database-design](database-design.md), NAV = [navigation-design](navigation-design.md), UX = [ui-ux-design](ui-ux-design.md), BL = [business-logic-design](business-logic-design.md), RE = [recommendation-engine-design](recommendation-engine-design.md), ST = [state-management-design](state-management-design.md), SEC = [security-privacy-design](security-privacy-design.md), TS = [testing-strategy](testing-strategy.md), DEP = [dependency-design](dependency-design.md).
**Test levels:** U = unit, D = database, C = component, I = integration, E = E2E/manual device.

## 1. Functional requirements

| PRS ID | Status | Architecture module | Database | Route / Screen | Business logic | Test | Design ref |
|---|---|---|---|---|---|---|---|
| FR-001 Profile | MVP | onboarding, settings | `profile` | `/onboarding`, `/settings/profile`, `/settings/appearance` | `settingsService`; theme resolution | C, I | NAV §C, UX §H |
| FR-001.1 Currency before data | MVP | onboarding | `profile.primary_currency` NULL + currency triggers | `Stack.Protected` guard → `/onboarding` | guard; `CURRENCY_NOT_SET` | D (insert before onboarding rejected), I | DB §B.1/B.4, NAV §C |
| FR-001.2 INR only | MVP | domain/money | CHECK shape only | currency picker | currency registry | U | DB §D |
| FR-001.3 Currency on every value | MVP | domain/money, data | `currency` column on every money row; triggers | — | `Money` type; mismatch guard | U, D | DB §D |
| FR-001.4 Currency lock | MVP | settings | `trg_profile_currency_lock` | `/settings/currency` | `settingsService.changeCurrency` → `CURRENCY_LOCKED` | D, I #8 | DB §B.1, SA §E.3 |
| FR-002 Expenses CRUD/search/filter | MVP | transactions | `transactions` | Transactions tab, `/transactions/new`, `/[id]`, `/[id]/edit`, `/filters` | `transactionService`; Zod schema | U, D, C, I #1/#6, E | BL §A, UX §C |
| FR-002.1 Recurring flag info-only | MVP | transactions | `is_recurring` | form toggle + helper text | no logic reads it | U (rules ignore it) | DB §E, RE §B |
| FR-002.2 Search note + category | MVP | transactions | LIKE on note + category name; escaping | search bar | repository query | D | DB §I, UX §C.5 |
| FR-002.3 Combined filters | MVP | transactions | indexes `ix_tx_*` | filter sheet | `transactionFilterStore` | D, C | ST §2, UX §C.5 |
| FR-003 Income | MVP | transactions (type=income) | `transactions` (payment method NULL CHECK) | same form, income mode | same service | D, C, I #2 | DB §E |
| FR-003.1 Source = category, no payment method | MVP | transactions | composite FK `(category_id,type)`; CHECK | income mode hides method | schema rule | D, C | DB §B.4 |
| FR-003.2 | MVP | as FR-002.1 | | | | | |
| FR-003A Validation 1–9 | MVP | domain/transactions, goals, budgets | CHECKs mirror rules | inline errors | Zod schemas, `parseAmount` | U (each rule), D, C | BL §A.2, DB §B |
| FR-004 Default categories | MVP (defaults) | domain/categories, data | `categories` seeded in migration 1 | pickers | — | D (seed) | DB §J.5 |
| FR-004.1 Spending class | MVP | domain/categories | `spending_class` + CHECK | detail screen shows class | used by RE only | U, D | DB §J.5, RE §C |
| FR-004 custom categories | MVP+ | — | `archived_at`, `is_system` reserved | — | — | — | DB §B.2 |
| FR-005 / FR-005.1 Payment methods, default | MVP | transactions | `payment_methods`; last-used derived query | chip row | default selection | D, C | DB §B.3, BL §A.3 |
| FR-006 Dashboard | MVP | dashboard | aggregates only | Home tab | composition of services | C, I #1–#3, E | UX §B, SA §D.4 |
| FR-006.1 Current month default, ≤ 3 recs | MVP | dashboard, recommendations | — | Home | `periodStore` default; `DASHBOARD_MAX` | U, C | ST §2, RE §E.2 |
| FR-006.2 Empty states | MVP | dashboard | `hasTransactions` flags | Home sections | `Available<T>` reasons | C | UX §B/§I |
| FR-006 acceptance (updates) | MVP | all | — | — | revision store | I #1–#6 | ST §3 |
| FR-007 / .0–.4 Savings & rate | MVP | domain/transactions | covering index | Summary card, Reports | B.3, B.4; BigInt ratio; display rounding | U, C | BL §B.3–B.4 |
| FR-008 / .1–.8 Budgets | MVP | budgets | `budget_versions` | Budgets tab, `/budgets/edit`, `/budgets/[scopeKey]` | resolution query; `evaluateBudget` (80%) | U, D, C, I #3/#7 | DB §F, BL §B.5–B.6, UX §D |
| FR-009 / .1–.3 Goals | MVP | goals | `savings_goals` (+ optional `goal_balance_events`) | Goals tab, `/goals/new`, `/goals/[id]`, `/saved-amount` | B.9, B.12 | U, D, C, I #4 | DB §G, BL §B.9–B.12, UX §E |
| FR-010 / .1–.3 Required monthly saving | MVP | domain/goals | — | goal detail, create preview | B.10 (ceil, inclusive months) | U (edge table) | BL §B.10 |
| FR-011 / .1–.3 Goal tracking | MVP | domain/goals | monthly savings aggregate | goal cards/detail | E (B.11), state rules (B.12) — thresholds pending [OD-03](open-decisions.md#od-03) | U (property), I #4 | BL §B.11–B.12 |
| FR-012 / .1–.3 Engine | MVP | recommendations | none (computed) | Home cards, `/recommendations`, `/recommendations/[key]` | `runEngine` | U, I #5 | RE §A, ADR-0007 |
| FR-013 / .1–.5 Anomaly | MVP | recommendations | category-month aggregates | cards | `ANOM-DISC`, `ANOM-INFO`, history sufficiency | U (thresholds) | RE §C.3–C.4, §D |
| FR-014 Budget warning | MVP | recommendations | — | cards | `BUD-WARN`, `BUD-OVER` | U, I #3 | RE §C.1–C.2 |
| FR-015 / .1–.2 Savings gap | MVP | recommendations, goals | — | cards, goals header | `GAP`, `GAP-INFO`, B.11 | U, I #5 | RE §C.5–C.6 |
| FR-016 / .1 Discretionary only | MVP | recommendations | `spending_class` | — | essential → insight only | U (property) | RE §C, §E.3 |
| FR-017 / .1 Explainability, potential-savings cap | MVP | recommendations | — | card + detail "Why am I seeing this?" | model fields, floorDiv cap, wording rules | U (cap property, banned phrases), C | RE §E |
| FR-018.1 MVP reports | MVP | reports | category aggregates | Reports tab | B.13 (sum invariant) | U, D, C | UX §G |
| FR-018.2 Trend/history reports | MVP+ | — | budget history kept in `budget_versions`; goal history via [OD-09](open-decisions.md#od-09) | — | — | — | DB §F/§G |
| FR-019 / .1–.7 Dates & periods | MVP | domain/dates | `date(x)=x` CHECKs; LocalDate TEXT | `/period` modal, filters | §C rules, Clock | U (3 TZs), D | BL §C, ADR-0003 |
| FR-020 Recurring schedules | MVP+ | — | `recurring_rules` provisional | — | catch-up/duplicate design | D (specified for later) | DB §H |
| FR-021 Notifications | MVP+ | — | — | — | — | — | DEP §2 |
| FR-022.1 JSON export | MVP | data-export | read snapshot | `/settings/export` | export builder + Zod export schema | U, I #11, E | SEC §6 |
| FR-022.2 Unencrypted warning | MVP | data-export | — | warning dialog | — | C | SEC §6 |
| FR-022.3 CSV | MVP+ | — | — | — | — | — | — |
| FR-023 Restore | Deferred | — | export `formatVersion` prepared | — | — | — | SEC §6 |
| FR-024 Offline | MVP | all | local only | — | no network code | E (airplane mode) | SA §F |
| FR-025.1 MVP settings | MVP | settings | `profile` | `/settings/*` | — | C, E | UX §H, NAV §B |
| FR-025 app lock / notifications | MVP+ | — | — | — | — | — | SEC §5 |
| FR-026.1 Delete confirmation naming item | MVP | all CRUD features | hard delete | `ConfirmationDialog` | — | C | UX §C.3, NAV §C |
| FR-026.2 Delete all data | MVP | settings | §J.7 transaction + VACUUM | `/settings/delete-data` | `settingsService.deleteAll` | D, I #9 | DB §J.7 |
| FR-026.3 All-or-nothing save | MVP | services | `withTransactionAsync` | not-saved banner | — | D, I | SA §D.1 |
| FR-026.4 One record per save action | MVP | services | client ID as PK (idempotency) | disabled Save | — | D, C | SA §D.1 |
| FR-026.5 Updates preserve data | MVP | data/db | forward-only migrations, backup | — | — | D (migration suite) | DB §J |
| FR-027.1 Save failure UX | MVP | services, hooks | — | banner, values kept | error mapping | C, I | SA §E |
| FR-027.2 DB open/upgrade failure | MVP | data/db, root layout | no auto-recreate | DatabaseErrorScreen | DatabaseGate | C, I #10 | SA §E.2, DB §J.2 |
| FR-027.3 No financial details in errors/logs | MVP | shared/lib/logger | — | message catalog | redaction | U (sentinel test) | SEC §4 |

## 2. Non-functional requirements and constraints

| PRS ID | Design destination | Test |
|---|---|---|
| NFR-001 / .1 / .2 Performance (50k, 300 ms, 1 s) | SQL aggregates, covering indexes, keyset pagination, FlatList (DB §I) | Device perf test on the reference device ([OD-18](open-decisions.md#od-18)) |
| NFR-002 Reliability | WAL + `synchronous=FULL`, commit-before-success (SEC §2, §7) | E (kill/reboot) |
| NFR-003 Data integrity | Integer minor units, BigInt ratios, deterministic engine (DB §D, BL) | U |
| NFR-004 / .1 / .2 Privacy, backup exclusion, privacy text | SEC §2, UX §H — iOS part pending [OD-15](open-decisions.md#od-15) | E (bmgr / iOS check) |
| NFR-005 Cross-platform | Pure TS domain; platform code isolated in the local module and `.web` files (SA, DEP §5) | E on both platforms |
| NFR-006 / .1 Accessibility (WCAG 2.2 AA) | Tokens with contrast, 48 dp, labels, text + icon status (UX §A, §J) | U (contrast), C (labels), E (TalkBack/VoiceOver) |
| NFR-007 Maintainability | Layering, ADRs, migrations (SA, ADRs) | Lint rules |
| NFR-008 Testability | Pure domain, injected Clock/Db (TS §0) | Coverage gates |
| §32 Financial safety | RE §E.3 wording; insights vs suggestions | U (banned phrases) |
| §33 / §33.1 Currency & display | DB §D formatter (Indian grouping, leading minus) | U |
| §34 / §34.1 / §34.2 Precision | DB §D, BL rounding helpers | U |
| §35 Security, no encryption claims | SEC (no-encryption banner) | Review checklist |
| §36 Out of scope | Not designed (dismissal, transfers, multi-currency, future dates, etc.) | Review |

## 3. User stories

| Story | Covered by |
|---|---|
| US-001 Record expense | FR-002, FR-003A, FR-005 · I #1 · E |
| US-002 Record income | FR-003 · I #2 |
| US-003 Savings goal | FR-009, FR-010 · I #4 |
| US-004 Understand spending | FR-018.1 · B.13 sum invariant |
| US-005 Recommendation | FR-012 – FR-017 · I #5 |
| US-006 Track budget | FR-008, FR-014 · I #3 |
| US-007 Offline | FR-024 · E airplane mode |

## 4. Requirements that cannot yet be fully mapped

| Item | Reason | Resolution path |
|---|---|---|
| FR-020 Recurring schedules | MVP+, needs its own spec | Provisional data design only (DB §H) |
| FR-021 Notifications | MVP+, needs spec (permission timing, lock-screen amounts) | — |
| FR-023 Restore | Deferred, needs spec | Export format versioned for it |
| FR-025 App lock | MVP+ | Architecture sketch (SEC §5) |
| FR-018.2 Trend reports | MVP+ | Goal history capture depends on [OD-09](open-decisions.md#od-09) |
| FR-011.3 On Track / At Risk / Behind rules | Designed, but the method affects product behavior | [OD-03](open-decisions.md#od-03), [OD-04](open-decisions.md#od-04) |
| FR-011.1 Lookback window | PRS is silent on how far back to look | [OD-05](open-decisions.md#od-05) |
| FR-009 Priority values | PRS lists "Priority" without values | [OD-06](open-decisions.md#od-06) |
| FR-003A / FR-019 Earliest allowed date | PRS review M-13 not resolved in v1.1 | [OD-12](open-decisions.md#od-12) |
| NFR-001.2 Reference device | "chosen in DESIGN"; proposal needs device availability | [OD-18](open-decisions.md#od-18) |
| NFR-004.1 on iOS | No Expo config; needs a native module spike | [OD-15](open-decisions.md#od-15) |
