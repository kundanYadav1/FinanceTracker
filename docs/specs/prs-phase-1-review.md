# FinanceTracker — Phase 1 PRS Review

**Reviewed document:** `docs/requirements/product-requirements.md` (Phase 1 PRS, status "Draft for approval")
**Review stage:** SPEC (no DESIGN, TASK or BUILD work performed)
**Review date:** 2026-11-06
**Status of this document:** Decisions recorded. On 2026-11-06 the product owner accepted the recommended default for every decision PD-01 – PD-20. The resulting changes (RC-01 – RC-32) were merged into PRS v1.1. The "not approved" wording below describes this review as originally written.

## Labels used in this review

| Label | Meaning |
|---|---|
| **[REQ §n]** | Existing requirement, quoted or referenced from the PRS section/FR. |
| **[GAP]** | Something the PRS needs to state but does not. |
| **[REC]** | Reviewer recommendation. Not approved. |
| **[ASSUMPTION]** | Reviewer assumption made to reason about the gap; needs confirmation. |

IDs: `C-` contradiction, `A-` ambiguity, `M-` missing requirement, `R-` domain risk, `S-` scope concern, `RC-` required change, `PD-` open product decision.

---

# A. SPEC REVIEW

## A.1 Strengths

1. **Clear product principles** — local-first, privacy-first, explainable recommendations, plain language (§4) give DESIGN an unambiguous tie-breaker.
2. **Explicit out-of-scope list** (§36) closes off the most common scope creep (backend, auth, bank import, LLMs, currency conversion).
3. **Money precision is a first-class requirement** (§33, §34, NFR-003), consistent with AGENTS.md §7.
4. **Financial safety constraints** (§32) correctly frame the product as a budgeting tool, not an advisor, and forbid guaranteed-outcome language.
5. **Recommendation explainability fields are enumerated** (FR-017): title, reason, supporting data, action, potential savings, priority.
6. **Several edge cases are already named** — zero income (FR-007), past target date / completed goal / target below current (FR-010), zero budgets (FR-008).
7. **Deferred decisions are labelled as deferred** rather than silently assumed (thresholds, saving period, goal states, timezone rules).
8. **Offline functions are enumerated** (FR-024), which makes offline acceptance testable.

## A.2 Contradictions

| ID | Conflicting requirements | Conflict |
|---|---|---|
| C-01 | [REQ FR-001] user can select/modify preferred currency · [REQ §33] system must not silently mix currencies; conversion out of scope | Changing the currency after transactions exist must either mix currencies (forbidden), convert (out of scope) or relabel history (silently wrong). No permitted behavior exists today. |
| C-02 | [REQ FR-025] settings include Notifications, App lock, Data export, Data restore · [REQ FR-021] notifications not required for MVP · [REQ FR-022/023] "eventually", restore needs its own spec · [REQ §35] app lock designed separately | Settings require features that other sections exclude from the MVP or defer. |
| C-03 | [REQ FR-002/FR-003] transaction has an "optional recurring flag" · [REQ FR-020] recurring transactions have frequency, next occurrence, active/inactive status | Two incompatible recurring models: a flag on one transaction, and a schedule that generates transactions. |
| C-04 | [REQ FR-007] "Monthly Savings = Income − Expenses" · [REQ FR-006] dashboard shows a *selected period* · [REQ FR-019] custom date range | When a custom range is selected, the "monthly" label is wrong. The formula is defined for a month, but the UI uses arbitrary periods. |
| C-05 | [REQ FR-016] discretionary candidates include "Dining" · [REQ FR-004] default categories have no Dining category; "Food" may be dining or essential | The classification rules refer to a category that does not exist. |
| C-06 | [REQ §4.2, NFR-004] data must not leave the device unless the user exports it · platform default behavior [ASSUMPTION: Android Auto Backup is enabled by default for Expo-built apps; iOS backs up app documents to iCloud by default] | Unless the spec says otherwise, the OS may copy the local database to cloud backups without the user explicitly choosing to. |
| C-07 | [REQ §32] must not assume the user can reduce essential expenses · [REQ FR-013] anomaly detection on any category (example: Food) followed by a recommendation | Anomaly rules could recommend reducing an essential category unless they exclude essential categories or limit them to informational wording. |
| C-08 | [REQ FR-009] goal has a stored "Status" field · [REQ FR-011] goal states On Track / At Risk / Behind / Completed / Expired | It is unclear whether status is set by the user (e.g. active/paused) or computed by the tracking rules. The two lists overlap ("Completed"). |

## A.3 Ambiguities

| ID | Requirement | Two (or more) reasonable implementations |
|---|---|---|
| A-01 | [REQ FR-009] "Current saved amount" | (a) User enters and maintains it by hand. (b) It is calculated from the user's net savings. (c) It is the sum of contributions the user records against the goal. |
| A-02 | [REQ FR-011] "Actual / Expected Monthly Saving" | Last month's net savings · average of the last N months · net savings so far this month · a value the user enters. |
| A-03 | [REQ FR-015] savings gap with several goals | Total required across all goals vs. capacity · each goal on its own · goals funded in priority order. |
| A-04 | [REQ FR-010] "Remaining Saving Periods" | Whole calendar months including or excluding the current month · days ÷ 30 · fractional months. Also how to round a result that doesn't divide evenly. |
| A-05 | [REQ FR-008] "Monthly total budget" + "Category budget" | One overall cap plus independent category caps, or category caps that must add up to no more than the overall cap. Does a budget repeat every month, or apply to one month only? |
| A-06 | [REQ FR-008] "Preserve historical budget information" | Editing a budget changes (a) all months, (b) the current and future months only, (c) future months only. |
| A-07 | [REQ FR-008] "Handle budget periods correctly" | Calendar month only, or custom periods too (the existing draft code stores arbitrary `period_start`/`period_end`). |
| A-08 | [REQ FR-002] "Search expenses" | Search the note only · note plus category name · the amount as well. |
| A-09 | [REQ FR-002] "Filter expenses" | By date / category / payment method / amount range — which ones are required? |
| A-10 | [REQ US-001] "I can select a payment method" vs [REQ FR-002] validation lists only amount, category and date | Is the payment method required or optional? |
| A-11 | [REQ FR-003] "Income source" | Same thing as an income category, or a separate field? |
| A-12 | [REQ FR-013] "Historical average" | Number of months · full months only, or including the current partial month · months with no spending counted as zero or skipped. |
| A-13 | [REQ FR-018] "Savings trend", "Budget performance", "Goal progress" reports | How many months are covered, how detailed, and whether charts or tables are needed. |
| A-14 | [REQ FR-001] "Basic application preferences" | Not listed. |
| A-15 | [REQ NFR-001] "Feel immediate", "large historical datasets" | No numeric targets, so this can't be tested. |
| A-16 | [REQ NFR-006] "Exact accessibility standards will be defined during DESIGN" | An accessibility standard is a product requirement, not a design detail. |
| A-17 | [REQ FR-006] "Important financial recommendations" | How many are shown, in what order, and whether they can be dismissed. |
| A-18 | [REQ FR-012] "when meaningful opportunities or risks are detected" | "Meaningful" is not defined. |

