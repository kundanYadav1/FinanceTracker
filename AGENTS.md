# FinanceTracker — AI Development Rules

## 1. Project Identity

FinanceTracker is a privacy-first, local-first personal finance application built with:

- React Native
- Expo SDK 57
- TypeScript
- Expo Router
- SQLite
- Zustand
- React Hook Form
- Zod
- Jest
- React Native Testing Library

The application targets Android first and must remain cross-platform compatible with iOS.

---

## 2. Core Development Method

All development MUST follow this sequence:

**SPEC → DESIGN → TASK → BUILD → TEST**

Never skip a stage.

### SPEC

Define exactly:

- What is being built
- Why it is needed
- User behavior
- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Constraints
- Out-of-scope behavior

No production code should be written before the specification is sufficiently defined.

### DESIGN

Translate the approved specification into:

- Architecture
- Data model
- Component structure
- Navigation
- State flow
- Database changes
- Business logic
- Error handling
- Security considerations
- Testing strategy

Design decisions must be documented before implementation begins.

### TASK

Break the design into small, independently verifiable implementation tasks.

Each task must include:

- Task ID
- Objective
- Files likely to change
- Dependencies
- Implementation requirements
- Acceptance criteria
- Test requirements

Tasks should be small enough that an agent can complete and verify them without ambiguity.

### BUILD

Implement only the approved tasks.

The agent MUST NOT:

- Add unrelated features
- Refactor unrelated code
- Introduce unnecessary dependencies
- Change architecture without documentation
- Modify requirements silently

### TEST

Testing is mandatory.

The agent must:

1. Run relevant unit tests.
2. Run relevant integration/component tests.
3. Run linting/type checking.
4. Run Expo validation.
5. Verify the affected user workflow where practical.
6. Report failures honestly.

A task is not complete until its acceptance criteria are verified.

---

## 3. Source of Truth

The source of truth is ordered as follows:

1. Approved specification
2. Approved design
3. Approved task
4. Existing architecture decisions
5. Existing implementation
6. Agent assumptions

When two sources conflict, stop and resolve the higher-level source first.

Never silently choose an implementation that contradicts an approved specification.

---

## 4. No Silent Scope Expansion

The agent MUST NOT add features merely because they appear useful.

Examples:

- No authentication unless specified.
- No cloud backend unless specified.
- No AI API unless specified.
- No bank integration unless specified.
- No analytics platform unless specified.
- No new navigation structure unless specified.

Potential improvements may be documented as recommendations but must not be implemented without authorization.

---

## 5. Dependency Policy

Before adding a dependency, determine:

1. Why it is required.
2. Whether the existing stack already provides the capability.
3. Whether Expo provides an official package.
4. Whether the dependency supports Android and iOS.
5. Whether it introduces native build requirements.
6. Whether it is actively maintained.
7. Whether its license is acceptable.

Prefer:

- Expo official packages
- React Native ecosystem packages
- Small, focused dependencies

Do not add dependencies for trivial functionality that can reasonably be implemented internally.

For Expo packages, use:

`npx expo install <package>`

Do not manually select Expo package versions unless the specification explicitly requires it.

---

## 6. Local-First Principle

Financial data is local by default.

SQLite is the primary source of truth for:

- Transactions
- Income
- Expenses
- Budgets
- Savings goals
- Recurring transactions
- Financial analysis data

Do not introduce a remote backend into the core MVP.

Financial calculations must work without an internet connection.

---

## 7. Financial Data Rules

Never use JavaScript floating-point numbers for monetary calculations where precision can be affected.

Money should be represented using integer minor units.

Example:

₹125.50

should be represented conceptually as:

12550 minor units

rather than:

125.50 as a floating-point financial value.

Currency must be stored explicitly.

Never silently convert between currencies.

---

## 8. Business Logic Rules

Financial calculations MUST NOT live inside React components.

Business logic belongs in dedicated services/domain functions.

Examples:

- calculateMonthlyIncome()
- calculateMonthlyExpenses()
- calculateMonthlySavings()
- calculateSavingsRate()
- calculateBudgetUsage()
- calculateGoalProgress()
- calculateRequiredMonthlySaving()
- calculateProjectedGoalDate()
- calculateSavingsGap()

These functions must be independently testable.

---

## 9. Recommendation Engine Rules

Recommendations must initially be deterministic and explainable.

Do not introduce machine learning or external AI APIs unless explicitly specified.

Every recommendation should have:

- Reason
- Supporting data
- Rule or calculation used
- Potential impact
- Suggested action

