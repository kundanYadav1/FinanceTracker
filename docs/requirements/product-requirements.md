# FinanceTracker

## Phase 1 — Product Requirements Specification (PRS)

**Document Status:** Draft for approval
**Phase:** 1 — SPEC
**Product Type:** Local-first personal finance mobile application
**Primary Platform:** Android
**Secondary Platform:** iOS
**Framework Constraint:** React Native + Expo
**Primary Language:** TypeScript

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

---

# 6. Feature Requirements

## FR-001 — User Profile

The application shall allow a user to configure a basic personal profile.

The profile shall support:

* Name
* Preferred currency
* Basic application preferences

The profile must not require account registration.

### Acceptance Criteria

* User can enter or modify their name.
* User can select a supported currency.
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

### Acceptance Criteria

A valid expense must not be saved unless:

* Amount is valid.
* Category is selected.
* Date is valid.

After saving:

* The transaction appears in transaction history.
* Dashboard totals update.
* Relevant budget calculations update.
* Relevant recommendations can update.
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

### Acceptance Criteria

The user can:

* Add income.
* Edit income.
* Delete income.
* View income history.
* Filter income.
* Include income in financial calculations.

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

The user should eventually be able to create custom categories.

Custom category management is considered an MVP+ requirement unless required by the final UX design.

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

### Acceptance Criteria

When a transaction is added, edited, or deleted:

* Relevant totals update.
* Savings update.
* Savings rate updates.
* Relevant budget values update.
* Relevant goal projections can update.

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

### Acceptance Criteria

The application must:

* Show actual spending against the budget.
* Update budget status after transaction changes.
* Handle zero-value budgets safely.
* Handle budget periods correctly.
* Preserve historical budget information.

---

# 14. FR-009 — Savings Goals

The user shall be able to create savings goals.

Each goal shall include:

* Goal name
* Target amount
* Current saved amount
* Target date
* Priority
* Status

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

The exact definition of "saving period" will be finalized during DESIGN.

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

The state rules will be defined during DESIGN.

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
* Recurring expenses

The engine shall generate recommendations when meaningful opportunities or risks are detected.

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

---

# 21. FR-016 — Expense Reduction Suggestions

The recommendation engine should prioritize discretionary expenses where possible.

Potential categories:

* Shopping
* Dining
* Entertainment
* Subscriptions
* Travel

The system should not automatically recommend reducing essential expenses simply because they are large.

The precise classification rules will be defined in DESIGN.

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
₹1,000–₹1,500/month.

Suggested action:
Reduce non-essential shopping this month.
```

The application should not present speculative recommendations as guaranteed savings.

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

---

# 24. FR-019 — Date Filtering

The user should be able to view financial data by:

* Current month
* Previous month
* Custom date range

The initial date implementation will use the user's device-local calendar/timezone.

Time-zone behavior and date-boundary rules must be explicitly defined during DESIGN.

---

# 25. FR-020 — Recurring Transactions

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

---

# 27. FR-022 — Data Export

The user should eventually be able to export their financial data.

Supported formats should include:

* CSV
* JSON

Exported data should contain enough information to reconstruct the user's transactions and goals.

Backup/restore requirements will be formally specified before implementation.

---

# 28. FR-023 — Data Restore

The application should eventually allow restoration of previously exported application data.

Restore behavior must:

* Validate the input format.
* Prevent malformed data from corrupting the local database.
* Clearly warn before overwriting existing data.
* Preserve financial data integrity.

This feature requires its own specification before implementation.

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

---

# 31. Non-Functional Requirements

## NFR-001 — Performance

Normal transaction operations should feel immediate to the user.

Large historical datasets should not cause unnecessary UI blocking.

Financial calculations should be efficient enough for mobile execution.

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

Exact accessibility standards will be defined during DESIGN.

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

---

# 34. Monetary Precision Requirements

The domain model must represent monetary values in an exact manner suitable for financial calculations.

The application must not rely on JavaScript floating-point arithmetic for financial storage or calculations where precision could be lost.

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
* Category spending can be compared.
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
* Budget status updates automatically.

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
 ├── Recurring Transactions
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