## A.4 Missing requirements

### Money precision
- **M-01 [GAP]** Amount sign rules: a transaction amount must be strictly positive, with the type (income/expense) giving the direction. Refunds, reversals and transfers between own accounts are neither covered nor listed as out of scope.
- **M-02 [GAP]** Minimum and maximum amount per transaction and per goal/budget. There is no limit protecting against values that JavaScript can't represent exactly.
- **M-03 [GAP]** Allowed decimal places on input (tied to the currency's minor unit), and what happens with too many decimals (reject, don't round).
- **M-04 [GAP]** Rounding rule for derived values: percentages, required monthly saving, potential savings.
- **M-05 [GAP]** Display formatting: currency symbol, digit grouping (Indian lakh/crore vs Western), how negative values are shown, how many decimals percentages show.

### Currency handling
- **M-06 [GAP]** The list of supported currencies and each one's number of decimal places.
- **M-07 [GAP]** Behavior when the primary currency changes and records already exist (see C-01).
- **M-08 [GAP]** Whether a single record (transaction, budget, goal) may use a currency other than the primary one in the MVP.

### Date/time behavior
- **M-09 [GAP]** A transaction date is a local calendar date (no time of day), and changing the device's time zone must not move it.
- **M-10 [GAP]** Whether future-dated transactions are allowed, and whether they count in current-period totals.
- **M-11 [GAP]** Period boundaries: a month runs from the 1st to its last day inclusive; custom ranges include both ends.
- **M-12 [GAP]** How the current, incomplete month is compared with past complete months (affects FR-013, FR-011, FR-015).
- **M-13 [GAP]** The earliest allowed transaction date (and the latest, if future dates are allowed).

### Budget periods
- **M-14 [GAP]** The budget period model (see A-05 to A-07). Whether unspent budget rolls over (recommended: explicitly no for the MVP).
- **M-15 [GAP]** Status thresholds are deferred to DESIGN, but the spec doesn't say what happens at exactly 100% or when the budget is zero.
- **M-16 [GAP]** Whether more than one budget may exist for the same category in the same month.

### Savings goal calculations and goal status rules
- **M-17 [GAP]** Where the goal's saved amount comes from, and whether it can go down (withdrawals).
- **M-18 [GAP]** The allowed priority values, and what priority affects.
- **M-19 [GAP]** Which statuses a user can set (active / paused / archived) vs which are calculated (see C-08), and their order of precedence.
- **M-20 [GAP]** How the projected completion date is calculated, and what happens when expected monthly saving is zero or negative.
- **M-21 [GAP]** What happens when a goal reaches its target (does it stop being tracked? is it excluded from gap calculations?).
- **M-22 [GAP]** Whether a goal's target date and target amount can be edited, and how that affects its status history.

### Recurring transactions
- **M-23 [GAP]** Whether recurring items are created automatically, created after the user confirms, or are reminders only.
- **M-24 [GAP]** Catch-up behavior when the app hasn't been opened for several periods (create all missed occurrences? at most N?), and protection against duplicates.
- **M-25 [GAP]** Allowed frequencies; handling of the 29th–31st in short months and of 29 February.
- **M-26 [GAP]** Whether editing or deleting a recurring rule affects occurrences already created.

### Expense classification
- **M-27 [GAP]** Whether each default category is essential or discretionary, whether there's a "mixed/unknown" class, and whether the user can override it.

### Recommendation rules
- **M-28 [GAP]** The minimum history needed before history-based recommendations appear, and what is shown when there isn't enough.
- **M-29 [GAP]** Recommendation lifecycle: when they're recalculated, whether they're stored, and whether they can be dismissed or snoozed.
- **M-30 [GAP]** How potential savings are calculated, and the rule that it is always shown as an estimate ("up to"), never a promise.
- **M-31 [GAP]** How many recommendations are shown at most, how they're ordered, and how duplicates are removed.

### Offline behavior
- **M-32 [GAP]** The only internet-dependent features (none in the MVP) should be listed explicitly, and the app must not show network error states for core functions.

### Data deletion
- **M-33 [GAP]** Confirmation before deleting a transaction, budget or goal; whether undo is available.
- **M-34 [GAP]** "Delete all my data" / reset app (an important privacy capability for local-only data).
- **M-35 [GAP]** What happens to records that reference a deleted item (relevant once custom categories exist).

### Data integrity
- **M-36 [GAP]** Saves are all-or-nothing (a failed save leaves no partial record); a double-tap must not create duplicates.
- **M-37 [GAP]** App upgrades must never lose or change stored financial data (AGENTS.md §11 states this for engineering, but the PRS does not state it as a product requirement).
- **M-38 [GAP]** Data loss on uninstall or device loss: with local-only storage and export deferred, all data is lost permanently. The user must be told this, or export must be in the MVP.

