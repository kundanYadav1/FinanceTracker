# FinanceTracker

## Phase 1 — Product Requirements Specification (PRS)

**Document Status:** Revised draft v1.1 — product decisions accepted, pending final SPEC re-review
**Version:** 1.1 (2026-11-06)
**Phase:** 1 — SPEC
**Product Type:** Local-first personal finance mobile application
**Primary Platform:** Android
**Secondary Platform:** iOS
**Framework Constraint:** React Native + Expo
**Primary Language:** TypeScript

## Change Log

| Version | Date | Change | Approval |
|---|---|---|---|
| 1.0 | — | Initial draft. | Draft |
| 1.1 | 2026-11-06 | Merged review `docs/specs/prs-phase-1-review.md` (RC-01 – RC-32). All recommended defaults for product decisions PD-01 – PD-20 accepted. | Product owner accepted PD-01 – PD-20 defaults on 2026-11-06 |

---

# 1. Product Overview

FinanceTracker is a privacy-first, offline-capable mobile application that helps users:

1. Record income and expenses.
2. Understand where their money is being spent.
3. Create and monitor budgets.
4. Create savings targets with deadlines.
5. Determine how much they need to save each month.
6. Identify spending that can potentially be reduced.
7. Receive explainable recommendations to improve their savings progress.

The application is intended to operate primarily without a backend or user account.

Financial information should remain on the user's device unless the user explicitly chooses an export or future synchronization feature.

The implementation will use React Native and Expo. Expo supports Android and iOS from a shared React Native project, and its current project workflow uses `create-expo-app`.

---

# 2. Product Vision

The application should answer four primary questions:

> Where is my money going?

> How much money can I safely spend?

> How much should I save?

> What can I reduce to reach my savings goal?

The product should not behave merely as a transaction ledger.

It should transform recorded financial data into understandable financial insights.

---

# 3. Target User

The initial target user is an individual who wants to manage personal finances on a mobile device.

Typical user characteristics:

* Receives one or more sources of income.
* Has recurring and variable expenses.
* Wants better control over spending.
* Has one or more savings goals.
* Wants simple recommendations rather than complex financial terminology.
* Prefers local/offline storage.
* Does not want to create an account merely to track personal finances.

The MVP is not targeted at:

* Businesses
* Accounting departments
* Professional accountants
* Investment portfolio management
* Banking institutions

---

# 4. Product Principles

## 4.1 Local-first

The application must remain useful without an internet connection.

The core financial data must be stored locally on the device.

SQLite is appropriate for this type of persisted structured application data; Expo documents that `expo-sqlite` databases persist across application restarts.

## 4.2 Privacy-first

Financial information must not be transmitted to external services unless a future feature explicitly requires user-authorized transmission.

## 4.3 Explainable recommendations

A recommendation must be based on identifiable user data and deterministic rules.

The user should be able to understand why the application generated a recommendation.

## 4.4 Simple financial language

The application should prefer:

> "You spent 25% more on food this month."

over:

> "Your discretionary consumption variance exceeds the historical threshold."

## 4.5 Cross-platform

The product must not intentionally introduce Android-only business logic into core functionality.

The target architecture must preserve compatibility with iOS.

Expo Router provides file-based routing for Android, iOS, and web applications.

---

# 5. MVP Scope

The MVP consists of six primary product areas:

1. Dashboard
2. Transactions
3. Budgets
4. Savings Goals
5. Recommendations
6. Reports

Settings and data export are supporting capabilities.

## 5.1 MVP Feature Status

| Status | Requirements |
|---|---|
| MVP | FR-001, FR-002, FR-003, FR-003A, FR-004 (default categories only), FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018 (MVP reports per FR-018.1), FR-019, FR-022 (JSON export only), FR-024, FR-025 (MVP settings per FR-025.1), FR-026, FR-027 |
| MVP+ | FR-004 custom categories, FR-018 trend/history reports, FR-020 recurring schedules, FR-021 notifications, FR-022 CSV export, FR-025 app lock |
| Deferred (requires own specification) | FR-023 data restore, database encryption |

A requirement not listed as MVP shall not be implemented in the MVP.

---

# 6. Feature Requirements

## FR-001 — User Profile

The application shall allow a user to configure a basic personal profile.

The profile shall support:

* Name
* Primary currency
* Theme preference (system / light / dark)

The profile must not require account registration.