The application must be able to explain why a recommendation was generated.

---

## 10. UI Rules

Use React Native and Expo conventions.

Keep UI components focused.

Components should not:

- Directly query SQLite
- Contain complex financial calculations
- Contain large business rules
- Perform unrelated side effects

Prefer:

UI → Hook/State → Service/Use Case → Repository → Database

---

## 11. Database Rules

Database schema changes must be treated as migrations.

Never modify an existing schema casually.

Every schema change must include:

- Migration
- Updated schema definition
- Relevant tests
- Migration verification

Existing user data must be considered valuable and must not be destroyed during normal upgrades.

---

## 12. Testing Rules

Every meaningful feature must have automated tests.

At minimum:

### Business logic

Unit tests.

### Database

Repository/database tests where applicable.

### UI

Component tests for important behavior.

### User workflows

Integration or E2E testing for critical flows.

Critical financial calculations require edge-case tests.

Examples:

- Zero income
- Zero expenses
- Zero budget
- Goal already completed
- Past target date
- No transactions
- Negative balance scenarios where supported
- Very large monetary values
- Leap years
- Month boundaries
- Currency precision

---

## 13. TypeScript Rules

Use strict TypeScript.

Avoid:

`any`

unless there is a documented technical reason.

Prefer explicit domain types.

Do not use unchecked casts to suppress errors.

Bad:

```ts
const value = data as any;
```

Good:

```ts
const result = parseTransaction(data);
```

Runtime validation should be used at external/input boundaries.

Use Zod where appropriate.

---

## 14. Error Handling

Errors must be explicit.

Do not silently swallow errors.

Bad:

```ts
try {
  await saveTransaction();
} catch {}
```

Good:

```ts
try {
  await saveTransaction();
} catch (error) {
  logger.error(error);
  throw new TransactionPersistenceError(...);
}
```

User-facing errors should be understandable.

Developer-facing errors should contain enough context to diagnose the issue without exposing sensitive financial information.

---

## 15. Privacy

Financial data is sensitive application data.

Never:

- Log raw transaction information unnecessarily.
- Put financial data into analytics events.
- Send financial data to external services without explicit requirements.
- Include sensitive data in screenshots or test fixtures unnecessarily.
- Hard-code secrets in source code.

---

## 16. Agent File Modification Rules

Before modifying files:

1. Read the relevant specification.
2. Read the relevant design.
3. Read the relevant task.
4. Inspect the existing implementation.
5. Identify the smallest required change.

Do not rewrite entire files unnecessarily.

Do not change unrelated formatting.

Do not perform large refactors during feature implementation unless the task explicitly requires them.

---

## 17. Verification Rules

After implementation, run the appropriate verification commands.

At minimum where applicable:

```bash
npm test
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

The agent must report:

- Commands executed
- Tests passed
- Tests failed
- Known warnings
- Remaining risks

Never claim a test passed if it was not actually executed.

---

## 18. Git Rules

Use conventional commit messages.

Examples:

```text
feat: add expense transaction model
fix: correct savings rate calculation
test: add savings goal edge cases
refactor: extract recommendation rules
docs: add expense specification
chore: update Expo dependencies
```

One logical change per commit where practical.

Do not commit secrets.

---

## 19. Documentation Rules

Architecture decisions must be documented.

Significant decisions should be recorded under:

`docs/decisions/`

Specifications belong under:

`docs/specs/`

Design documents belong under:

`docs/design/`

Implementation tasks belong under:

`docs/tasks/`

Test plans belong under:

`docs/tests/`

---

## 20. Change Control

If implementation reveals that the specification is incorrect:

Do NOT silently modify the specification.

Instead:

1. Report the discrepancy.
2. Explain the technical impact.
3. Propose a change.
4. Update the specification/design only after the change is accepted.
5. Continue implementation against the updated source of truth.

---

## 21. Definition of Done

A task is DONE only when:

- Specification requirements are satisfied.
- Design requirements are satisfied.
- Implementation is complete.
- Relevant tests pass.
- Type checking passes.
- Linting passes.
- No unrelated regressions are introduced.
- Documentation is updated where necessary.
- Acceptance criteria are explicitly verified.

Code that compiles but has not been tested is NOT considered complete.

---

## 22. Agent Behavior

The agent should behave like a senior software engineer.

Prioritize:

- Correctness
- Maintainability
- Security
- Testability
- Simplicity
- Explicit reasoning in documentation
- Minimal changes
- Reproducibility

Do not optimize for generating the largest amount of code.

Generate the smallest correct implementation that satisfies the approved specification.