### Empty states
- **M-39 [GAP]** What the dashboard, reports, budgets, goals and recommendations show when there is no data, no income, or not enough history.

### Error states
- **M-40 [GAP]** What happens when the database can't be opened or upgraded, the device storage is full, or a save fails. The user must be told the data was **not** saved.

### Validation
- **M-41 [GAP]** Field rules: amount (positive, maximum, decimals), date (range), note (maximum length), goal name (required, maximum length), target amount (> 0), target date (in the future when created), budget amount (≥ 0 or > 0).

### Privacy
- **M-42 [GAP]** Whether OS cloud backups include the data (see C-06).
- **M-43 [GAP]** Notification content (amounts on the lock screen), and hiding screen content in the app switcher.
- **M-44 [GAP]** Exported files are unencrypted plaintext; the user must be warned.

### Backup/restore
- **M-45 [GAP]** A format version in export files; restore must reject unknown or newer versions. Merge vs replace (currently only "warn before overwriting").

### Notifications
- **M-46 [GAP]** When permission is requested, the default on/off state, and whether amounts appear in notification text.

### Large transaction histories
- **M-47 [GAP]** The supported data size (e.g. number of transactions and years) and measurable performance targets.

### Other
- **M-48 [GAP]** Language and localization (English only for the MVP?).
- **M-49 [GAP]** First-run experience: is a profile or currency required before first use?
- **M-50 [GAP]** The accessibility standard to meet (see A-16).

## A.5 Domain risks

| ID | Risk | Where | Consequence if unspecified |
|---|---|---|---|
| R-01 | **Partial month compared with full-month averages** | FR-013, FR-011, FR-015 | Early in the month, every category looks "below normal" and savings look high. Rent paid on the 1st makes it look like an anomaly. Recommendations become misleading. |
| R-02 | Division by zero | FR-007 (income 0), FR-008 (budget 0), FR-009 (target 0), FR-010 (0 periods), FR-013 (average 0) | Crash, `Infinity`/`NaN` on screen, or false 100%/0%. |
| R-03 | Negative savings | FR-007, FR-011, FR-015 | Negative savings rate shown confusingly. Projected completion date is never reached or is negative. |
| R-04 | Target date in the past / in the current month | FR-010 | A required monthly saving of the full remaining amount — or a divide-by-zero — shown as a real target. |
| R-05 | Goal already met or exceeded | FR-010 | Negative "required saving" or a negative remaining amount shown. |
| R-06 | Month length and leap years | FR-010, FR-019, FR-020 | "1 month from 31 Jan" may resolve to 28 Feb, 29 Feb, 2 Mar or 3 Mar depending on the library; day-based period counts drift. |
| R-07 | Time zone change after entry | FR-019 | A transaction entered at 23:30 can move to another day or month, changing monthly totals after the fact. |
| R-08 | Rounding of required monthly saving | FR-010 | Rounding down means the user saves exactly as told and still misses the goal by a few paise. |
| R-09 | Very large amounts | §34 | Totals beyond 2^53 − 1 minor units lose precision silently in JavaScript; percentage maths (× 100) gets there 100× sooner. |
| R-10 | Too little history | FR-013, FR-015 | A "historical average" based on a single month is presented as normal behavior. |
| R-11 | Irregular/annual expenses (insurance, travel, school fees) | FR-013, FR-016 | Flagged as anomalies, followed by a "reduce" recommendation for a one-off essential payment. |
| R-12 | Negative or zero amounts entered | FR-002, FR-003 | Totals reversed or expense recorded as income; zero-value records inflate counts. |
| R-13 | Goal saved amount double-counted with monthly net savings | FR-009, FR-011 | Progress overstated if net savings and manually entered goal money are both counted. |
| R-14 | Several goals competing for the same savings | FR-015 | Each goal looks "On Track" individually while together they can't be funded. |
| R-15 | Recurring catch-up and clock changes | FR-020 | Duplicate salary or rent entries; inflated income or expenses. |
| R-16 | Currency changed after data exists | FR-001 | Every historical amount shown in the wrong currency (see C-01). |
| R-17 | Potential savings exceeding category spend, or ranges presented as certain | FR-017, §32 | Promises the user can't keep; breaks §32. |
| R-18 | Zero budget | FR-008 | Utilization undefined; any spending shown as "∞%". |

## A.6 Scope concerns

| ID | Item | Current PRS stance | Recommendation [REC] | Rationale |
|---|---|---|---|---|
| S-01 | FR-020 Recurring transactions (automatic generation) | Listed as "shall support" | **MVP+** (keep the recurring flag as information only in the MVP) | Catch-up, duplicate prevention and scheduling rules are the riskiest part of the data model; the core value doesn't depend on them. |
| S-02 | FR-021 Notifications | "Not required for the initial functional MVP" | **MVP+** | Already effectively deferred; say so explicitly. |
| S-03 | FR-022 Data export | "Eventually" | **MVP (JSON only)**, CSV MVP+ — *pending PD-12* | Local-only storage with no export means uninstalling or losing the device destroys all data (M-38). |
| S-04 | FR-023 Data restore | Requires its own spec | **Deferred** (own spec) | High data-corruption risk; needs format versioning first. |
| S-05 | FR-025 App lock | "Designed separately" | **MVP+** | Security feature; needs its own threat model. |
| S-06 | FR-025 Settings | Lists deferred features | **MVP limited to:** currency (subject to PD-02), theme, delete all data, about, privacy information | Resolves C-02. |
| S-07 | FR-004 Custom categories | "MVP+ unless required by UX" | **MVP+** — confirm | "Unless required by UX" leaves scope open-ended. |
| S-08 | FR-018 Reports | Seven report types | **MVP:** monthly income/expense/savings summary and category spending for a period. **MVP+:** savings trend, budget performance history, goal progress history | Trends need history and add charting scope. |
| S-09 | FR-013 Spending anomaly | MVP recommendation | **MVP**, only with minimum-history and complete-month rules (PD-09, PD-10) | Without those rules it gives misleading output (R-01, R-10). |
| S-10 | FR-016 Expense reduction suggestions | MVP | **MVP**, discretionary categories only | Needs PD-08. |
| S-11 | FR-008 Monthly total budget | MVP | **MVP** — keep | Needed by FR-006 budget status. |
| S-12 | FR-019 Custom date range | MVP | **MVP** for viewing; recommendations and goals evaluate calendar months only | Avoids C-04 spreading into the calculations. |

