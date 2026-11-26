# D6 — Recommendation Engine Design

**Phase:** 2 — DESIGN · **Status:** Provisional ([OD-01](open-decisions.md#od-01)) · **PRS:** FR-012 – FR-017, FR-019.6/.7, §32
Related: [business-logic-design](business-logic-design.md) · [ADR-0007](../decisions/ADR-0007-recommendations-computed-on-demand.md)

The engine is deterministic and explainable, with no machine learning and no external API (FR-012, §36). Every output names the rule that produced it, the facts it used, and the condition that was met.

---

## A. Engine architecture

```mermaid
flowchart LR
    subgraph Feature["features/recommendations (service)"]
        L[loadRecommendationInput(today)<br/>≤ 5 aggregate queries]
    end
    subgraph Domain["domain/recommendations (pure)"]
        CTX[1 Build context<br/>months, history sufficiency, E, R_total]
        RULES[2 Evaluate rules<br/>each rule: context → Candidate[]]
        SUP[3 Suppress & merge]
        RANK[4 Rank]
        TXT[5 Render text<br/>templates + formatMoney/Percent]
    end
    L --> CTX --> RULES --> SUP --> RANK --> TXT --> OUT[Recommendation[] + Notices[]]
```

Separation:
- **UI** only renders `Recommendation` objects. It never decides whether one applies.
- **Database access** happens only in `loadRecommendationInput` (service), which returns plain aggregates.
- **Forms and navigation** have no dependency on the engine. The engine is triggered by data revisions ([state-management §3](state-management-design.md#3-data-refresh-strategy)).

### A.1 Input (`RecommendationInput`, aggregates only)

```ts
type RecommendationInput = {
  today: LocalDate;
  currency: CurrencyCode;
  earliestTransactionDate: LocalDate | null;
  categories: { id; type; name; spendingClass }[];
  // expense spend per category for the current month and the 3 months before it
  categoryMonthSpend: { categoryId: string; month: MonthKey; spentMinor: number }[];
  // savings per complete month for the last 12 complete months, with a has-transactions flag
  monthlySavings: { month: MonthKey; savingsMinor: number; hasTransactions: boolean }[];
  budgetsInEffect: { scopeKey: string; categoryId: string | null; amountMinor: number }[]; // current month
  currentMonthSpendTotal: number;
  goals: SavingsGoal[]; // all lifecycle states; engine filters
};
```

### A.2 Processing stages
1. **Context:** `currentMonth`, `historyMonths` ([business-logic C.6](business-logic-design.md#c6-history-sufficiency)), `E` (B.11), goal snapshots and `R_total` (B.10 – B.12), budget evaluations (B.5), and category averages and deviations (B.7 – B.8).
2. **Rules:** each rule is a pure function `(ctx) => Candidate[]`. Rules never call each other.
3. **Suppress & merge** ([§D.5](#d5-preventing-repeated-and-duplicate-recommendations)).
4. **Rank** ([§E.2](#e2-priority-and-ordering)).
5. **Render:** templates in `domain/recommendations/text.ts`. Facts and suggestions are separate fields.

**Evaluated period:** the **current calendar month** (month-to-date), compared against complete months only (FR-013.3, FR-019.6, FR-019.7). The dashboard's selected period, including custom ranges, never changes recommendation results.

---

## B. Recommendation types — scope

| # | Requested type | Status | Rule ID(s) | Basis |
|---|---|---|---|---|
| 1 | High category spending | **MVP**, covered by anomaly rules (relative to the user's own history, never "large in absolute terms", FR-016) | `ANOM-DISC`, `ANOM-INFO` | FR-013, FR-016 |
| 2 | Spending above historical average | **MVP** | `ANOM-DISC`, `ANOM-INFO` | FR-013 |
| 3 | Budget approaching limit | **MVP** | `BUD-WARN` | FR-014 |
| 4 | Budget exceeded | **MVP** | `BUD-OVER` | FR-014 |
| 5 | Savings gap | **MVP** | `GAP`, `GAP-INFO` | FR-015 |
| 6 | Goal at risk | **MVP, via `GAP`.** Goal states are aggregate ([business-logic B.12](business-logic-design.md#b-financial-calculations)), so "goal at risk" is the savings gap. A per-goal rule would duplicate it. | `GAP` | FR-011, FR-015 |
| 6b | Goal expired | **Proposed extension**, not built without approval ([OD-08](open-decisions.md#od-08)) | `GOAL-EXPIRED` | FR-011 state exists; no PRS rule |
| 7 | High recurring expenses | **MVP+.** Needs FR-020 schedules. The `is_recurring` flag is information only (FR-002.1) and must not drive rules. | — | FR-012 (MVP+) |
| 8 | Potential subscription reduction | **MVP, covered by `ANOM-DISC`** for the Subscriptions category (discretionary). A dedicated subscription rule is MVP+ with FR-020. | `ANOM-DISC` | FR-016 |
| 9 | Unusual spending patterns (e.g. one unusually large transaction) | **Proposed extension**, not in the MVP | — | No PRS requirement |

---

## C. Rule definitions

Global constants (`domain/recommendations/thresholds.ts`). FR-013 delegates anomaly thresholds and FR-008.7 delegates the warning threshold to DESIGN:

| Constant | Value | Rationale |
|---|---|---|
| `BUDGET_WARNING_PERCENT` | 80 | Common convention. Gives roughly a week's notice in a typical month. |
| `ANOMALY_MIN_INCREASE_PERCENT` | 20 | Below 20% is normal monthly noise for discretionary spending. |
| `ANOMALY_MIN_EXCESS_MINOR` (INR) | 50,000 (₹500) | Suppresses trivial alerts on small categories. Per-currency entry in the registry. |
| `HISTORY_MONTHS_REQUIRED` | 3 | FR-013.2 |
| `AT_RISK_COVERAGE_PERCENT` | 75 | [business-logic B.12](business-logic-design.md) |
| `DASHBOARD_MAX` | 3 | FR-006.1, FR-012.3 |

### C.1 `BUD-OVER` — Budget exceeded (FR-014)

| Field | Definition |
|---|---|
| Trigger | For each budget in effect for the current month (overall + category): `evaluateBudget(...).status = Exceeded`. |
| Required history | None. |
| Calculation | `overspent = spent − amount` (B.6). Zero budget: spent > 0. |
| Severity | **High** |
| Kind | Suggestion if the category is Discretionary or the scope is overall; otherwise **Insight** (§32, FR-016.1). |
| Title | "{Category} budget exceeded" / "Monthly budget exceeded" |
| Reason (facts) | "You've spent ₹3,360.00 of your ₹3,000.00 {Category} budget this month — ₹360.00 over." Zero budget: "You set a ₹0.00 budget for {Category} and have spent ₹Y this month." |
| Suggested action | Discretionary: "Consider holding off on non-essential {category} spending for the rest of {Month}." Overall: "Consider reviewing your discretionary spending for the rest of {Month}: {top up to 3 discretionary categories this month}." Essential/Unclassified: *no reduction suggestion*. Instead: "If this level of spending is expected, you may want to adjust the budget amount." |
| Potential savings | None (the money is already spent). Field omitted (FR-017.1). |
| Suppression | Excludes `BUD-WARN` for the same budget. |

### C.2 `BUD-WARN` — Budget approaching limit (FR-014)

| Field | Definition |
|---|---|
| Trigger | Status = Warning (`spent·100 ≥ amount·80` and `spent ≤ amount`, amount > 0). |
| Required history | None. |
| Calculation | utilization (B.5), remaining (B.6). |
| Severity | **Medium** |
| Kind | Suggestion (Discretionary/overall), otherwise Insight. |
| Title | "{Category} budget almost used" |
| Reason | "You have used 92.0% of your {Category} budget. ₹240.00 remains for {Month}." (FR-014 example) |
| Suggested action | Discretionary/overall: "Keeping {category} spending under ₹240.00 for the rest of {Month} will keep you within budget." Essential: none ("₹240.00 remains in your {Category} budget."). |
| Potential savings | None. |
| Suppression | Not emitted if `BUD-OVER` exists for the same budget (mutually exclusive by status anyway). |

### C.3 `ANOM-DISC` — Discretionary spending above usual level (FR-013, FR-016, FR-017)

| Field | Definition |
|---|---|
| Trigger | Category is **Discretionary** AND history sufficient (`historyMonths ≥ 3`) AND `Σ3 > 0` (avg > 0, FR-013.4) AND month-to-date `current > avg` (FR-013.3) AND `deviation ≥ 20%` (`(3·current − Σ3)·100 ≥ 20·Σ3`) AND `excess ≥ ₹500` (`3·current − Σ3 ≥ 3·50,000`). |
| Required history | 3 complete months (FR-013.2). |
| Calculation | B.7 (avg), B.8 (deviation, excess). No extrapolation of the incomplete month (FR-013.3). |
| Severity | **Medium**; **High** when a `GAP` recommendation is also present (FR-015: reducible discretionary spending matters most when goals are unfunded). |
| Kind | Suggestion |
| Title | "{Category} spending is above your usual level" |
| Reason | "You've spent ₹6,200.00 on {category} so far in {Month}, which is 26.5% more than your 3-month average of ₹4,900.00." |
| Suggested action | "Consider cutting back on {category descriptor} for the rest of {Month}." |
| Potential savings | "Up to ₹1,300.00 this month (estimate)": `floorDiv(3·current − Σ3, 3)`, the spending above average (FR-017.1 cap). Never "will save" or "guaranteed". |
| Suppression | If `BUD-OVER` exists for the same category, the anomaly is **merged** into it as an extra fact plus potential savings (one card per category). |

### C.4 `ANOM-INFO` — Essential/unclassified spending higher than usual (FR-013.5)

| Field | Definition |
|---|---|
| Trigger | Same numeric conditions as C.3, for a category whose class is **Essential** or **Unclassified**. |
| Severity | **Low** |
| Kind | **Insight** (fact only) |
| Title | "{Category} spending is higher than usual" |
| Reason | "You've spent ₹14,000.00 on {category} so far in {Month}, 40.0% more than your 3-month average of ₹10,000.00." |
| Suggested action | **None.** Shows the neutral note: "This may be expected — for example, an annual or one-time payment." Never suggests reducing (§32, FR-016.1). |
| Potential savings | None. |
| Suppression | Merged into `BUD-OVER`/`BUD-WARN` for the same category if present. |

### C.5 `GAP` — Savings gap (FR-015)

| Field | Definition |
|---|---|
| Trigger | `E` available AND trackable goals exist AND `R_total − E > 0` (B.11). |
| Required history | ≥ 1 complete month with transactions (FR-011.1). |
| Calculation | B.11. Supporting list: discretionary categories ranked by 3-month average spend (or by the average over the available complete months if fewer than 3), top 3 with average > 0. |
| Severity | **High** |
| Kind | Suggestion |
| Title | "Your goals need more than you're currently saving" |
| Reason | "Your active goals need ₹18,750.00/month together. Over your last 3 complete months you saved about ₹15,000.00/month — a gap of about ₹3,750.00/month." |
| Suggested action | "Your largest discretionary categories are Food (eating out) (about ₹4,900.00/month) and Shopping (about ₹3,200.00/month). Reducing these could help close the gap. You could also consider a later target date or a lower target." Essential categories are never listed. |
| Potential savings | Only if ≥ 1 `ANOM-DISC` exists this month: "Up to ₹X this month (estimate) from spending above your usual level in {categories}", where X = Σ of those anomalies' potential savings. Otherwise omitted. |
| Suppression | One per evaluation (subject = all goals). Excludes `GAP-INFO`. |

### C.6 `GAP-INFO` — Required saving (fact only) (FR-015.2)

| Field | Definition |
|---|---|
| Trigger | Trackable goals exist AND `E` unavailable. |
| Severity | **Low** · Kind **Insight** |
| Reason | "Your active goals need ₹18,750.00/month in total. Savings comparisons start after your first complete month of transactions." |
| Action / potential savings | None. |

### C.7 Proposed extensions (not MVP)

| Rule | Trigger sketch | Status |
|---|---|---|
| `GOAL-EXPIRED` | Active goal, tracking state Expired → Insight: "The target date for {goal} has passed with ₹X still to save. You can update the target date or archive the goal." | [OD-08](open-decisions.md#od-08) |
| `RECUR-HIGH` | Recurring schedule share of income > threshold | MVP+ (FR-020) |
| `TXN-UNUSUAL` | One transaction > k × category monthly average | Not specified; not planned |

### C.8 Notices (not recommendations)

`Notice` objects explain why rules are silent (FR-006.2, FR-013.2). They are rendered separately from recommendation cards.

| Notice | Condition | Text |
|---|---|---|
| `NEEDS_HISTORY` | `historyMonths < 3` | "Spending comparisons need 3 complete months of history. You have {n}." |
| `NO_GOALS_OR_BUDGETS` | no budgets and no active goals | "Add a budget or a savings goal to get more suggestions." |
| `ALL_CLEAR` | history sufficient, nothing triggered | "Nothing needs your attention right now." |

---

## D. Historical analysis

### D.1 Minimum data
- Anomaly rules: `historyMonths ≥ 3` (FR-013.2; definition in [business-logic C.6](business-logic-design.md#c6-history-sufficiency)).
- Gap / goal states: ≥ 1 complete month with ≥ 1 transaction within the 12-month lookback (FR-011.1, [OD-05](open-decisions.md#od-05)).
- Budget rules: none.

### D.2 Monthly averages
- **Category average:** the arithmetic mean of the 3 calendar months immediately before the evaluated month. Zero-spend months count as 0 (FR-013.1). Exact `Ratio`, no intermediate rounding.
- **Expected monthly saving:** the mean over up to 3 most recent complete months **that contain transactions** (FR-011.1).

### D.3 Missing months
- Category average: missing = 0 (a month without restaurant spending is real information).
- Expected saving: months with no transactions at all are skipped (they most likely mean the app wasn't used, not that income and expenses were zero).
- This asymmetry comes directly from the PRS and is intentional. It is documented in code comments and tests.

### D.4 Unusually large one-time transactions
- The mean is fixed by FR-013.1, so a one-off large payment inflates the next 3 months' average (fewer alerts) and triggers an alert in its own month.
- Mitigations within the PRS:
  - Essential/Unclassified categories produce Insight-only output with the "may be expected" note, so a one-off essential payment never yields a "reduce" suggestion (review R-11).
  - The absolute floor (₹500) and the 20% floor suppress noise.
  - Potential savings are capped at the excess over average, so a one-off never inflates the estimate beyond the observed excess.
- A median or outlier-trimmed average is **not** used, because it would contradict FR-013.1. It can be proposed as a PRS change after real-world use.

### D.5 Preventing repeated and duplicate recommendations
- Recommendations are not stored and not pushed as notifications (no notifications in the MVP), so there is no repeat-notification risk.
- **Key:** `${ruleId}:${subjectKey}:${month}`, deterministic and unique within an evaluation.
- **Within an evaluation:** at most one card per subject. Merge order: `BUD-OVER` ⊃ `BUD-WARN` ⊃ `ANOM-*` for the same category (the higher rule absorbs the lower one's facts and potential savings). `GAP` ⊃ `GAP-INFO`.
- **Dashboard:** top 3 after ranking (FR-006.1).
- Dismiss and snooze are out of scope (FR-012.3, §36), so read/dismissed state is not modeled.

### D.6 Refresh
- Calculated on display (FR-012.2): when the Dashboard or Recommendations screen gains focus, when the `transactions`, `budgets` or `goals` revision changes while it is mounted, and when the app returns to the foreground on a new day (`today` changed).
- Cost: ≤ 5 indexed aggregate queries + O(categories × 4 months + goals) pure work, well within the NFR-001.2 1 s dashboard budget.

---

## E. Recommendation output

### E.1 Model

```ts
type Recommendation = {
  key: string;                          // 'ANOM-DISC:cat_food:2026-11'
  ruleId: 'BUD-OVER' | 'BUD-WARN' | 'ANOM-DISC' | 'ANOM-INFO' | 'GAP' | 'GAP-INFO';
  ruleVersion: number;                  // bump when thresholds/text change; aids explanation & tests
  kind: 'suggestion' | 'insight';       // §32: insight = facts only
  priority: 'high' | 'medium' | 'low';
  subject: { type: 'category'; categoryId: string }
         | { type: 'budget'; scopeKey: string }
         | { type: 'goals' };
  period: { month: MonthKey; isComplete: false };   // evaluated period (current month)
  title: string;
  reason: string;                        // observed facts, past tense / present perfect
  supportingMetrics: Metric[];           // structured facts for the detail screen
  suggestedAction: string | null;        // null for insights
  potentialSavings: { upTo: Money; label: 'estimate'; basis: string } | null;
  explanation: { ruleName: string; condition: string };  // "Shown because month-to-date spending is ≥ 20% and ≥ ₹500.00 above your 3-month average"
  evaluatedOn: LocalDate;                // "today" used for the evaluation (the 'created date' equivalent)
};
type Metric = { label: string; value: Money | Ratio | number | MonthKey; display: string };
```

Mapping to the requested fields: ID → `key`. Type → `ruleId`. Title, Description → `title`, `reason`. Priority → `priority`. Supporting metrics → `supportingMetrics`. Potential savings → `potentialSavings`. Created date → `evaluatedOn`. Relevant period → `period`. **Read/dismissed status → intentionally absent** (FR-012.3).

### E.2 Priority and ordering
Sort keys, in order:
1. priority (high > medium > low)
2. rule rank: `BUD-OVER` 1, `GAP` 2, `ANOM-DISC` 3, `BUD-WARN` 4, `ANOM-INFO` 5, `GAP-INFO` 6
3. magnitude desc (overspent, gap, excess, or remaining-shortfall, in minor units)
4. `key` asc (deterministic tie-break)

### E.3 Language rules (§32, FR-017)
- Facts use observed language: "You've spent…", "Over your last 3 complete months…".
- Suggestions use conditional language: "Consider…", "could help…". Never "you should", "you will save", "guaranteed", "certain".
- Potential savings are always prefixed "Up to" and suffixed "(estimate)".
- No investment, credit or product advice (§32).
- Essential/Unclassified categories never appear in a suggested action or a potential-savings line.
- Each card shows a **"Why am I seeing this?"** affordance that reveals `explanation.condition` and the rule name (FR-012.1).
- Text is unit-tested against a banned-phrases list.