**FR-001.1** The application shall use exactly one primary currency per installation. The user shall select it from the supported-currency list before recording any financial data.

**FR-001.2** Supported currencies for the MVP: INR (2 decimal places).

**FR-001.3** Every stored monetary value shall record its currency. In the MVP every stored monetary value shall be in the primary currency.

**FR-001.4** The primary currency may be changed only while no transactions, budgets or savings goals exist. If any exist, the application shall prevent the change and explain that changing currency would misrepresent existing records and that currency conversion is not supported.

### Acceptance Criteria

* User can enter or modify their name.
* User can select a supported currency.
* User cannot record financial data before a primary currency is selected.
* Changing the primary currency is refused, with an explanation, while any transaction, budget or savings goal exists.
* Profile information persists after application restart.
* The app remains usable without network connectivity.
* No authentication is required for MVP access.

---

# 7. FR-002 — Expense Management

The user shall be able to create an expense transaction.

An expense shall contain:

* Amount
* Category
* Date
* Payment method
* Optional note
* Optional recurring flag

The user shall be able to:

* Add an expense.
* View expenses.
* Edit an expense.
* Delete an expense.
* Search expenses.
* Filter expenses.
* View expenses by date.
* View expenses by category.

**FR-002.1** The recurring flag on a transaction is information only. In the MVP it shall not create, schedule or change any other transaction.

**FR-002.2** Search shall match text in the transaction note and the category name, case-insensitively.

**FR-002.3** Transactions can be filtered by date period (FR-019), type (income/expense), category and payment method. Filters can be combined.

### Acceptance Criteria

A valid expense must not be saved unless it satisfies FR-003A, including:

* Amount is valid.
* Category is selected.
* Payment method is selected.
* Date is valid.

After saving:

* The transaction appears in transaction history.
* Every total, budget status and savings figure whose period includes the transaction's date reflects the change.
* Recommendations and goal tracking states reflect the changed data the next time they are displayed, without restarting the application.
* Data persists after app restart.

---

# 8. FR-003 — Income Management

The user shall be able to record income.

Income shall support:

* Amount
* Income source
* Date
* Optional note
* Optional recurring flag

Example sources:

* Salary
* Business
* Freelance
* Investment
* Rental
* Other

**FR-003.1** The income source is the income category (FR-004). Income does not record a payment method.

**FR-003.2** The recurring flag on income is information only (FR-002.1).

### Acceptance Criteria

The user can:

* Add income.
* Edit income.
* Delete income.
* View income history.
* Filter income (FR-002.3).
* Include income in financial calculations (FR-007, FR-011).

---

# 8.1 FR-003A — Input Validation

1. A transaction amount shall be greater than zero. Whether money comes in or goes out is determined only by the transaction type.
2. The maximum amount for a single transaction, budget, goal target or goal saved amount is 9,999,999,999 smallest currency units (₹99,999,999.99).
3. Amounts shall be rejected if they have more decimal places than the currency allows, contain non-numeric characters other than digit-grouping separators and one decimal separator, or are empty. Excess decimals are rejected, not rounded.
4. A transaction date is required and must satisfy FR-019.5.
5. A category is required. Payment method is required for expenses.
6. A note is optional, with a maximum of 200 characters.
7. A goal name is required, 1–60 characters. A goal target amount shall be greater than zero. A goal target date shall be today or later when the goal is created.
8. A budget amount shall be zero or greater.
9. Every rejected input shall show a message that names the field and the rule that was broken.

Refunds, reversals and transfers between the user's own accounts are out of scope for the MVP (§36).

---

# 9. FR-004 — Transaction Categories

The application shall provide default categories.

Default expense categories should include at least:

* Food
* Groceries
* Transport
* Rent
* Bills
* Shopping
* Entertainment
* Health
* Education
* Travel
* EMI
* Subscriptions
* Other

Default income categories should include:

* Salary
* Business
* Freelance
* Investment
* Rental
* Other

The exact category set may be refined during DESIGN.

**FR-004.1** Each default expense category has a fixed spending class:

* *Essential:* Groceries, Transport, Rent, Bills, Health, Education, EMI
* *Discretionary:* Food (eating out, takeaway, food delivery), Shopping, Entertainment, Travel, Subscriptions
* *Unclassified:* Other

The user cannot change a category's spending class in the MVP (MVP+).

The user should eventually be able to create custom categories.