## A.7 Acceptance-criteria testability review

Legend: **T** = objectively testable · **P** = partially testable · **N** = not testable as written.

| Item | Verdict | Problems |
|---|---|---|
| FR-001 Profile | P | "Supported currency" undefined (M-06); "basic preferences" undefined (A-14); currency change not specified (C-01). |
| FR-002 Expense | P | "Amount is valid" undefined (M-41); search/filter fields undefined (A-08, A-09); "relevant recommendations **can** update" is not testable ("can" → "shall"). |
| FR-003 Income | P | No validation rules; "filter income" fields undefined; "include in calculations" — which ones? |
| FR-004 Categories | T (defaults) | Testable for the default list; the essential/discretionary class is missing (M-27). |
| FR-005 Payment methods | P | Required or optional (A-10)? No acceptance criteria section. |
| FR-006 Dashboard | P | "Relevant" totals/budgets is vague; "goal projections **can** update"; the number of recommendations shown is undefined (A-17); empty states missing. |
| FR-007 Savings calc | P | "Special handling" when income is zero isn't defined — what is shown? Negative savings display undefined. |
| FR-008 Budgets | N | Thresholds, period model, "correctly", "preserve historical" all undefined. |
| FR-009 Goals | N | Saved-amount source, priority values, status set, projection method undefined. |
| FR-010 Required saving | N | Period definition and rounding undefined; edge-case outputs listed but expected results not given. |
| FR-011 Goal tracking | N | Comparison basis and state rules undefined. |
| FR-012 Engine | N | "Meaningful" undefined; no acceptance criteria. |
| FR-013 Anomaly | N | Threshold, history window, minimum data, current-month handling undefined. |
| FR-014 Budget warning | P | Depends on FR-008 thresholds. |
| FR-015 Savings gap | N | "Current expected monthly saving" undefined; multiple goals undefined. |
| FR-016 Reduction | N | Classification undefined; "Dining" missing (C-05). |
| FR-017 Explainability | P | Fields are testable; "potential savings where calculable" and the ranges need a defined method. |
| FR-018 Reports | N | Content, period length and format undefined. |
| FR-019 Date filtering | P | Current/previous month testable once boundaries are defined (M-11). |
| FR-020 Recurring | N | Generation rules deferred; contradiction C-03. |
| FR-021 Notifications | N | Deferred; fine if marked MVP+. |
| FR-022 / FR-023 Export/Restore | N | Deferred; needs its own spec. |
| FR-024 Offline | T | Testable (airplane-mode test of the listed functions). |
| FR-025 Settings | N | Contradiction C-02. |
| NFR-001 Performance | N | No numbers. |
| NFR-002 Reliability | T | Restart/background/reboot persistence tests are well defined. |
| NFR-003 Data integrity | P | Deterministic is testable; "avoid floating-point errors" needs explicit cases (e.g. 0.1 + 0.2 entered as amounts sums to exactly 0.30). |
| NFR-005 Cross-platform | P | Testable only once an iOS verification method is agreed. |
| NFR-006 Accessibility | N | No standard named. |
| US-001 Record expense | T | Good; add "invalid amount is rejected with a message". |
| US-002 Record income | T | Good. |
| US-003 Savings goal | P | "Calculates required monthly savings" depends on FR-010 definitions. |
| US-004 Understand spending | P | "Category spending can be compared" — compared with what (other categories, previous period)? |
| US-005 Recommendation | P | "Where possible" undefined; depends on FR-013/015/016. |
| US-006 Track budget | P | "Status updates automatically" — when? (immediately after saving). |
| US-007 Offline | T | Good. |

---

# B. REQUIRED CHANGES

Ordered by severity, then by dependency.

