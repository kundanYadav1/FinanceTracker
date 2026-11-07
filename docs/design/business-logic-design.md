# D5 — Domain & Business Logic Design

**Phase:** 2 — DESIGN · **Status:** Provisional ([OD-01](open-decisions.md#od-01))
**Location of all logic:** `src/domain/**`. Pure functions. No React, SQLite, or clock access (`today` is a parameter). (AGENTS.md §8, NFR-008.)
Related: [database-design §D](database-design.md#d-monetary-data) · [recommendation-engine-design](recommendation-engine-design.md) · ADRs [0002](../decisions/ADR-0002-money-integer-minor-units.md), [0003](../decisions/ADR-0003-local-calendar-dates.md)

---

## 0. Core types (illustrative)

```ts
// domain/money
type CurrencyCode = 'INR';                         // registry-driven; widened only by PRS change
type Money = { readonly amountMinor: number; readonly currency: CurrencyCode }; // safe integer
type Ratio = { readonly num: bigint; readonly den: bigint };                    // den > 0, exact
// domain/dates
type LocalDate = string & { __brand: 'LocalDate' };  // 'YYYY-MM-DD', validated
type MonthKey  = string & { __brand: 'MonthKey' };   // 'YYYY-MM'
type Period =
  | { kind: 'month'; month: MonthKey }
  | { kind: 'custom'; start: LocalDate; end: LocalDate };
// availability wrapper used by every calculation that can be undefined
type Available<T> = { kind: 'available'; value: T } | { kind: 'unavailable'; reason: UnavailableReason };
type UnavailableReason = 'NO_INCOME' | 'ZERO_BUDGET' | 'NO_COMPLETE_MONTH' | 'INSUFFICIENT_HISTORY'
                       | 'ZERO_HISTORICAL_AVERAGE' | 'GOAL_EXPIRED' | 'GOAL_COMPLETED'
                       | 'NON_POSITIVE_EXPECTED_SAVING' | 'GOAL_NOT_ACTIVE';
```

Each `reason` maps to a plain-language sentence in `domain/format/reasons.ts`, e.g. `NO_INCOME` → "No income recorded for this period" (FR-007.2).

### Rounding helpers (used everywhere a division happens)

| Helper | Rule | Used for |
|---|---|---|
| `ceilDiv(a, b)` | ⌈a/b⌉ for a ≥ 0, b > 0, integer math | Required monthly saving (FR-010.2), projection months, gap display |
| `floorDiv(a, b)` | ⌊a/b⌋ | "Up to" potential savings (never overstate, FR-017.1), progress bar width |
| `roundHalfAwayFromZero(r: Ratio, scale)` | `sign(num) × ⌊(2·|num|·scale + den) / (2·den)⌋` in BigInt | Every displayed percentage (scale 1000 → tenths of a percent, FR-007.4) and displayed averages (scale 1 → minor unit) |

Rounding applies **only at the display or output boundary** named in each formula. Intermediates stay as `Ratio` or as integers (FR-007.4, §34.2).

---

## A. Transaction domain

### A.1 Types
`TransactionType = 'income' | 'expense'`. The direction comes only from the type. Amounts are always positive (FR-003A.1).

```ts
type Transaction = {
  id: string; type: TransactionType; amount: Money; categoryId: string;
  paymentMethodId: string | null;   // non-null iff expense
  date: LocalDate; note: string | null; isRecurring: boolean;
  createdAt: string; updatedAt: string;  // UTC ISO, metadata only
};
```

### A.2 Validation rules (`domain/transactions/schema.ts`, Zod)

The same schema is used by the form resolver (inline errors) and by the service (authoritative re-check).

| Field | Rule | Error code → message (field named, FR-003A.9) |
|---|---|---|
| amount | required | `AMOUNT_REQUIRED` → "Enter an amount." |
| amount | after trimming and stripping a leading `₹`, the integer part matches one of: plain `^\d+$`, Western grouping `^\d{1,3}(,\d{3})+$`, or Indian grouping `^\d{1,2}(,\d{2})*,\d{3}$`; then an optional `.` and digits. The last comma group must be exactly 3 digits. | `AMOUNT_INVALID_CHARACTERS` → "Amount can contain only digits, commas and one decimal point." A value shaped like a comma decimal (`12,50`, `1.234,5`) → `AMOUNT_COMMA_DECIMAL` → "Use a dot (.) for decimals." |
| amount | fraction digits ≤ currency `minorDigits` (2) | `AMOUNT_TOO_MANY_DECIMALS` → "Amount can have at most 2 decimal places." (rejected, not rounded, §34.1) |
| amount | > 0 | `AMOUNT_NOT_POSITIVE` → "Amount must be greater than zero." |
| amount | ≤ 9,999,999,999 minor | `AMOUNT_ABOVE_MAX` → "Amount must be ₹99,99,99,999.99 or less." |
| type | income \| expense | (UI-controlled) |
| category | required; exists; `category.type === type`; not archived | `CATEGORY_REQUIRED` → "Choose a category." / "Choose an income source." |
| paymentMethod | required if expense; must be null if income | `PAYMENT_METHOD_REQUIRED` → "Choose a payment method." |
| date | valid LocalDate | `DATE_INVALID` → "Choose a valid date." |
| date | ≤ today (FR-019.5) — checked on create, and on edit **only if the date was changed** (see C.8) | `DATE_IN_FUTURE` → "Date can't be later than today." |
| date | ≥ `MIN_TRANSACTION_DATE` = 2000-01-01 ([OD-12](open-decisions.md#od-12)) | `DATE_TOO_EARLY` → "Date can't be earlier than 1 Jan 2000." |
| note | optional; trimmed; empty → null; ≤ 200 Unicode code points (`[...s].length`) | `NOTE_TOO_LONG` → "Note can be at most 200 characters." |
| isRecurring | boolean; information only (FR-002.1) | — |

Grouping commas are accepted only where they form valid Indian (`1,00,000`) or Western (`100,000`) grouping, and are then stripped. Malformed grouping such as `1,0,0` is rejected. Some device keyboards (`decimal-pad` under non-English locales) emit `,` as the decimal separator. Because a valid group must end in exactly 3 digits, `12,50` can never be silently read as 1250. A minus sign is always rejected.

### A.3 Category rules
- Expense categories have a spending class (Essential / Discretionary / Unclassified, FR-004.1). Income categories have none.
- The class is fixed in the MVP. It is used only by the recommendation engine (FR-016.1).
- **Defaults on the form:** the category has **no default** (FR-003A.5 requires an explicit selection). The payment method defaults to the most recently used one, or Cash (FR-005.1). The date defaults to today.

### A.4 Editing and deletion
- Every field is editable, including `type`. Switching the type clears the category (types differ) and sets or clears the payment method using the FR-005.1 default. The currency is not editable; it is always the primary currency.
- An update is a full replacement of the user fields, plus `updated_at`. `created_at` and `id` are immutable.
- Deletion is a hard delete after a confirmation that names the item ([database §B.5](database-design.md#b5-deletion-and-archive-policy)).
- After any change, every figure whose period contains the old or new date is re-derived from SQLite (FR-002 acceptance, FR-006 acceptance).

### A.5 Monetary precision
See [database-design §D](database-design.md#d-monetary-data). Domain functions:
`parseAmount(text, currency): Result<Money, ValidationError>`, `add`, `subtract`, `sum(list)` (all safe-integer checked), `compare`, `ratio(a, b): Available<Ratio>`, `formatMoney`, `formatPercent(ratio)`.

---

## B. Financial calculations

Notation: `I` income, `X` expenses, `S` savings, all in minor units of the primary currency. `P` is a period. `M` is a month. `today` is a LocalDate.

### B.1 Total income — `calculateTotalIncome(P)`
- **Formula:** `I(P) = Σ amount_minor` over transactions with `type='income' AND start(P) ≤ date ≤ end(P)` (computed in SQL).
- **Input:** period; repository aggregate. **Output:** `Money` (≥ 0).
- **Edge cases:** no rows → 0 with `hasTransactions=false`, so the UI can show the FR-006.2 empty state rather than a bare ₹0.00. A non-safe integer → `IntegrityError`. More than one currency group → `IntegrityError`.
- **Example:** 1 Nov salary ₹50,000.00 (5,000,000) + 15 Nov freelance ₹2,500.50 (250,050) → `I = 5,250,050` → "₹52,500.50".

### B.2 Total expenses — `calculateTotalExpenses(P)`
Same as B.1 with `type='expense'`. Example: 0.10 + 0.20 entered as two expenses → 10 + 20 = **30** minor = "₹0.30" exactly (NFR-003).

### B.3 Savings for a period — `calculatePeriodSavings(I, X)` (FR-007.0)
- **Formula:** `S = I − X`. May be negative (FR-007.1).
- **Output:** `Money` + label: "Monthly savings" when P is a month period, otherwise "Savings" (FR-007.0).
- **Edge cases:** I = X = 0 with no transactions → empty state. Negative → displayed `-₹3,000.00` with a "spent more than earned" indicator (icon + text, not color alone). It is never clamped to 0.
- **Example:** I = 5,000,000, X = 3,500,000 → S = 1,500,000 → "₹15,000.00".

### B.4 Savings rate — `calculateSavingsRate(I, X)` (FR-007.2 – .4)
- **Formula:** `rate = (I − X) / I × 100` as `Ratio{num: (I−X)·100, den: I}` when I > 0.
- **Output:** `Available<Ratio>`. Displayed with `roundHalfAwayFromZero(rate, tenths)` → "30.0%".
- **Edge cases:**

  | Case | Result |
  |---|---|
  | I = 0 (any X) | `unavailable: NO_INCOME` → "Not available — No income recorded for this period" (never 0%, −100%, ∞) |
  | X > I > 0 | negative, e.g. "-12.5%" (FR-007.3) |
  | X = 0, I > 0 | 100.0% |
  | rate = 26.45% exactly | displays 26.5% (half away from zero) |
  | rate = −26.45% | −26.5% |
- **Example:** I = 5,000,000, X = 3,500,000 → 1,500,000·100 / 5,000,000 = 30 → "30.0%".

### B.5 Budget utilization — `evaluateBudget(amount, spent)` (FR-008)
- **Formula:** `utilization = spent / amount × 100` when amount > 0.
- **Status rules** (FR-008.6/.7; warning threshold `BUDGET_WARNING_PERCENT = 80`, a DESIGN constant):

  | Condition (evaluated in order) | Status | Utilization shown |
  |---|---|---|
  | amount = 0 and spent = 0 | Healthy | not shown |
  | amount = 0 and spent > 0 | Exceeded | not shown |
  | spent > amount | Exceeded | yes (e.g. 112.0%) |
  | `spent × 100 ≥ amount × 80` (BigInt, no division) | Warning | yes |
  | otherwise | Healthy | yes |
- **Output:** `{ status, utilization: Available<Ratio>, remaining: Money, overspent: Money }`.
- **Edge cases:** spent == amount → Warning (100.0%, not Exceeded, FR-008.7). spent = 79.99% → Healthy. A budget with no spending → Healthy, 0.0%.
- **Example:** amount ₹3,000 (300,000), spent ₹2,760 (276,000) → 92.0% → Warning, ₹240.00 remains (FR-014 example).

### B.6 Remaining budget
- **Formula:** `remaining = max(amount − spent, 0)`, `overspent = max(spent − amount, 0)`. Exactly one is shown: "₹240.00 left" or "₹360.00 over" (FR-008.8, never negative).
- **Example:** amount 300,000, spent 336,000 → remaining 0, overspent 36,000 → "₹360.00 over budget".

### B.7 Category average spending — `calculateCategoryAverage(c, M)` (FR-013.1)
- **Formula:** `avg(c, M) = (spend(c, M−1) + spend(c, M−2) + spend(c, M−3)) / 3`, as `Ratio{num: Σ, den: 3}`. A month with no spending counts as 0.
- **Precondition:** history is sufficient ([C.6](#c6-history-sufficiency)). Otherwise `unavailable: INSUFFICIENT_HISTORY`.
- **Output:** `Available<Ratio>`. Displayed rounded half away from zero to a minor unit.
- **Edge cases:** all three months 0 → avg 0 → no anomaly (FR-013.4). The months are always the 3 calendar months immediately before M, even when M is the current month.
- **Example:** Food Aug ₹4,500, Sep ₹5,200, Oct ₹5,000 → Σ = 1,470,000 → avg = 490,000 → "₹4,900.00" (FR-013 example).

### B.8 Category spending deviation — `calculateDeviation(current, avg)`
- **Formula:** `deviation% = (current − avg) / avg × 100 = (3·current − Σ) × 100 / Σ` (exact, using Σ from B.7).
- **Output:** `Available<Ratio>`. `unavailable: ZERO_HISTORICAL_AVERAGE` when Σ = 0 (FR-013.4).
- **Excess amount:** `excess = current − avg` as `Ratio{3·current − Σ, 3}`. Displayed as "up to" with **floorDiv** (FR-017.1).
- **Example:** current ₹6,200 (620,000), Σ = 1,470,000 → (1,860,000 − 1,470,000)·100 / 1,470,000 = 26.53…% → "26.5%". Excess = 390,000/3 = 130,000 → "up to ₹1,300.00".

### B.9 Savings-goal progress — `calculateGoalProgress(goal)`
- **Formula:** `remaining = max(target − saved, 0)`; `progress = min(saved, target) / target × 100`.
- **Display rule:** half away from zero to one decimal (FR-007.4), with one exception: a goal that is not completed is shown as at most **99.9%**, so rounding never displays 100% before the target is reached. The progress bar width uses floor.
- **Edge cases:** saved > target → 100%, remaining 0, plus "₹X above target". saved = 0 → 0.0%.
- **Example:** target 10,000,000, saved 2,500,000 → 25.0%, remaining ₹75,000.00 (FR-009 example).

### B.10 Required monthly saving — `calculateRequiredMonthlySaving(goal, today)` (FR-010)
- **Remaining saving periods** (FR-010.1): `p = monthIndex(target_date) − monthIndex(today) + 1`, where `monthIndex(y-m) = y·12 + (m−1)`.
- **Formula** (FR-010.2): `required = ceilDiv(remaining, p)`.
- **Outcomes** (FR-010.3), evaluated in this order:

  | Condition | remaining | required | tracking precedence |
  |---|---|---|---|
  | saved ≥ target | 0 | 0 | Completed |
  | target_date < today (and saved < target) | target − saved | `unavailable: GOAL_EXPIRED` | Expired |
  | target month = current month (p = 1) | target − saved | target − saved | per B.12 |
  | p ≥ 2 | target − saved | ceilDiv(remaining, p) | per B.12 |

  `target ≤ 0` cannot occur (DB CHECK + validation). Target date later in the current month but ≥ today → p = 1. Target date today → p = 1 (not expired: "before today" is false).
- **Example:** target ₹1,00,000, saved ₹25,000, today 6 Nov 2026, target 31 Dec 2026 → p = 2 → ⌈7,500,000 / 2⌉ = 3,750,000 → "₹37,500.00/month". Odd remainder: remaining 1,000,001, p = 3 → 333,334 (3 × 333,334 = 1,000,002 ≥ remaining, so following the plan never falls short, review R-08).

### B.11 Savings gap — `calculateSavingsGap(goals, expected, today)` (FR-015)
- **Expected monthly saving `E`** (FR-011.1), `calculateExpectedMonthlySaving(monthlySavings, today)`:
  1. Candidate months: the 12 most recent **complete** months (`currentMonth−1 … currentMonth−12`). The lookback bound is [OD-05](open-decisions.md#od-05).
  2. Keep the months that have ≥ 1 transaction (income or expense).
  3. Take up to the 3 most recent → set H.
  4. If H is empty → `unavailable: NO_COMPLETE_MONTH`. Otherwise `E = Ratio{Σ_{m∈H} S(m), |H|}`. E may be ≤ 0.
- **Trackable goals G:** `lifecycle_status='active'`, not Completed, not Expired.
- **Formula:** `R_total = Σ_{g∈G} required(g)` (integer). `gap = R_total − E` (Ratio).
- **Output:**
  - E unavailable → `{ kind: 'requiredOnly', R_total }` (fact only, FR-015.2).
  - G empty → no gap.
  - `gap > 0` → `{ kind: 'gap', R_total, E, gap }`. Displayed: R_total exact, E rounded half away from zero, gap with **ceil** (do not understate the need).
  - `gap ≤ 0` → `{ kind: 'covered', R_total, E }`.
- **Example:** two goals requiring ₹10,000 and ₹8,750 → R_total = 1,875,000. Last 3 complete months savings ₹14,000, ₹16,500, ₹14,500 → E = 4,500,000/3 = 1,500,000 → gap = 375,000 → "₹3,750.00/month" (FR-015 example).

### B.12 Goal tracking state and projected completion — `calculateGoalTracking(goal, portfolio, E, today)` (FR-011, FR-009.3)

**Tracking state** (FR-011.3 precedence), for **Active** goals only. Paused and Archived goals show their lifecycle status and take no part (FR-009.2):

| Order | Condition | State | Explanation template |
|---|---|---|---|
| 1 | saved ≥ target | **Completed** | "You've reached your target of ₹X." |
| 2 | target_date < today | **Expired** | "The target date (31 Oct 2026) has passed with ₹X still to save." |
| 3 | E unavailable | *(no state)* | "Tracking starts after your first complete month of transactions." (FR-011.1) |
| 4 | E ≥ R_total | **On Track** | "Your goals need ₹R/month together. You've saved about ₹E/month over your last n complete months." |
| 5 | 4·E ≥ 3·R_total (E ≥ 75% of R_total) and E > 0 | **At Risk** | "…which covers about P% of what your goals need." |
| 6 | otherwise (incl. E ≤ 0) | **Behind** | "…which covers about P% of what your goals need." / "Your recent months show no net saving." |

- `AT_RISK_COVERAGE_PERCENT = 75` (DESIGN constant).
- The state is evaluated against the **combined** requirement `R_total` of all trackable goals, not each goal on its own. This guarantees that FR-015.1 ("not present any single goal as fully funded while the total is unfunded") holds: either all trackable goals are On Track, or none is. The priority-allocation alternative is documented in [OD-03](open-decisions.md#od-03).
- Coverage `P = E / R_total × 100` is displayed rounded (FR-007.4).

**Projected completion** (FR-009, FR-009.3):
- Not shown when: Completed ("Target reached"), Expired ("Update the target date to see a projection"), not Active, E unavailable ("Not enough history yet"), or E ≤ 0 (`NON_POSITIVE_EXPECTED_SAVING` → "Your recent months show no net saving, so a completion date can't be projected").
- Otherwise each trackable goal is assigned a **proportional share** of E: `share_g = E × required_g / R_total`.
  `months_g = ⌈ remaining_g / share_g ⌉ = ⌈ remaining_g × R_total × |H| / (ΣS_H × required_g) ⌉` (BigInt).
  `projectedMonth = currentMonth + (months_g − 1)`, displayed as "Mar 2027" (month granularity, matching monthly saving periods).
- `months_g > 600` → "More than 50 years at the current pace".
- **Consistency invariant (tested):** if E ≥ R_total then every `projectedMonth ≤ targetMonth`; if E < R_total then every `projectedMonth ≥ targetMonth`. The method is pending [OD-04](open-decisions.md#od-04).
- **Example:** one goal, remaining 7,500,000, required 3,750,000 (p = 2), E = 3,000,000. R_total = 3,750,000, share = 3,000,000, months = ⌈7,500,000/3,000,000⌉ = 3 → today Nov 2026 → "Jan 2027" (target Dec 2026 → At Risk, 80.0% coverage).

### B.13 Category distribution (reports, FR-018.1)
- `categoryTotals(P)` = expense `SUM … GROUP BY category_id`, ordered by amount desc, then category `sort_order`.
- `share_c = total_c / X × 100`, displayed per FR-007.4. **Invariant (tested):** `Σ total_c = X` exactly (US-004). The displayed shares may not add to exactly 100.0% because of rounding; no "total %" row is shown.
- X = 0 → empty state, no shares.

---

## C. Financial date rules

([ADR-0003](../decisions/ADR-0003-local-calendar-dates.md))

| # | Rule |
|---|---|
| C.1 **Representation** | Financial dates are `LocalDate` strings `YYYY-MM-DD` (FR-019.1). Months are `MonthKey` `YYYY-MM`. They are compared lexically, which is correct for zero-padded ISO. **Never** `new Date('YYYY-MM-DD')`, because JS parses that as UTC midnight and shifts the day west of UTC. |
| C.2 **Today** | `Clock.today()` is the only source. It builds the date from local components: `const d = new Date(); toLocalDate(d.getFullYear(), d.getMonth()+1, d.getDate())` (FR-019.2). It is evaluated at the moment of use, not cached across app foregrounding. Hooks re-evaluate on focus and on `AppState` 'active'. |
| C.3 **Month boundaries** | `monthStart(M) = M-01`. `monthEnd(M) = M-<daysInMonth>`, where `daysInMonth` uses integer math with the Gregorian leap rule (`y%4==0 && (y%100!=0 || y%400==0)`). Both are inclusive (FR-019.3). |
| C.4 **Current / previous month** | Current = month of `today`, an **incomplete** month. Previous = `addMonths(current, −1)` via `monthIndex` arithmetic (Jan → Dec of the previous year). |
| C.5 **Complete month** | M is complete ⇔ `today > monthEnd(M)` (FR-019.6). Only complete months feed historical calculations (B.7, B.11). |
| C.6 **History sufficiency** | <a id="c6-history-sufficiency"></a>`historyMonths = monthIndex(currentMonth) − monthIndex(month(earliestTransactionDate))`, i.e. the number of complete months from the month of the first transaction through last month. History-based rules need `historyMonths ≥ 3` (FR-013.2). A partial first month counts as a history month. This is a literal reading of FR-013.2, and the risk is recorded in [OD-22](open-decisions.md#od-22). |
| C.7 **Custom range** | `start ≤ end` (FR-019.4), both inclusive. `end` may not be after today (no future data exists). Allowed span: ≤ 10 years (bounds query cost). It affects displayed totals and reports only, never recommendations or goals (FR-019.7). |
| C.8 **Near midnight / time-zone travel** | The date field defaults to `today` when the form opens and is saved as shown. A form opened at 23:58 and saved at 00:01 keeps the previous date, which is valid (≤ today). If the device time zone later moves west, a saved transaction may be "after today". It still counts in its own month, and editing it does not re-trigger the future-date rule unless the date field itself changes. Saved dates never shift (FR-019.1). |
| C.9 **Leap years** | 29 Feb is a valid date in leap years only (`date(x)=x` CHECK + domain). Month periods include 29 Feb (FR-019.3). Month arithmetic never uses day counts, so `required monthly saving` is unaffected by February length. |
| C.10 **Target dates in the past** | Creation and target-date edits require ≥ today. A target that later becomes past makes the goal Expired (B.10). |
| C.11 **Monthly saving periods** | Calendar months; the current month counts as period 1 (FR-010.1). |
| C.12 **Timestamps** | `created_at`/`updated_at` are UTC instants for audit and sort tie-breaks only. They never decide a period. Conversion between the two kinds is never needed and therefore not allowed. |
| C.13 **Libraries** | Core date math is hand-written integer code in `domain/dates` (small, exhaustively testable, identical on Hermes Android/iOS). `date-fns` is used only for **display formatting** of a LocalDate, through a `Date` built with `new Date(y, m−1, d, 12)` (local noon avoids DST-midnight gaps). Display formats: `6 Nov 2026`, `Nov 2026`, and relative headers "Today", "Yesterday" in lists. |

---

## D. Financial integrity edge cases

| Case | Behavior | Where specified |
|---|---|---|
| Zero income | Savings = −X. Savings rate unavailable with the reason. | B.3, B.4 |
| Zero expenses | Savings = I. Rate 100.0% when I > 0. Budget statuses Healthy. | B.3 – B.5 |
| Negative savings | Shown with a minus and an indicator. Rate negative. It lowers E and can make goals Behind. Projection unavailable if E ≤ 0. | B.3, B.4, B.12 |
| Zero budget | Utilization hidden. Healthy at 0 spend, Exceeded above. | B.5 |
| Negative remaining budget | Never shown. "₹X over budget" instead. | B.6 |
| Large values | Per-record ≤ 9,999,999,999. Sums checked with `Number.isSafeInteger`. Ratios in BigInt. Overflow → `IntegrityError`, the section shows an error, never a wrong number. | database §D |
| Completed goal | Required 0. State Completed. Excluded from R_total and the gap. No projection. | B.10 – B.12 |
| Expired goal | Required not calculated. State Expired. Excluded from R_total. Suggest updating the target date. | B.10, B.12 |
| Missing historical data | E unavailable → no tracking state, no gap (required total shown as fact), no projection. Anomaly rules suppressed with "More history needed: n of 3 months". | B.11, B.12, recommendation §D |
| Months with no transactions inside the lookback | Skipped for E (FR-011.1). Counted as 0 for category averages (FR-013.1). These are deliberately different rules from the PRS. | B.7, B.11 |
| Goal saved amount edited down below previous | Allowed (FR-009.1). It may move a Completed goal back to tracking. | B.12 |
| Device clock wrong / manual change | "Today" follows the device. Future-date validation uses it. Stored data is unaffected. | C.2, C.8 |
| Currency mismatch in data | `IntegrityError`. Never summed. | database §D |