Custom category management is MVP+.

---

# 10. FR-005 — Payment Methods

Expenses should support common payment methods.

Initial methods:

* Cash
* Bank transfer
* Debit card
* Credit card
* UPI
* Other

The application must not connect directly to banking or payment providers in the MVP.

Payment method is recorded metadata only.

**FR-005.1** Payment method is required for expenses. The form shall preselect the most recently used payment method, or Cash if none has been used.

---

# 11. FR-006 — Dashboard

The dashboard is the primary application screen.

It shall display the current financial situation for a selected period.

The dashboard should show:

* Total income
* Total expenses
* Total savings
* Savings rate
* Budget status
* Savings goal progress
* Important financial recommendations

Example:

```text
Income         ₹50,000
Expenses       ₹35,000
Savings        ₹15,000
Savings Rate        30%
```

**FR-006.1** The dashboard defaults to the current month and shows at most 3 recommendations, ordered by priority. The full list is available on the Recommendations screen.

**FR-006.2 Empty states.** When there is no data for a dashboard element, the element shall say so and explain what the user can do. It shall not show figures that could be read as real zero values without explanation. Specifically:

* No transactions in the period: totals show zero with a "No transactions in this period" message and an action to add one.
* No income in the period: savings rate shows "not available" (FR-007.2).
* No budgets: budget status shows an action to create a budget.
* No goals: goal progress shows an action to create a goal.
* No recommendations, or insufficient history: the reason is stated (e.g. FR-013.2).

### Acceptance Criteria

When a transaction is added, edited, or deleted:

* Every total whose period includes the transaction's date reflects the change.
* Savings update.
* Savings rate updates.
* Budget values whose month includes the transaction's date update.
* Goal tracking states and projections reflect the changed data the next time they are displayed.

---

# 12. FR-007 — Savings Calculation

The application shall calculate:

```text
Monthly Savings =
Total Income - Total Expenses
```

The application shall calculate:

```text
Savings Rate =
(Total Income - Total Expenses) / Total Income × 100
```

Special handling is required when income is zero.

The application must never divide by zero.

**FR-007.0** *Savings for a period* = total income − total expenses for transactions dated within that period. *Monthly savings* is savings for a month period (FR-019.3). When a custom range is selected, the value shall be labelled "Savings", not "Monthly Savings".

**FR-007.1** Savings may be negative and shall be shown with a clear negative indicator. It shall not be shown as zero.

**FR-007.2** When total income for the period is zero, savings rate shall be shown as "not available" with an explanation (e.g. "No income recorded for this period"). It shall not be shown as 0%, −100%, infinity or an error.

**FR-007.3** When savings are negative and income is greater than zero, savings rate shall be shown as a negative percentage.

**FR-007.4** Percentages shown to the user are rounded to one decimal place, with halves rounded away from zero. Rounding applies only to display; stored and intermediate values shall not be rounded.

### Acceptance Criteria

* Calculations use exact monetary representation.
* Results are deterministic.
* Edge cases are tested.
* Calculations are independent of the UI layer.

---

# 13. FR-008 — Budget Management

The user shall be able to define spending budgets.

Initial budget types:

* Monthly total budget
* Category budget

A budget should expose:

* Budget amount
* Amount spent
* Amount remaining
* Utilization percentage
* Status

Possible status:

```text
Healthy
Warning
Exceeded
```

Threshold values will be finalized during DESIGN.

**FR-008.1** Budgets apply to calendar months (FR-019.3). Custom budget periods are out of scope for the MVP.

**FR-008.2** A user may define at most one overall monthly budget and at most one budget per expense category for any month. Category budgets are independent of the overall budget; their sum may exceed it.

**FR-008.3** A budget stays in effect for later months until the user changes or removes it. Changing or removing a budget shall affect the current month and later months only. The budget amount in effect for every past month shall be kept and used when that month is reported.

**FR-008.4** Spending against a budget is the sum of expense transactions dated within that month (and, for a category budget, in that category).

**FR-008.5** Unspent budget does not carry over to the next month.

**FR-008.6** For a zero budget, utilization percentage is not shown; status is Healthy when spending is zero and Exceeded when spending is greater than zero.

**FR-008.7** Status is Exceeded when spending is greater than the budget amount. Spending exactly equal to the budget is not Exceeded. The Warning threshold is defined in DESIGN as a single percentage below 100%.