| ID | Requirement | Problem | Severity | Recommended Resolution |
|----|-------------|---------|----------|-------------------------|
| RC-01 | §5 MVP Scope | MVP vs MVP+ vs deferred isn't stated per FR; contradictions C-02 and S-01 to S-12 follow from this. | Critical | Add an MVP scope table listing each FR's status (PD-01). |
| RC-02 | FR-001, §33, §34 | No list of supported currencies or their decimal places; changing currency after data exists has no permitted behavior (C-01, R-16). | Critical | Single primary currency per installation; supported-currency list with decimal places; currency change blocked once financial records exist (PD-02, PD-03). |
| RC-03 | FR-019 + new date section | Transaction date semantics, period boundaries and partial-month comparisons undefined (M-09 to M-12, R-01, R-07). | Critical | Add a "Date and period rules" section. |
| RC-04 | FR-008 | Budget period model, history on edit, overall vs category relationship undefined (A-05 to A-07, M-14 to M-16). | Critical | Calendar-month budgets, carried forward until changed, history preserved per month (PD-05). |
| RC-05 | FR-009, FR-011, FR-015 | Goal saved-amount source, expected monthly saving, multiple goals undefined (A-01 to A-03, R-13, R-14). | Critical | Define the saved-amount source, expected monthly saving and multi-goal gap rule (PD-06, PD-07). |
| RC-06 | FR-002/003 vs FR-020 | Two recurring models (C-03); generation rules missing (M-23 to M-26). | Critical | MVP: recurring flag is information only. Recurring schedules move to MVP+ with their own spec (PD-04). |
| RC-07 | FR-010 | Saving period and rounding undefined; edge-case outputs unspecified (A-04, R-04, R-05, R-08). | High | Define calendar-month periods, round up, and list explicit outputs per edge case. |
| RC-08 | FR-009 / FR-011 | Stored status vs calculated tracking state (C-08); state basis undefined (M-19, M-21). | High | Separate user lifecycle status from calculated tracking state; define precedence. |
| RC-09 | FR-016, FR-004, §32 | No essential/discretionary classification; "Dining" missing (C-05, C-07, M-27). | High | Assign a class to each default category; only discretionary categories receive reduction suggestions (PD-08). |
| RC-10 | FR-012, FR-013 | No minimum history, no complete-month rule, "meaningful" undefined (A-12, A-18, M-28, R-01, R-10, R-11). | High | Require N complete months; evaluate anomalies on complete months; suppress with an explanation when history is too short (PD-09, PD-10). |
| RC-11 | FR-012, FR-017 | Recommendation lifecycle, potential-savings method, display limit undefined (M-29 to M-31, R-17). | High | Calculated on demand from current data; potential savings capped by the excess spending and labelled as estimates. |
| RC-12 | FR-002, FR-003, §34 | Amount sign, min/max, decimals, field validation undefined (M-01 to M-03, M-41, R-09, R-12). | High | Add a validation section with explicit limits. |
| RC-13 | FR-007 | Zero income / negative savings output undefined (R-02, R-03). | High | Specify the displayed results. |
| RC-14 | §4.2, NFR-004 | OS cloud backup may copy financial data off the device (C-06, M-42). | High | Require app data to be excluded from OS backup by default (PD-11). |
| RC-15 | New: data loss | No export in the MVP + local only = total data loss on uninstall (M-38, S-03). | High | Either JSON export in the MVP or an explicit in-app disclosure (PD-12). |
| RC-16 | New: data deletion & integrity | No delete confirmation, no "delete all data", no all-or-nothing save rule (M-33, M-34, M-36, M-37). | High | Add data-lifecycle requirements. |
| RC-17 | New: error states | Save/open/upgrade failure behavior undefined (M-40). | High | Users must be told explicitly when data was not saved; no false "saved". |
| RC-18 | FR-025 | Lists deferred features (C-02). | High | Limit MVP settings (S-06). Resolved by RC-01. |
| RC-19 | Many FRs | Acceptance criteria use "can update", "relevant", "correctly" (A.7). | High | Replace "can" with "shall"; tie criteria to defined rules. |
| RC-20 | FR-002 | Search and filter fields undefined (A-08, A-09). | Medium | Specify the fields. |
| RC-21 | FR-005 / US-001 | Payment method required or optional (A-10). | Medium | Required for expenses, with "Cash" or the last-used method preselected; not used for income [REC]. |
| RC-22 | FR-003 | Income source vs category (A-11). | Medium | State that income source is the income category. |
| RC-23 | FR-006, FR-018 | Empty states undefined (M-39). | Medium | Add empty-state requirements. |
| RC-24 | FR-018 | Report contents undefined; scope too wide (A-13, S-08). | Medium | Define the MVP reports. |
| RC-25 | NFR-001 | No measurable targets; no supported data size (A-15, M-47). | Medium | Add numeric targets (PD-13). |
| RC-26 | NFR-006 | No accessibility standard (A-16). | Medium | Name a target (PD-14). |
| RC-27 | FR-021 | Notification privacy and permission timing (M-43, M-46). | Medium | Add when notifications are specified (MVP+). |
| RC-28 | FR-022/023 | Format versioning, plaintext warning (M-44, M-45). | Medium | Add to the export/restore spec. |
| RC-29 | M-05, M-48 | Number formatting and language undefined. | Medium | English only; currency-appropriate grouping (PD-15). |
| RC-30 | FR-001 | "Basic application preferences" undefined (A-14). | Low | List them, or remove the phrase. |
| RC-31 | M-49 | First-run flow undefined. | Low | State whether currency must be selected before first use. |
| RC-32 | Document control | No approval record or version history. | Low | Add a change log and approver/date fields. |

---

# C. PROPOSED REQUIREMENT CHANGES

Exact wording proposed for insertion into the PRS for every Critical and High item. **None of this is approved.** Where the wording depends on an open decision, it uses the recommended default and names the decision (`→ PD-xx`); if the decision goes another way, the wording must change.

### RC-01 — MVP scope (replace/extend §5)

> **5.1 MVP Feature Status**
>
> | Status | Requirements |
> |---|---|
> | MVP | FR-001, FR-002, FR-003, FR-004 (default categories only), FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018 (MVP reports per §23), FR-019, FR-024, FR-025 (MVP settings per §30), FR-022 (JSON export only) → PD-12 |
> | MVP+ | FR-004 custom categories, FR-018 trend/history reports, FR-020 recurring schedules, FR-021 notifications, FR-022 CSV export, FR-025 app lock |
> | Deferred (requires own specification) | FR-023 data restore, database encryption |
>
> A requirement not listed as MVP shall not be implemented in the MVP.

### RC-02 — Currency (append to FR-001 and §33)

> **FR-001.1** The application shall use exactly one primary currency per installation. The user shall select it from the supported-currency list before recording any financial data.
>
> **FR-001.2** Supported currencies for the MVP are: INR (2 decimal places). → PD-02
>
> **FR-001.3** Every stored monetary value shall record its currency. In the MVP every stored monetary value shall be in the primary currency.
>
> **FR-001.4** The primary currency may be changed only while no transactions, budgets or savings goals exist. If any exist, the application shall prevent the change and explain that changing currency would misrepresent existing records and that currency conversion is not supported. → PD-03
>
> **§34.1** Monetary amounts shall be stored and calculated as whole numbers of the currency's smallest unit (e.g. paise for INR). An input with more decimal places than the currency allows shall be rejected, not rounded.

### RC-03 — Date and period rules (new section after FR-019)

> **FR-019.1 Transaction date.** A transaction date is a calendar date (year, month, day) with no time of day or time zone. Once saved, it shall not change because of a device time zone or clock change.
>
> **FR-019.2 Today.** "Today" is the current calendar date in the device's time zone at the moment of evaluation.
>
> **FR-019.3 Month period.** A month period runs from the first to the last calendar day of the month, both inclusive, including 29 February in leap years.
>
> **FR-019.4 Custom range.** A custom range includes its start and end dates. The start date shall not be after the end date.
>
> **FR-019.5 Future dates.** A transaction date shall not be later than today. → PD-16
>
> **FR-019.6 Complete and incomplete months.** A month is *complete* when today is after its last day. The current month is *incomplete*. Calculations that compare against historical behavior (FR-011, FR-013, FR-015) shall use complete months as their history, and shall not present an incomplete month's total as if it were a full month's.

### RC-04 — Budget periods (append to FR-008)

> **FR-008.1** Budgets apply to calendar months (FR-019.3). Custom budget periods are out of scope for the MVP.
>
> **FR-008.2** A user may define at most one overall monthly budget and at most one budget per expense category for any month. Category budgets are independent of the overall budget; their sum may exceed it. → PD-05
>
> **FR-008.3** A budget stays in effect for later months until the user changes or removes it. Changing or removing a budget shall affect the current month and later months only. The budget amount in effect for every past month shall be kept and used when that month is reported.
>
> **FR-008.4** Spending against a budget is the sum of expense transactions dated within that month (and, for a category budget, in that category).
>
> **FR-008.5** Unspent budget does not carry over to the next month.
>
> **FR-008.6** For a zero budget, utilization percentage is not shown; status is Healthy when spending is zero and Exceeded when spending is greater than zero.
>
> **FR-008.7** Status is Exceeded when spending is greater than the budget amount. Spending exactly equal to the budget is not Exceeded. The Warning threshold is defined in DESIGN as a single configurable percentage below 100%.

### RC-05 — Goal saved amount, expected monthly saving, multiple goals (append to FR-009, FR-011, FR-015)