**FR-008.8** Amount remaining is never shown as negative; when spending exceeds the budget, the overspent amount is shown instead.

### Acceptance Criteria

The application must:

* Show actual spending against the budget.
* Update budget status after transaction changes (FR-008.4).
* Handle zero-value budgets per FR-008.6.
* Apply budgets to calendar months per FR-008.1 – FR-008.5.
* Report each past month against the budget amount that was in effect for that month (FR-008.3).

---

# 14. FR-009 — Savings Goals

The user shall be able to create savings goals.

Each goal shall include:

* Goal name
* Target amount
* Current saved amount
* Target date
* Priority
* Lifecycle status (FR-009.2)

**FR-009.1** A goal's current saved amount is entered and updated by the user. It is not calculated from transactions. It can go up or down. It shall not be negative.

**FR-009.2** A goal has a *lifecycle status* set by the user: Active, Paused, or Archived. Only Active goals take part in tracking (FR-011) and in savings-gap calculations (FR-015).

**FR-009.3** When expected monthly saving (FR-011.1) is unavailable, zero or negative, no projected completion date is shown, and the reason is stated.

Example:

```text
Emergency Fund

Target:          ₹100,000
Current:          ₹25,000
Remaining:        ₹75,000
Target date:      31 Dec 2026
```

The application shall calculate:

* Remaining amount
* Progress percentage
* Required monthly saving
* Projected completion date
* Whether the user is on track

---

# 15. FR-010 — Required Monthly Saving

For a goal:

```text
Required Monthly Saving =
(Target Amount - Current Saved Amount)
÷ Remaining Saving Periods
```

The calculation must handle:

* Goal already completed.
* No remaining time.
* Target date in the past.
* Zero remaining amount.
* Target amount below current savings.

**FR-010.1** *Remaining saving periods* = the number of calendar months from the current month through the month containing the target date, counting both.

**FR-010.2** Required monthly saving = remaining amount ÷ remaining saving periods, rounded **up** to the currency's smallest unit.

**FR-010.3** Edge-case results:

| Condition | Remaining amount | Required monthly saving | Tracking state |
|---|---|---|---|
| Current ≥ target | 0 | 0 | Completed |
| Target date before today and current < target | target − current | not calculated | Expired |
| Target date in the current month | target − current | target − current | per FR-011 |
| Target amount ≤ 0 | — | invalid; goal cannot be saved (FR-003A) | — |

Remaining amount shall never be shown as negative.

---

# 16. FR-011 — Goal Tracking

The application shall compare:

```text
Required Monthly Saving
```

against:

```text
Actual / Expected Monthly Saving
```

Possible goal states:

```text
On Track
At Risk
Behind
Completed
Expired
```

**FR-011.1** *Expected monthly saving* is the average of monthly savings (FR-007.0) over the most recent complete months (FR-019.6), up to 3, in which at least one transaction exists. If no complete month exists, expected monthly saving is *unavailable*, and goal tracking states that depend on it shall not be shown.

**FR-011.2** A goal has a *tracking state* calculated by the application and never stored as user input: Completed, Expired, On Track, At Risk, or Behind.

**FR-011.3** States are evaluated in this order of precedence: Completed (current ≥ target) → Expired (target date before today) → On Track / At Risk / Behind. The rules for the last three are defined in DESIGN, must be deterministic, and must be explainable to the user using the values involved.

---

# 17. FR-012 — Recommendation Engine

The MVP recommendation engine shall be deterministic.

It shall analyze:

* Income
* Expenses
* Category spending
* Historical spending
* Budgets
* Savings goals
* Recurring expenses (MVP+, once FR-020 is specified)

The engine shall generate recommendations when meaningful opportunities or risks are detected.

**FR-012.1** A recommendation is generated only when a named rule's conditions are met. Each rule's conditions and thresholds shall be documented in DESIGN, and the rule shall be identifiable in the recommendation's explanation.

**FR-012.2** Recommendations are calculated from the current local data each time they are displayed. They shall reflect any transaction, budget or goal change immediately.

**FR-012.3** The dashboard shall show at most 3 recommendations, ordered by priority. Dismissing or snoozing recommendations is out of scope for the MVP.

---

# 18. FR-013 — Spending Anomaly Recommendation

The application should identify meaningful increases in spending.

Example:

```text
Food

Current:
₹6,200

Historical average:
₹4,900

Increase:
26.5%

Recommendation:
Your food spending is above your normal level.
```

The precise anomaly threshold will be defined during DESIGN.

**FR-013.1** The historical average for a category is the mean of its spending over the 3 most recent complete months before the evaluated month. A month with no spending in the category counts as zero.

**FR-013.2** Anomaly recommendations require at least 3 complete months of transaction history. With less history, no anomaly recommendation is generated, and the application shall show that more history is needed.

**FR-013.3** For the current incomplete month, an anomaly may be reported only when month-to-date spending in the category already exceeds the category's historical full-month average. The application shall not project or extrapolate incomplete-month spending.

**FR-013.4** No anomaly is reported for a category whose historical average is zero; the application shall not show an infinite or undefined percentage increase.

**FR-013.5** Anomalies in Essential or Unclassified categories (FR-004.1) are informational only and shall not suggest reducing spending (§32, FR-016.1).

---

# 19. FR-014 — Budget Warning Recommendation

When spending approaches or exceeds a budget, the application should generate an appropriate recommendation.

Example:

```text
You have used 92% of your shopping budget.
₹240 remains for this month.
```

---

# 20. FR-015 — Savings Gap Recommendation

When:

```text
Required Monthly Saving
>
Current Expected Monthly Saving
```

the application shall identify the savings gap.

Example:

```text
Required:
₹18,750/month

Current:
₹15,000/month

Gap:
₹3,750/month
```

The application should then identify potentially reducible discretionary spending.