> **FR-009.1** A goal's current saved amount is entered and updated by the user. It is not calculated from transactions. It can go up or down. It shall not be negative. → PD-06
>
> **FR-011.1** *Expected monthly saving* is the average of monthly savings (FR-007) over the most recent complete months, up to 3, in which at least one transaction exists. If no complete month exists, expected monthly saving is *unavailable*, and goal tracking states that depend on it shall not be shown. → PD-07
>
> **FR-015.1** The savings gap is calculated across all active, not-completed goals: *total required monthly saving* (sum of each goal's FR-010 result) minus *expected monthly saving*. A gap exists only when that difference is greater than zero. The application shall not present any single goal as fully funded while the total is unfunded.

### RC-06 — Recurring transactions (amend FR-002, FR-003, FR-020)

> **FR-002.1 / FR-003.1** The recurring flag on a transaction is information only. In the MVP it shall not create, schedule or change any other transaction.
>
> **FR-020 (status: MVP+)** Recurring schedules that create transactions require their own specification. That specification shall define generation (automatic vs user-confirmed), catch-up after the app hasn't been opened for some time, prevention of duplicate occurrences, handling of days 29–31 and 29 February, and the effect of editing or deleting a schedule on occurrences already created. → PD-04

### RC-07 — Required monthly saving (append to FR-010)

> **FR-010.1** *Remaining saving periods* = the number of calendar months from the current month through the month containing the target date, inclusive of both. → PD-17
>
> **FR-010.2** Required monthly saving = remaining amount ÷ remaining saving periods, rounded **up** to the currency's smallest unit.
>
> **FR-010.3** Edge-case results:
>
> | Condition | Remaining amount | Required monthly saving | Tracking state |
> |---|---|---|---|
> | Current ≥ target | 0 | 0 | Completed |
> | Target date before today and current < target | target − current | not calculated | Expired |
> | Target date in the current month | target − current | target − current | per FR-011 |
> | Target amount ≤ 0 | — | invalid; goal cannot be saved | — |
>
> Remaining amount shall never be shown as negative.

### RC-08 — Goal status vs tracking state (amend FR-009 / FR-011)

> **FR-009.2** A goal has a *lifecycle status* set by the user: Active, Paused, or Archived. Only Active goals take part in tracking and in savings-gap calculations.
>
> **FR-011.2** A goal has a *tracking state* calculated by the application and never stored as user input: Completed, Expired, On Track, At Risk, or Behind.
>
> **FR-011.3** States are evaluated in this order of precedence: Completed (current ≥ target) → Expired (target date before today) → On Track / At Risk / Behind. The rules for the last three are defined in DESIGN, must be deterministic, and must be explainable to the user using the values involved.

### RC-09 — Expense classification (append to FR-004, FR-016)

> **FR-004.1** Each default expense category has a fixed spending class:
> - *Essential:* Groceries, Transport, Rent, Bills, Health, Education, EMI
> - *Discretionary:* Food (eating out), Shopping, Entertainment, Travel, Subscriptions
> - *Unclassified:* Other
>
> → PD-08
>
> **FR-016.1** Reduction suggestions (FR-016) shall be generated only for Discretionary categories. Essential and Unclassified categories may appear in informational insights but shall never be the subject of a suggestion to reduce spending.

### RC-10 — Minimum history and anomaly evaluation (append to FR-012, FR-013)

> **FR-012.1** A recommendation is generated only when a named rule's conditions are met. Each rule's conditions and thresholds shall be documented in DESIGN, and the rule shall be identifiable in the recommendation's explanation.
>
> **FR-013.1** The historical average for a category is the mean of its spending over the 3 most recent complete months before the evaluated month. A month with no spending in the category counts as zero. → PD-09
>
> **FR-013.2** Anomaly recommendations require at least 3 complete months of transaction history. With less history, no anomaly recommendation is generated, and the application shall show that more history is needed. → PD-09
>
> **FR-013.3** For the current incomplete month, an anomaly may be reported only when month-to-date spending in the category already exceeds the category's historical full-month average. The application shall not project or extrapolate incomplete-month spending. → PD-10
>
> **FR-013.4** No anomaly is reported for a category whose historical average is zero; the application shall not show an infinite or undefined percentage increase.

### RC-11 — Recommendation lifecycle and potential savings (append to FR-012, FR-017)

> **FR-012.2** Recommendations are calculated from the current local data each time they are displayed. They shall reflect any transaction, budget or goal change immediately.
>
> **FR-012.3** The dashboard shall show at most 3 recommendations, ordered by priority. Dismissing or snoozing recommendations is out of scope for the MVP. → PD-18
>
> **FR-017.1** Potential savings, where shown, shall not exceed the category's spending above its historical average for the evaluated month. It shall be labelled as an estimate (e.g. "up to ₹X"), shall never be described as guaranteed, and shall be omitted when it cannot be calculated from stored data.

### RC-12 — Validation (new section after FR-003)

> **FR-003A Input validation**
> 1. A transaction amount shall be greater than zero. Whether money comes in or goes out is determined only by the transaction type.
> 2. The maximum amount for a single transaction, budget, goal target or goal saved amount is 9,999,999,999 smallest units (₹99,999,999.99). → PD-19
> 3. Amounts shall be rejected if they have more decimal places than the currency allows, contain non-numeric characters other than one decimal separator, or are empty.
> 4. A transaction date is required and must satisfy FR-019.5.
> 5. A category is required. Payment method is required for expenses (→ RC-21).
> 6. A note is optional, with a maximum of 200 characters.
> 7. A goal name is required, 1–60 characters. A goal target amount shall be greater than zero. A goal target date shall be today or later when the goal is created.
> 8. A budget amount shall be zero or greater.
> 9. Every rejected input shall show a message that names the field and the rule that was broken.
>
> Refunds, reversals and transfers between the user's own accounts are out of scope for the MVP. → PD-20

### RC-13 — Zero income and negative savings (append to FR-007)

> **FR-007.1** Monthly savings may be negative and shall be shown with a clear negative indicator. It shall not be shown as zero.
>
> **FR-007.2** When total income for the period is zero, savings rate shall be shown as "not available" with an explanation (e.g. "No income recorded for this period"). It shall not be shown as 0%, −100%, infinity or an error.
>
> **FR-007.3** When savings are negative and income is greater than zero, savings rate shall be shown as a negative percentage.
>
> **FR-007.4** Percentages shown to the user are rounded to one decimal place, with halves rounded away from zero. Rounding applies only to display; stored and intermediate values shall not be rounded.

### RC-14 — OS backup (append to §35 / NFR-004)

> **NFR-004.1** The application shall exclude its financial database from automatic operating-system cloud backups (e.g. Android Auto Backup, iCloud backup) by default, so that financial data does not leave the device without an explicit user action. → PD-11
>
> **NFR-004.2** The application's privacy information shall state where data is stored, that it is not backed up automatically, and that uninstalling the application deletes it.

### RC-15 — Data loss disclosure / export (amend FR-022)

> **FR-022.1 (MVP)** The user shall be able to export all transactions, budgets, savings goals and profile settings to a single JSON file containing a format version identifier. The export shall work offline. → PD-12
>
> **FR-022.2** Before exporting, the application shall warn that the exported file is not encrypted and contains the user's financial information.

### RC-16 — Data deletion and integrity (new section)

> **FR-026 Data lifecycle**
> 1. Deleting a transaction, budget or savings goal shall require confirmation that names the item being deleted.
> 2. The user shall be able to delete all application data from Settings, after a confirmation that states the deletion is permanent and cannot be undone. Afterwards the application shall contain no transactions, budgets, goals or profile data.
> 3. A save shall be all-or-nothing: either the whole record is stored, or nothing is stored and the user is told.
> 4. A single save action (including a repeated tap) shall create at most one record.
> 5. Application updates shall preserve all existing financial records and their values.

### RC-17 — Error states (new section)

> **FR-027 Error handling**
> 1. If a save fails, the application shall tell the user that the data was **not** saved and shall keep their entered values so they can retry.
> 2. If the local database cannot be opened or upgraded, the application shall show an error screen explaining that financial data is unavailable. It shall not show empty totals that could be mistaken for zero values, and it shall not delete or recreate the database automatically.
> 3. Error messages shown to users and written to logs shall not contain transaction amounts, notes or other financial details.

### RC-18 — Settings (amend FR-025)

> **FR-025.1 (MVP)** Settings shall contain: primary currency (subject to FR-001.4), theme (system / light / dark), data export (FR-022.1), delete all data (FR-026.2), about, and privacy information (NFR-004.2). Notifications and app lock are MVP+.

### RC-19 — Acceptance-criteria wording (applies to FR-002, FR-006, US-004, US-006)

> Replace "Relevant recommendations can update" and "Relevant goal projections can update" with: "Recommendations and goal tracking states shown after the change shall reflect the changed data the next time they are displayed, without restarting the application."
>
> Replace "Relevant totals update" with: "Every total, budget status and savings figure whose period includes the transaction's date shall reflect the change."
>
> US-004: replace "Category spending can be compared" with: "Category totals for the selected period are listed in descending order of amount, and their sum equals total expenses for the period."
>
> US-006: replace "Budget status updates automatically" with: "Budget status reflects a saved transaction as soon as the user returns to any screen showing that budget."

---

# D. OPEN PRODUCT DECISIONS

These need product approval before DESIGN. The recommended defaults are reviewer recommendations [REC], not approved requirements.

| ID | Question | Why it matters | Recommended default | Alternatives |
|---|---|---|---|---|
| PD-01 | What is the definitive MVP / MVP+ / deferred status of each FR? | Sets the size of DESIGN; resolves C-02. | Table in RC-01. | Keep recurring and notifications in the MVP; add CSV export to the MVP. |
| PD-02 | Which currencies are supported in the MVP? | Decides how many decimal places amounts may have, and how they are formatted. | INR only. | A fixed list of 2-decimal currencies (INR, USD, EUR, GBP…); also allow 0- and 3-decimal currencies (JPY, KWD) — more complex. |
| PD-03 | What happens when the user changes currency after records exist? | Avoids mixing currencies or silently relabelling them (C-01). | Not allowed while records exist. | Allow it, with existing records keeping their original currency and shown separately (multi-currency display); allow it after "delete all data". |
| PD-04 | Are recurring schedules in the MVP? | The riskiest data-integrity feature (R-15). | MVP+; the flag is information only. | MVP with user-confirmed occurrences only; MVP with automatic generation. |
| PD-05 | How do overall and category budgets relate? | Data model and status logic. | Independent; the sum of category budgets may exceed the overall budget. | Category budgets must add up to no more than the overall budget; warn but allow. |
| PD-06 | Where does a goal's saved amount come from? | Goal progress accuracy; double-counting (R-13). | Entered and maintained by the user. | A contribution history the user records; derived automatically from net savings (shared among goals). |
| PD-07 | How is "expected monthly saving" defined? | Drives goal tracking and the savings gap. | Average monthly savings of the last up-to-3 complete months that have data. | Last complete month only; a value the user enters; 6 months. |
| PD-08 | How is each category classified (essential / discretionary)? Can the user change it? | Safety rule §32; reduction suggestions. | Fixed table in RC-09; Food = eating out (discretionary); user override MVP+. | Split Food into "Dining" and keep "Food" essential; user override in the MVP; three classes including "mixed". |
| PD-09 | How much history is required for history-based recommendations? | Prevents misleading averages (R-10). | 3 complete months; average over the last 3 months. | 2 months; 6 months; require transactions in the specific category. |
| PD-10 | How is the current incomplete month evaluated? | Prevents misleading partial-month comparisons (R-01). | Only report when month-to-date already exceeds the full-month average; no projection. | Projection to month-end; compare the same day-of-month in previous months; evaluate complete months only. |
| PD-11 | Should financial data be excluded from OS cloud backups? | Privacy promise vs device-migration convenience (C-06). | Excluded by default. | Included (state this in privacy information); user setting. |
| PD-12 | Is data export in the MVP? | Without it, uninstalling or losing the device loses all data (M-38). | JSON export in the MVP; CSV MVP+; restore deferred. | Export MVP+ with an in-app disclosure only; JSON + CSV in the MVP. |
| PD-13 | What are the supported data size and performance targets? | Makes NFR-001 testable. | Supports 50,000 transactions; adding a transaction is reflected on screen within 300 ms and the dashboard loads within 1 s on a mid-range Android device. | Smaller target (10,000); no numbers (not recommended). |
| PD-14 | Which accessibility standard applies? | Makes NFR-006 testable. | WCAG 2.2 AA principles as applicable to mobile; minimum 48×48 dp touch targets; every interactive element labelled for screen readers. | WCAG 2.1 AA; best effort (not testable). |
| PD-15 | Which language and number format? | Display of amounts. | English only; INR shown with Indian digit grouping (₹1,00,000.00). | Western grouping; follow device locale. |
| PD-16 | Are future-dated transactions allowed? | Totals and anomaly correctness. | Not allowed in the MVP. | Allowed but excluded from totals until their date; allowed and counted. |
| PD-17 | Does the current month count as a saving period? | Required monthly saving result. | Yes, the current month is included. | Exclude the current month; use fractional months. |
| PD-18 | Recommendation display limit and dismissal? | Dashboard UX; lifecycle complexity. | Max 3 on the dashboard; full list on the Recommendations screen; no dismissal in the MVP. | Dismiss for the current month; no limit. |
| PD-19 | What is the maximum monetary value per record? | Precision safety (R-09). | 9,999,999,999 smallest units (₹99,999,999.99). | A lower personal-finance cap (₹10,00,00,000); a higher cap with overflow-checked arithmetic. |
| PD-20 | Are refunds, reversals and transfers out of scope? | Sign rules and totals (M-01). | Out of scope for the MVP; listed in §36. | Refund recorded as negative expense; separate transfer type. |

---

# E. SPEC READINESS

## Classification: **NOT READY FOR DESIGN**

### Reasons

1. Six **Critical** issues (RC-01 to RC-06) affect the data model and the core financial calculations: MVP boundary, currency rules, date/period rules, budget periods, the goal saved-amount and savings-gap definitions, and the recurring model. DESIGN can't produce a stable database schema or calculation design without them.
2. Thirteen FR/NFR items are **not objectively testable** as written (section A.7).
3. Two contradictions (C-06 OS backup, C-07 essential-expense recommendations) could break the product's own privacy and financial-safety principles if left to DESIGN.

### Path to "READY FOR DESIGN"

1. Product owner decides PD-01 to PD-20 (accept the defaults or choose alternatives).
2. Proposed wording in section C is updated to match those decisions and merged into the PRS, with a change-log entry (RC-32).
3. A quick re-review confirms there are no remaining Critical or High items.

Once the decisions are made, the expected classification is **READY WITH MINOR CHANGES**: the Medium/Low items (RC-20 to RC-32) can be resolved in the first DESIGN iteration without changing the data model.

### Note on existing implementation

The repository already contains draft implementation (SQLite schema v2, Zustand store, screens) created before this review. Under AGENTS.md §3, the approved spec outranks existing code, so this review hasn't treated the draft as constraining the spec. Some of the draft already conflicts with the recommendations above (e.g. budgets store arbitrary `period_start`/`period_end`, the goal `status` field mixes lifecycle and tracking state, and `is_recurring` exists only as a flag). DESIGN should decide whether to adopt, migrate or replace it.