**FR-015.1** The savings gap is calculated across all Active, not-completed goals: *total required monthly saving* (sum of each goal's FR-010 result) minus *expected monthly saving* (FR-011.1). A gap exists only when that difference is greater than zero. The application shall not present any single goal as fully funded while the total is unfunded.

**FR-015.2** When expected monthly saving is unavailable, no savings gap is calculated; the application shows the total required monthly saving as a fact only.

---

# 21. FR-016 — Expense Reduction Suggestions

The recommendation engine should prioritize discretionary expenses where possible.

Potential categories (Discretionary per FR-004.1):

* Food (eating out, takeaway, food delivery)
* Shopping
* Entertainment
* Subscriptions
* Travel

The system should not automatically recommend reducing essential expenses simply because they are large.

**FR-016.1** Reduction suggestions shall be generated only for Discretionary categories (FR-004.1). Essential and Unclassified categories may appear in informational insights but shall never be the subject of a suggestion to reduce spending.

---

# 22. FR-017 — Recommendation Explainability

Every recommendation should have:

* Title
* Reason
* Supporting data
* Suggested action
* Potential savings where calculable
* Priority

Example:

```text
Reduce Shopping Spending

Why:
You spent ₹5,200 this month,
which is 30% above your normal average.

Potential savings:
up to ₹1,200 this month (estimate).

Suggested action:
Reduce non-essential shopping this month.
```

The application should not present speculative recommendations as guaranteed savings.

**FR-017.1** Potential savings, where shown, shall not exceed the category's spending above its historical average for the evaluated month. It shall be labelled as an estimate (e.g. "up to ₹X"), shall never be described as guaranteed, and shall be omitted when it cannot be calculated from stored data.

---

# 23. FR-018 — Reports

The user shall be able to review historical financial information.

Initial reports:

* Monthly income
* Monthly expenses
* Monthly savings
* Category spending
* Savings trend
* Budget performance
* Goal progress

The reports must be generated from local data.

**FR-018.1 MVP reports.** For a selected period (FR-019):

* Total income, total expenses and savings (FR-007).
* Category spending: each expense category's total, in descending order of amount, with its share of total expenses. The category totals shall add up exactly to total expenses.

**FR-018.2 MVP+ reports.** Savings trend, budget performance history and goal progress history are MVP+.

---

# 24. FR-019 — Date Filtering

The user should be able to view financial data by:

* Current month
* Previous month
* Custom date range

The initial date implementation will use the user's device-local calendar/timezone.

**FR-019.1 Transaction date.** A transaction date is a calendar date (year, month, day) with no time of day or time zone. Once saved, it shall not change because of a device time zone or clock change.

**FR-019.2 Today.** "Today" is the current calendar date in the device's time zone at the moment of evaluation.

**FR-019.3 Month period.** A month period runs from the first to the last calendar day of the month, both inclusive, including 29 February in leap years.

**FR-019.4 Custom range.** A custom range includes its start and end dates. The start date shall not be after the end date.

**FR-019.5 Future dates.** A transaction date shall not be later than today.

**FR-019.6 Complete and incomplete months.** A month is *complete* when today is after its last day. The current month is *incomplete*. Calculations that compare against historical behavior (FR-011, FR-013, FR-015) shall use complete months as their history, and shall not present an incomplete month's total as if it were a full month's.

**FR-019.7** Recommendations and goal calculations evaluate calendar months only; a custom range affects displayed totals and reports, not recommendation rules.

---

# 25. FR-020 — Recurring Transactions

**Status: MVP+.** In the MVP, the recurring flag on a transaction is information only (FR-002.1).

Recurring schedules that create transactions require their own specification. That specification shall define generation (automatic vs user-confirmed), catch-up after the app hasn't been opened for some time, prevention of duplicate occurrences, handling of days 29–31 and 29 February, and the effect of editing or deleting a schedule on occurrences already created.

The application shall support recurring income and expenses.

Examples:

```text
Rent
Salary
Internet
Subscriptions
Insurance
EMI
```

Recurring transactions should support:

* Frequency
* Amount
* Category
* Next occurrence
* Active/inactive status

Automatic transaction generation rules will be defined during DESIGN.

---

# 26. FR-021 — Notifications

The product may provide local notifications for:

* Budget warnings
* Savings-goal reminders
* Monthly financial summaries
* Incomplete expense tracking
* Goal milestones

Notifications must be user-configurable.

Notifications are not required for the initial functional MVP and may be implemented after the core financial engine is stable.

**Status: MVP+.** The notification specification shall define when permission is requested, the default on/off state, and whether amounts may appear in notification text (including on the lock screen).

---

# 27. FR-022 — Data Export

The user should eventually be able to export their financial data.

Supported formats should include:

* CSV
* JSON

Exported data should contain enough information to reconstruct the user's transactions and goals.

Backup/restore requirements will be formally specified before implementation.

**FR-022.1 (MVP)** The user shall be able to export all transactions, budgets, savings goals and profile settings to a single JSON file containing a format version identifier. The export shall work offline.

**FR-022.2** Before exporting, the application shall warn that the exported file is not encrypted and contains the user's financial information.

**FR-022.3** CSV export is MVP+.

---

# 28. FR-023 — Data Restore

The application should eventually allow restoration of previously exported application data.

Restore behavior must:

* Validate the input format.
* Prevent malformed data from corrupting the local database.
* Clearly warn before overwriting existing data.
* Preserve financial data integrity.

This feature requires its own specification before implementation.

**Status: Deferred.** The restore specification shall require rejecting files with an unknown or newer format version, and shall define merge vs replace behavior.

---

# 29. FR-024 — Offline Operation

The following functions must operate without an internet connection:

* Add expense
* Add income
* View transactions
* Calculate savings
* View dashboard
* Manage budgets
* Manage savings goals
* Generate recommendations
* View reports

Internet connectivity must not be a prerequisite for core functionality.

---

# 30. FR-025 — Application Settings

The application should provide settings for:

* Currency
* Theme
* Notifications
* App lock
* Data export
* Data restore
* About
* Privacy information

The exact settings menu will be defined during DESIGN.

**FR-025.1 (MVP)** Settings shall contain: primary currency (subject to FR-001.4), theme (system / light / dark), data export (FR-022.1), delete all data (FR-026.2), about, and privacy information (NFR-004.2). Notifications and app lock are MVP+. Data restore is deferred.

---

# 30.1 FR-026 — Data Lifecycle

1. Deleting a transaction, budget or savings goal shall require confirmation that names the item being deleted.
2. The user shall be able to delete all application data from Settings, after a confirmation that states the deletion is permanent and cannot be undone. Afterwards the application shall contain no transactions, budgets, goals or profile data.
3. A save shall be all-or-nothing: either the whole record is stored, or nothing is stored and the user is told.
4. A single save action (including a repeated tap) shall create at most one record.
5. Application updates shall preserve all existing financial records and their values.

---

# 30.2 FR-027 — Error Handling

1. If a save fails, the application shall tell the user that the data was **not** saved and shall keep their entered values so they can retry.
2. If the local database cannot be opened or upgraded, the application shall show an error screen explaining that financial data is unavailable. It shall not show empty totals that could be mistaken for zero values, and it shall not delete or recreate the database automatically.
3. Error messages shown to users and written to logs shall not contain transaction amounts, notes or other financial details.

---

# 31. Non-Functional Requirements

## NFR-001 — Performance

Normal transaction operations should feel immediate to the user.

Large historical datasets should not cause unnecessary UI blocking.

Financial calculations should be efficient enough for mobile execution.

**NFR-001.1** The application shall remain usable with up to 50,000 stored transactions.

**NFR-001.2** On a mid-range Android device with 50,000 transactions stored:

* A saved transaction is visible in the transaction list within 300 ms of the save action.
* The dashboard is fully displayed within 1 second of opening.

The reference device is chosen in DESIGN.

---

## NFR-002 — Reliability

A successfully stored transaction must survive:

* App restart
* Backgrounding
* Device restart

The application must avoid data loss caused by normal lifecycle events.

---

## NFR-003 — Data Integrity

Financial calculations must be deterministic.

Money calculations must avoid floating-point precision errors.

---

## NFR-004 — Privacy

Core financial information must remain local unless explicitly exported or synchronized by a future user-authorized feature.

**NFR-004.1** The application shall exclude its financial database from automatic operating-system cloud backups (e.g. Android Auto Backup, iCloud backup) by default, so that financial data does not leave the device without an explicit user action.

**NFR-004.2** The application's privacy information shall state where data is stored, that it is not backed up automatically, that uninstalling the application deletes it, and that the user can protect against loss by exporting it (FR-022.1).

---

## NFR-005 — Cross-Platform Compatibility

Core product behavior must work on:

* Android
* iOS

Platform-specific APIs must be isolated.

---

## NFR-006 — Accessibility

The application should support:

* Readable text
* Adequate touch targets
* Screen-reader-friendly labels
* Sufficient contrast
* Clear error messages

**NFR-006.1** The application shall follow WCAG 2.2 Level AA principles as they apply to mobile apps, including:

* Minimum touch target of 48×48 dp.
* Every interactive element has a screen-reader label.
* Text contrast ratio of at least 4.5:1 (3:1 for large text).
* Text remains usable at the device's largest standard font size.
* Error messages identify the field and the problem in text, not by color alone.

---

## NFR-007 — Maintainability

The codebase must support:

* Strict TypeScript
* Testable business logic
* Modular features
* Database migrations
* Documented architecture decisions

---

## NFR-008 — Testability

Critical financial calculations and recommendation rules must be unit-testable without rendering the application UI.

---

# 32. Financial Safety Constraints

The application is a personal budgeting and expense-management tool.

It is not a regulated financial advisor.

Recommendations must therefore:

* Be presented as suggestions.
* Avoid guaranteeing financial outcomes.
* Not claim that a saving amount is certain.
* Not provide investment instructions in the MVP.
* Not make assumptions about the user's ability to reduce essential expenses.
* Clearly distinguish calculated facts from suggestions.

---

# 33. Currency Requirements

The application shall store currency explicitly.

The MVP should support a configurable primary currency.

The system must not silently mix currencies.

Currency conversion is OUT OF SCOPE for MVP.

Supported currencies and currency-change rules are defined in FR-001.1 – FR-001.4.

**§33.1 Language and display.** The MVP user interface is English only. INR amounts are displayed with the ₹ symbol, Indian digit grouping and two decimals (e.g. ₹1,00,000.00). Negative amounts are displayed with a leading minus sign.

---

# 34. Monetary Precision Requirements

The domain model must represent monetary values in an exact manner suitable for financial calculations.

The application must not rely on JavaScript floating-point arithmetic for financial storage or calculations where precision could be lost.

**§34.1** Monetary amounts shall be stored and calculated as whole numbers of the currency's smallest unit (e.g. paise for INR). An input with more decimal places than the currency allows shall be rejected, not rounded.

**§34.2** Limits on individual amounts are defined in FR-003A. Calculations shall either produce exact results or fail explicitly; they shall never silently lose precision.

---

# 35. Security Requirements

The MVP must not expose financial data unnecessarily through:

* Console logs
* Error messages
* Debug output
* Analytics events

App-lock and database encryption are security features to be designed separately.

The product must not claim that the local database is encrypted unless encryption has actually been implemented and verified.

---

# 36. Explicitly Out of Scope for MVP

The following are NOT part of the MVP:

* User registration
* Social login
* Cloud account
* Backend API
* Firebase
* Supabase
* Bank account integration
* Automatic bank transaction import
* Payment gateway integration
* Investment portfolio tracking
* Stock trading
* Cryptocurrency tracking
* Credit-score tracking
* Loan marketplace
* Financial advisor marketplace
* AI chatbot
* External LLM API
* Automatic financial advice from an external model
* Multi-user household accounts
* Business accounting
* Tax filing
* Currency conversion
* International remittance
* Multiple currencies within one installation
* Refunds, reversals and transfers between the user's own accounts
* Custom budget periods (budgets are calendar-month only)
* Future-dated transactions
* Dismissing or snoozing recommendations

These may be considered in later product versions.

---

# 37. Initial User Stories

## US-001 — Record Expense

**As a user,**

I want to record an expense,

so that I can understand where my money is going.

### Acceptance Criteria

* I can enter an amount.
* I can select a category.
* I can select a date.
* I can select a payment method.
* I can optionally enter a note.
* I can save the expense.
* The expense appears in history.
* Dashboard totals update.

---

## US-002 — Record Income

**As a user,**

I want to record income,

so that the application can calculate my available savings.

### Acceptance Criteria

* Income can be added.
* Income can be edited.
* Income can be deleted.
* Income appears in history.
* Income contributes to financial calculations.

---

## US-003 — Create Savings Goal

**As a user,**

I want to set a target amount and deadline,

so that I know how much I need to save each month.

### Acceptance Criteria

* I can enter a goal name.
* I can enter a target amount.
* I can enter a target date.
* I can enter current savings.
* The app calculates the remaining amount.
* The app calculates required monthly savings.

---

## US-004 — Understand Spending

**As a user,**

I want to see my spending by category,

so that I can identify expensive areas.

### Acceptance Criteria

* Category totals are shown.
* A date period can be selected.
* Category totals for the selected period are listed in descending order of amount, and their sum equals total expenses for the period.
* Total spending matches transaction data.

---

## US-005 — Receive Savings Recommendation

**As a user,**

I want the app to tell me where I can potentially reduce expenses,

so that I can reach my savings target.

### Acceptance Criteria

* Recommendation includes a reason.
* Recommendation is based on actual stored data.
* Potential savings are calculated where possible.
* Recommendation identifies the relevant category.
* The user can understand why it was generated.

---

## US-006 — Track Budget

**As a user,**

I want to set a category budget,

so that I know when I am approaching or exceeding my limit.

### Acceptance Criteria

* I can create a budget.
* Spending is compared against the budget.
* Remaining amount is displayed.
* Budget status reflects a saved transaction as soon as the user returns to any screen showing that budget.

---

## US-007 — Use App Offline

**As a user,**

I want to manage my finances without internet access,

so that my personal finance app remains useful anywhere.

### Acceptance Criteria

* Transactions can be created offline.
* Existing information can be viewed offline.
* Calculations work offline.
* Recommendations work offline.

---

# 38. Core Domain Concepts

The product domain consists of:

```text
User
 ├── Preferences
 │
 ├── Transactions
 │    ├── Income
 │    └── Expense
 │
 ├── Categories
 │
 ├── Budgets
 │
 ├── Savings Goals
 │
 ├── Recurring Transactions (MVP+)
 │
 └── Recommendations
```

The exact database schema is intentionally deferred to DESIGN.

---

# 39. Definition of Phase 1 Completion

Phase 1 SPEC is complete when:

* Product purpose is defined.
* Target user is defined.
* MVP scope is defined.
* Functional requirements are documented.
* Non-functional requirements are documented.
* User stories are documented.
* Acceptance criteria are documented.
* Financial safety constraints are documented.
* Privacy constraints are documented.
* Explicit MVP exclusions are documented.
* Requirements are sufficiently unambiguous for DESIGN.

---

# 40. Phase 1 Exit Criteria

The project may proceed to DESIGN only after the specification is reviewed and accepted.

The next phase must convert this specification into:

1. System architecture.
2. Feature architecture.
3. Database schema.
4. Navigation design.
5. State-management design.
6. Financial calculation design.
7. Recommendation-engine design.
8. Error-handling strategy.
9. Security strategy.
10. Testing strategy.

No production feature implementation should begin before that DESIGN phase is completed.