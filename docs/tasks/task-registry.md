# Task Registry

> **Plan status: PROVISIONAL — execution gate G0 is closed.** No task may move to `IN PROGRESS` until G0 passes ([master-task-plan §10](master-task-plan.md#10-external-blockers-and-approval-gates)). `NOT STARTED` below means "ready once G0 passes and dependencies are DONE"; `BLOCKED` means a **task-specific** decision or external input is also missing (column *Gate / blocker*).

This registry is the single status board. Executing agents update the **Status** column (and the matching `Status` line in the task file) as described in [agent-execution-guide §4](agent-execution-guide.md#4-status-transitions). Dependencies listed here are the **direct** prerequisites; the task files' `Dependencies` fields are the source of truth and the `Blocks` fields are derived from them.

**Status values:** `NOT STARTED` · `IN PROGRESS` · `BLOCKED` · `DONE` · `DEFERRED`. No task is DONE — nothing has been implemented in Phase 3.

## Summary

| Phase | Tasks | CRITICAL | HIGH | MEDIUM | LOW | Task-specific BLOCKED |
|---|---|---|---|---|---|---|
| 4 — Application Foundation | 24 | 13 | 10 | 0 | 1 | 6 |
| 5 — Transaction Management | 12 | 6 | 5 | 1 | 0 | 4 |
| 6 — Dashboard & Analytics | 8 | 2 | 6 | 0 | 0 | 1 |
| 7 — Budgets & Savings Goals | 16 | 5 | 9 | 2 | 0 | 5 |
| 8 — Recommendation Engine | 11 | 3 | 8 | 0 | 0 | 1 |
| 9 — Security, Backup & Release | 17 | 3 | 12 | 2 | 0 | 9 |
| **Total active tasks** | **88** | **32** | **50** | **5** | **1** | **26** |
| Deferred (reserved IDs, no task document) | 10 | — | — | — | — | all `DEFERRED` |

Complexity: 21 SMALL · 64 MEDIUM · 3 LARGE (TASK-411, TASK-412, TASK-709).

Gate legend: **G0** = global execution gate only (OD-01 + design/ADR approval). **OD-xx** = open decision in [docs/design/open-decisions.md](../design/open-decisions.md). **DG-xx** = design gap found during planning, [design-gaps.md](design-gaps.md). **external** = input outside the project (accounts, hardware).

## Active tasks
<!--ROWS-->
### Phase 4 — Foundation

| Task ID | Task Name | Phase | Priority | Complexity | Dependencies | Status | Gate / blocker |
|---|---|---|---|---|---|---|---|
| [TASK-401](phase-04-foundation/TASK-401-layer-lint-rules.md) | Layer boundary lint rules and source-tree conventions | 4 | HIGH | SMALL | — | NOT STARTED | G0 |
| [TASK-402](phase-04-foundation/TASK-402-test-tooling.md) | Test tooling — multi-timezone runs and coverage gates | 4 | HIGH | SMALL | — | NOT STARTED | G0 |
| [TASK-403](phase-04-foundation/TASK-403-unused-dependency-cleanup.md) | Unused dependency cleanup | 4 | LOW | SMALL | TASK-423 | BLOCKED | OD-17, OD-13 |
| [TASK-404](phase-04-foundation/TASK-404-shared-lib-result-ids-clock.md) | Shared library — Result type, ID generator, Clock | 4 | CRITICAL | SMALL | TASK-401 | NOT STARTED | G0 |
| [TASK-405](phase-04-foundation/TASK-405-errors-and-logger.md) | Error taxonomy, user-message catalog and redacting logger | 4 | CRITICAL | MEDIUM | TASK-404 | NOT STARTED | G0 |
| [TASK-406](phase-04-foundation/TASK-406-money-core.md) | Money core — currency registry, Money type, safe-integer arithmetic, Ratio and rounding helpers | 4 | CRITICAL | MEDIUM | TASK-404, TASK-405 | NOT STARTED | G0 |
| [TASK-407](phase-04-foundation/TASK-407-money-parse-format.md) | Money parsing (`parseAmount`) and display formatting (`formatMoney`, `formatPercent`, spoken form) | 4 | CRITICAL | MEDIUM | TASK-406 | NOT STARTED | G0 |
| [TASK-408](phase-04-foundation/TASK-408-calendar-dates.md) | Calendar date domain — LocalDate, MonthKey, Period, month math, display formatting | 4 | CRITICAL | MEDIUM | TASK-402, TASK-404 | NOT STARTED | G0 |
| [TASK-409](phase-04-foundation/TASK-409-db-adapter-connection.md) | Db adapter interface and expo-sqlite connection with PRAGMAs | 4 | CRITICAL | MEDIUM | TASK-405 | NOT STARTED | G0 |
| [TASK-410](phase-04-foundation/TASK-410-sqlite-test-harness.md) | Real-SQLite test adapter and database test harness | 4 | CRITICAL | MEDIUM | TASK-402, TASK-409 | BLOCKED | OD-19 |
| [TASK-411](phase-04-foundation/TASK-411-migration-runner.md) | Migration runner on `PRAGMA user_version`, pre-migration backup, legacy draft guard, immutability check | 4 | CRITICAL | LARGE | TASK-409, TASK-410 | BLOCKED | OD-14, OD-19 via TASK-410 |
| [TASK-412](phase-04-foundation/TASK-412-baseline-schema-migration.md) | Baseline schema migration 0001 (tables, constraints, triggers, indexes, seed) and constraint test suite | 4 | CRITICAL | LARGE | TASK-411 | BLOCKED | OD-14, OD-06, OD-09, OD-20, OD-11 |
| [TASK-413](phase-04-foundation/TASK-413-repository-foundation.md) | Repository foundation — error wrapping, read guards, row-mapping helpers | 4 | CRITICAL | MEDIUM | TASK-405, TASK-406, TASK-410, TASK-412 | NOT STARTED | G0 |
| [TASK-414](phase-04-foundation/TASK-414-core-stores.md) | Core Zustand stores — `sessionStore`, `revisionStore`, `uiStore` | 4 | HIGH | SMALL | TASK-404, TASK-405, TASK-406 | NOT STARTED | G0 |
| [TASK-415](phase-04-foundation/TASK-415-service-query-hook.md) | `useServiceQuery` — revision-aware, focus-aware, stale-while-revalidate query hook | 4 | HIGH | MEDIUM | TASK-404, TASK-405, TASK-414 | NOT STARTED | G0 |
| [TASK-416](phase-04-foundation/TASK-416-theme-tokens.md) | Theme tokens (light/dark, typography, spacing, category palette) and theme-preference resolution | 4 | HIGH | MEDIUM | TASK-414 | NOT STARTED | G0 |
| [TASK-417](phase-04-foundation/TASK-417-layout-action-primitives.md) | Layout & action primitives (`Screen`, `AppHeader`, `Card`, buttons, `FAB`, `Icon`, `CategoryIcon`) and the accessibility test helper | 4 | HIGH | MEDIUM | TASK-416 | NOT STARTED | G0 |
| [TASK-418](phase-04-foundation/TASK-418-feedback-primitives.md) | Feedback primitives — `Skeleton`, `EmptyState`, `ErrorState`, `ConfirmationDialog`, `FormErrorBanner`, `Toast` | 4 | HIGH | MEDIUM | TASK-405, TASK-414, TASK-417 | NOT STARTED | G0 |
| [TASK-419](phase-04-foundation/TASK-419-value-display-primitives.md) | Value display primitives — `MoneyText`, `PercentText`, `StatusBadge`, `ProgressBar`, `Chip`, `SegmentedControl` | 4 | HIGH | MEDIUM | TASK-407, TASK-417 | NOT STARTED | G0 |
| [TASK-420](phase-04-foundation/TASK-420-route-skeleton-navigation.md) | Route skeleton — root Stack, `(tabs)` group with five NativeTabs, not-found route, route-param validation helper | 4 | CRITICAL | MEDIUM | TASK-417, TASK-418 | BLOCKED | OD-02, OD-13 |
| [TASK-421](phase-04-foundation/TASK-421-database-gate-startup.md) | DatabaseGate — splash-held startup, migration, error screen, app-lifecycle hooks | 4 | CRITICAL | MEDIUM | TASK-411, TASK-412, TASK-414, TASK-418, TASK-420 | BLOCKED | DG-11; DG-02 for the diagnostic section only |
| [TASK-422](phase-04-foundation/TASK-422-profile-onboarding.md) | Profile repository, onboarding service and onboarding screen with first-launch guard | 4 | CRITICAL | MEDIUM | TASK-412, TASK-413, TASK-414, TASK-415, TASK-419, TASK-421 | NOT STARTED | G0 |
| [TASK-423](phase-04-foundation/TASK-423-retire-draft-implementation.md) | Retire the draft implementation (`appStore`, `src/db`, `utils/money`, draft components) and update CLAUDE.md | 4 | HIGH | SMALL | TASK-420, TASK-421, TASK-422 | NOT STARTED | G0 |
| [TASK-424](phase-04-foundation/TASK-424-phase-4-verification.md) | Phase 4 foundation verification checkpoint | 4 | HIGH | SMALL | TASK-401, TASK-402, TASK-404, TASK-405, TASK-406, TASK-407, TASK-408, TASK-409, TASK-410, TASK-411, TASK-412, TASK-413, TASK-414, TASK-415, TASK-416, TASK-417, TASK-418, TASK-419, TASK-420, TASK-421, TASK-422, TASK-423 | NOT STARTED | G0 |

### Phase 5 — Transactions

| Task ID | Task Name | Phase | Priority | Complexity | Dependencies | Status | Gate / blocker |
|---|---|---|---|---|---|---|---|
| [TASK-501](phase-05-transactions/TASK-501-categories-payment-methods.md) | Category & payment-method domain types and read-only repositories (incl. last-used payment method) | 5 | CRITICAL | MEDIUM | TASK-412, TASK-413 | NOT STARTED | G0 |
| [TASK-502](phase-05-transactions/TASK-502-transaction-domain-validation.md) | Transaction domain model and Zod validation schema (FR-003A) | 5 | CRITICAL | MEDIUM | TASK-405, TASK-407, TASK-408, TASK-501 | BLOCKED | OD-12 |
| [TASK-503](phase-05-transactions/TASK-503-transaction-repository-crud.md) | Transaction repository CRUD (idempotent insert, full-replacement update, hard delete) | 5 | CRITICAL | MEDIUM | TASK-412, TASK-413, TASK-502 | NOT STARTED | G0 |
| [TASK-504](phase-05-transactions/TASK-504-transaction-history-query.md) | Transaction history query — keyset pagination, combined filters, note/category search, filtered income/expense summary | 5 | HIGH | MEDIUM | TASK-503, TASK-408 | BLOCKED | DG-03 |
| [TASK-505](phase-05-transactions/TASK-505-transaction-service.md) | Transaction service — validated, idempotent, all-or-nothing writes with revision signalling | 5 | CRITICAL | MEDIUM | TASK-414, TASK-422, TASK-501, TASK-502, TASK-503 | NOT STARTED | G0 |
| [TASK-506](phase-05-transactions/TASK-506-input-primitives.md) | Input primitives — `AmountInput`, `DateSelector` (native picker), `SearchBar` | 5 | HIGH | MEDIUM | TASK-407, TASK-408, TASK-417, TASK-419 | BLOCKED | OD-16, OD-12 |
| [TASK-507](phase-05-transactions/TASK-507-transaction-form.md) | `TransactionForm` (React Hook Form + Zod) with `CategoryPicker` and `PaymentMethodPicker` | 5 | CRITICAL | MEDIUM | TASK-418, TASK-419, TASK-501, TASK-502, TASK-506 | NOT STARTED | G0 |
| [TASK-508](phase-05-transactions/TASK-508-add-transaction-workflow.md) | Add expense / add income modal route with editor hook, idempotent save, discard confirmation and toast | 5 | CRITICAL | MEDIUM | TASK-415, TASK-420, TASK-505, TASK-507 | NOT STARTED | G0 |
| [TASK-509](phase-05-transactions/TASK-509-transaction-detail-edit-delete.md) | Transaction detail screen, edit modal and delete with item-naming confirmation | 5 | HIGH | MEDIUM | TASK-505, TASK-507, TASK-508 | NOT STARTED | G0 |
| [TASK-510](phase-05-transactions/TASK-510-transaction-filters.md) | `transactionFilterStore`, filter sheet modal and active-filter chips | 5 | MEDIUM | MEDIUM | TASK-414, TASK-419, TASK-420, TASK-501, TASK-504, TASK-506 | BLOCKED | DG-03 |
| [TASK-511](phase-05-transactions/TASK-511-transaction-history-screen.md) | Transactions tab — grouped, paginated history with search, filter chips, period summary strip and FAB | 5 | HIGH | MEDIUM | TASK-415, TASK-504, TASK-506, TASK-508, TASK-509, TASK-510 | NOT STARTED | G0 |
| [TASK-512](phase-05-transactions/TASK-512-phase-5-integration-checkpoint.md) | Transaction workflow integration tests and Phase 5 verification checkpoint | 5 | HIGH | MEDIUM | TASK-508, TASK-509, TASK-510, TASK-511 | NOT STARTED | G0 |

### Phase 6 — Dashboard & Analytics

| Task ID | Task Name | Phase | Priority | Complexity | Dependencies | Status | Gate / blocker |
|---|---|---|---|---|---|---|---|
| [TASK-601](phase-06-dashboard-analytics/TASK-601-transaction-aggregates.md) | Transaction aggregate queries for totals, category spend, monthly series, history bounds and recent items | 6 | CRITICAL | MEDIUM | TASK-503, TASK-504, TASK-408 | NOT STARTED | G0 |
| [TASK-602](phase-06-dashboard-analytics/TASK-602-period-summary-calculators.md) | Period summary calculators — `calculateTotalIncome/Expenses`, `calculatePeriodSavings`, `calculateSavingsRate`, `calculatePeriodSummary` | 6 | CRITICAL | SMALL | TASK-406, TASK-407 | NOT STARTED | G0 |
| [TASK-603](phase-06-dashboard-analytics/TASK-603-category-distribution.md) | Category distribution calculator (FR-018.1) with exact-sum invariant | 6 | HIGH | SMALL | TASK-406, TASK-501 | NOT STARTED | G0 |
| [TASK-604](phase-06-dashboard-analytics/TASK-604-period-store-picker.md) | `periodStore`, `/period` modal and `PeriodSelector` chip (current / previous / custom range) | 6 | HIGH | MEDIUM | TASK-408, TASK-414, TASK-419, TASK-420, TASK-506 | NOT STARTED | G0 |
| [TASK-605](phase-06-dashboard-analytics/TASK-605-dashboard-summary-service.md) | Dashboard queries — period summary and recent transactions, with hooks | 6 | HIGH | SMALL | TASK-415, TASK-509, TASK-601, TASK-602, TASK-604 | NOT STARTED | G0 |
| [TASK-606](phase-06-dashboard-analytics/TASK-606-dashboard-screen.md) | Home dashboard screen — greeting, period chip, SummaryCard, add buttons, recent transactions, section slots | 6 | HIGH | MEDIUM | TASK-419, TASK-508, TASK-511, TASK-604, TASK-605 | BLOCKED | DG-04, DG-10 |
| [TASK-607](phase-06-dashboard-analytics/TASK-607-reports.md) | Reports tab — income vs expense summary and category distribution with drill-down | 6 | HIGH | MEDIUM | TASK-415, TASK-510, TASK-511, TASK-601, TASK-602, TASK-603, TASK-604 | NOT STARTED | G0 |
| [TASK-608](phase-06-dashboard-analytics/TASK-608-phase-6-integration-checkpoint.md) | Dashboard & reports integration tests and Phase 6 checkpoint | 6 | HIGH | SMALL | TASK-512, TASK-606, TASK-607 | NOT STARTED | G0 |

### Phase 7 — Budgets & Goals

| Task ID | Task Name | Phase | Priority | Complexity | Dependencies | Status | Gate / blocker |
|---|---|---|---|---|---|---|---|
| [TASK-701](phase-07-budget-savings/TASK-701-budget-domain.md) | Budget domain — `evaluateBudget` (utilization, status, remaining/overspent), severity ordering, budget types | 7 | CRITICAL | SMALL | TASK-406, TASK-407 | NOT STARTED | G0 |
| [TASK-702](phase-07-budget-savings/TASK-702-budget-repository.md) | Budget repository — set/change, remove, resolve-in-effect, history | 7 | CRITICAL | MEDIUM | TASK-408, TASK-412, TASK-413, TASK-701 | BLOCKED | OD-10 |
| [TASK-703](phase-07-budget-savings/TASK-703-budget-service.md) | Budget service — month statuses, set/remove, detail with contributing transactions | 7 | HIGH | MEDIUM | TASK-415, TASK-504, TASK-601, TASK-701, TASK-702 | NOT STARTED | G0 |
| [TASK-704](phase-07-budget-savings/TASK-704-budget-form.md) | `/budgets/edit` modal — create or change the monthly total budget or a category budget | 7 | HIGH | MEDIUM | TASK-418, TASK-506, TASK-507, TASK-703 | NOT STARTED | G0 |
| [TASK-705](phase-07-budget-savings/TASK-705-budgets-tab-screen.md) | Budgets tab — month stepper, overall card, category list, `BudgetProgressCard` | 7 | HIGH | MEDIUM | TASK-415, TASK-419, TASK-420, TASK-703, TASK-704 | BLOCKED | DG-05 |
| [TASK-706](phase-07-budget-savings/TASK-706-budget-detail.md) | `/budgets/[scopeKey]` detail — amount in effect, spending, contributing transactions, history, change/remove | 7 | MEDIUM | MEDIUM | TASK-704, TASK-705 | NOT STARTED | G0 |
| [TASK-707](phase-07-budget-savings/TASK-707-dashboard-budget-section.md) | Dashboard "Budgets" section (overall + up to 3 category budgets) | 7 | HIGH | SMALL | TASK-606, TASK-705 | NOT STARTED | G0 |
| [TASK-708](phase-07-budget-savings/TASK-708-goal-progress-required-saving.md) | `calculateGoalProgress` and `calculateRequiredMonthlySaving` (FR-009, FR-010) | 7 | CRITICAL | SMALL | TASK-406, TASK-407, TASK-408 | NOT STARTED | G0 |
| [TASK-709](phase-07-budget-savings/TASK-709-goal-tracking-projection-gap.md) | `calculateExpectedMonthlySaving`, `calculateGoalTracking` (state + projection), `calculateSavingsGap` | 7 | CRITICAL | LARGE | TASK-602, TASK-708 | BLOCKED | OD-03, OD-04, OD-05 |
| [TASK-710](phase-07-budget-savings/TASK-710-goal-schema-repository.md) | Goal Zod schemas (create, edit, saved amount) and `goalsRepo` (CRUD, lifecycle, saved amount + optional history event) | 7 | CRITICAL | MEDIUM | TASK-407, TASK-408, TASK-412, TASK-413, TASK-708 | BLOCKED | OD-06, OD-09 |
| [TASK-711](phase-07-budget-savings/TASK-711-goal-service.md) | Goal service — create, edit, saved amount, lifecycle, delete, goals with tracking, goal detail | 7 | HIGH | MEDIUM | TASK-415, TASK-422, TASK-601, TASK-709, TASK-710 | NOT STARTED | G0 |
| [TASK-712](phase-07-budget-savings/TASK-712-goal-forms.md) | `/goals/new` and `/goals/[id]/edit` modals with live required-saving preview | 7 | HIGH | MEDIUM | TASK-418, TASK-419, TASK-506, TASK-711 | NOT STARTED | G0 |
| [TASK-713](phase-07-budget-savings/TASK-713-goals-overview.md) | Goals tab — lifecycle segments, portfolio header, `GoalProgressCard` | 7 | HIGH | MEDIUM | TASK-415, TASK-419, TASK-420, TASK-711, TASK-712 | NOT STARTED | G0 |
| [TASK-714](phase-07-budget-savings/TASK-714-goal-detail-saved-amount.md) | `/goals/[id]` detail with tracking explanation and projection; `/goals/[id]/saved-amount` modal; pause/resume, archive/unarchive, delete | 7 | HIGH | MEDIUM | TASK-712, TASK-713 | BLOCKED | OD-21 |
| [TASK-715](phase-07-budget-savings/TASK-715-dashboard-goals-section.md) | Dashboard "Goals" section (up to 3 active goals) | 7 | MEDIUM | SMALL | TASK-707, TASK-713, TASK-714 | NOT STARTED | G0 |
| [TASK-716](phase-07-budget-savings/TASK-716-phase-7-integration-checkpoint.md) | Budget and goal workflow integration tests and Phase 7 checkpoint | 7 | HIGH | MEDIUM | TASK-608, TASK-704, TASK-705, TASK-706, TASK-707, TASK-712, TASK-713, TASK-714, TASK-715 | NOT STARTED | G0 |

### Phase 8 — Recommendations

| Task ID | Task Name | Phase | Priority | Complexity | Dependencies | Status | Gate / blocker |
|---|---|---|---|---|---|---|---|
| [TASK-801](phase-08-recommendations/TASK-801-recommendation-model.md) | Recommendation domain model — `Recommendation`, `Metric`, `Notice`, rule IDs, thresholds, deterministic key | 8 | CRITICAL | SMALL | TASK-406, TASK-408, TASK-701 | NOT STARTED | G0 |
| [TASK-802](phase-08-recommendations/TASK-802-historical-spending-analysis.md) | `calculateCategoryAverage`, `calculateDeviation`/excess, `calculateHistoryMonths` | 8 | CRITICAL | MEDIUM | TASK-406, TASK-408 | BLOCKED | OD-22 |
| [TASK-803](phase-08-recommendations/TASK-803-engine-pipeline-ranking.md) | `runEngine` pipeline — context (stage 1), rule registry (stage 2), ranking (stage 4), render (stage 5) | 8 | CRITICAL | MEDIUM | TASK-701, TASK-709, TASK-801, TASK-802 | NOT STARTED | G0 |
| [TASK-804](phase-08-recommendations/TASK-804-budget-rules.md) | Rules `BUD-OVER` and `BUD-WARN` | 8 | HIGH | MEDIUM | TASK-803 | NOT STARTED | G0 |
| [TASK-805](phase-08-recommendations/TASK-805-anomaly-rules.md) | Rules `ANOM-DISC` (discretionary suggestion with potential savings) and `ANOM-INFO` (essential/unclassified insight) | 8 | HIGH | MEDIUM | TASK-803 | NOT STARTED | G0 |
| [TASK-806](phase-08-recommendations/TASK-806-savings-gap-rules.md) | Rules `GAP` (savings gap suggestion — also covers "goal at risk") and `GAP-INFO` (required saving fact) | 8 | HIGH | MEDIUM | TASK-803 | NOT STARTED | G0 |
| [TASK-807](phase-08-recommendations/TASK-807-merge-suppression-safety.md) | `mergeAndSuppress`, cross-rule adjustments, notices, banned-phrase and determinism tests | 8 | HIGH | MEDIUM | TASK-804, TASK-805, TASK-806 | NOT STARTED | G0 |
| [TASK-808](phase-08-recommendations/TASK-808-recommendation-service.md) | `loadRecommendationInput` (≤ 5 aggregate queries), `recommendationService.evaluate`, `useRecommendations` | 8 | HIGH | MEDIUM | TASK-415, TASK-501, TASK-601, TASK-702, TASK-710, TASK-807 | NOT STARTED | G0 |
| [TASK-809](phase-08-recommendations/TASK-809-recommendation-ui.md) | `RecommendationCard`, `NoticeCard`, `/recommendations` list and `/recommendations/[key]` detail | 8 | HIGH | MEDIUM | TASK-418, TASK-419, TASK-420, TASK-808 | NOT STARTED | G0 |
| [TASK-810](phase-08-recommendations/TASK-810-dashboard-recommendations-section.md) | Dashboard "Suggestions" section — top 3 recommendations or notices | 8 | HIGH | SMALL | TASK-715, TASK-809 | NOT STARTED | G0 |
| [TASK-811](phase-08-recommendations/TASK-811-phase-8-integration-checkpoint.md) | Recommendation workflow integration tests and Phase 8 checkpoint (MVP feature-complete gate) | 8 | HIGH | MEDIUM | TASK-716, TASK-810 | NOT STARTED | G0 |

### Phase 9 — Security & Release

| Task ID | Task Name | Phase | Priority | Complexity | Dependencies | Status | Gate / blocker |
|---|---|---|---|---|---|---|---|
| [TASK-901](phase-09-security-release/TASK-901-settings-profile-appearance.md) | `/settings` hub, profile name screen, appearance (theme) screen, Home header gear | 9 | HIGH | MEDIUM | TASK-416, TASK-420, TASK-422, TASK-606, TASK-810 | NOT STARTED | G0 |
| [TASK-902](phase-09-security-release/TASK-902-currency-setting-lock.md) | `/settings/currency` with FR-001.4 currency lock (service + UI) | 9 | HIGH | MEDIUM | TASK-601, TASK-702, TASK-710, TASK-901 | NOT STARTED | G0 |
| [TASK-903](phase-09-security-release/TASK-903-privacy-about.md) | `/settings/privacy` (NFR-004.2 text) and `/settings/about` (version, licences, not-financial-advice) | 9 | HIGH | SMALL | TASK-901 | BLOCKED | OD-21, DG-06; OD-15 for one sentence |
| [TASK-904](phase-09-security-release/TASK-904-delete-all-data.md) | Delete All Data — single-transaction wipe, VACUUM, backup/export cleanup, two-step confirmation, reset to onboarding | 9 | CRITICAL | MEDIUM | TASK-411, TASK-421, TASK-901, TASK-902, TASK-906 | NOT STARTED | G0 |
| [TASK-905](phase-09-security-release/TASK-905-export-schema-builder.md) | Export format (Zod schema, `formatVersion` 1) and consistent snapshot builder | 9 | HIGH | MEDIUM | TASK-412, TASK-413, TASK-501, TASK-503, TASK-702, TASK-710 | NOT STARTED | G0 |
| [TASK-906](phase-09-security-release/TASK-906-export-share-flow.md) | `/settings/export` — unencrypted-file warning, write to cache, OS share sheet, temp-file cleanup | 9 | HIGH | MEDIUM | TASK-901, TASK-905 | BLOCKED | OD-16 |
| [TASK-907](phase-09-security-release/TASK-907-android-backup-exclusion.md) | Android `allowBackup: false` and backup verification | 9 | HIGH | SMALL | TASK-421 | BLOCKED | OD-15 |
| [TASK-908](phase-09-security-release/TASK-908-ios-backup-exclusion.md) | Local Expo module `modules/backup-exclusion` setting `NSURLIsExcludedFromBackupKey` on database files | 9 | HIGH | MEDIUM | TASK-411, TASK-421 | BLOCKED | OD-15; external: macOS/Xcode |
| [TASK-909](phase-09-security-release/TASK-909-accessibility-audit.md) | Accessibility audit (automated tree checks + TalkBack/VoiceOver + largest font) and remediation | 9 | HIGH | MEDIUM | TASK-811, TASK-902, TASK-903, TASK-904, TASK-906 | NOT STARTED | G0 |
| [TASK-910](phase-09-security-release/TASK-910-performance-validation.md) | NFR-001 performance measurement on the reference Android device, with targeted optimisation if needed | 9 | HIGH | MEDIUM | TASK-811 | BLOCKED | OD-18, DG-12 |
| [TASK-911](phase-09-security-release/TASK-911-migration-upgrade-verification.md) | On-device verification of fresh install, in-place upgrade, legacy draft guard and failure behaviour | 9 | CRITICAL | MEDIUM | TASK-411, TASK-412, TASK-421, TASK-424 | NOT STARTED | G0 |
| [TASK-912](phase-09-security-release/TASK-912-android-device-verification.md) | Android release-candidate verification on emulators and a physical device | 9 | HIGH | MEDIUM | TASK-904, TASK-906, TASK-907, TASK-909, TASK-910, TASK-911 | NOT STARTED | G0 |
| [TASK-913](phase-09-security-release/TASK-913-ios-device-verification.md) | iOS verification on simulator/device (VoiceOver, Dynamic Type, dark mode, backup exclusion) | 9 | MEDIUM | MEDIUM | TASK-908, TASK-909 | BLOCKED | external: macOS / Apple account; OD-15 via TASK-908 |
| [TASK-914](phase-09-security-release/TASK-914-release-configuration.md) | Release configuration — app metadata, permissions review, EAS production profile, store data-safety declarations | 9 | HIGH | SMALL | TASK-403, TASK-907 | BLOCKED | DG-07 |
| [TASK-915](phase-09-security-release/TASK-915-production-builds.md) | Android production build and iOS production build via EAS | 9 | HIGH | MEDIUM | TASK-912, TASK-913, TASK-914 | BLOCKED | external: credentials/accounts |
| [TASK-916](phase-09-security-release/TASK-916-release-documentation.md) | README, CHANGELOG, release notes, test summary, project-context and stale-document clean-up | 9 | MEDIUM | SMALL | TASK-903, TASK-914 | NOT STARTED | G0 |
| [TASK-917](phase-09-security-release/TASK-917-final-regression-release-readiness.md) | Critical-flow regression suite and release-readiness review | 9 | CRITICAL | MEDIUM | TASK-911, TASK-912, TASK-913, TASK-915, TASK-916 | BLOCKED | DG-09 for the automated variant |
<!--/ROWS-->

## Deferred backlog (reserved IDs)

These IDs are reserved so the numbering stays stable. They have **no task document** because the PRS marks the work MVP+ or Deferred and requires its own specification first ([deferred-backlog.md](deferred-backlog.md)).

| Task ID | Task Name | Phase | Priority | Dependencies | Status |
|---|---|---|---|---|---|
| TASK-590 | Recurring transaction schedules (FR-020) | 5 | — | FR-020 specification | DEFERRED |
| TASK-591 | Custom category management (FR-004 MVP+) | 5 | — | MVP+ approval | DEFERRED |
| TASK-690 | Trend and history reports (FR-018.2) | 6 | — | MVP+ approval; OD-09 for goal history | DEFERRED |
| TASK-890 | `GOAL-EXPIRED` recommendation (OD-08) | 8 | — | OD-08 approval | DEFERRED |
| TASK-891 | Recurring expense analysis / `RECUR-HIGH` | 8 | — | TASK-590 | DEFERRED |
| TASK-990 | App lock, biometrics, privacy cover (FR-025 MVP+) | 9 | — | App-lock specification | DEFERRED |
| TASK-991 | Database encryption (SQLCipher) | 9 | — | Encryption specification (ADR-0012) | DEFERRED |
| TASK-992 | CSV export (FR-022.3) | 9 | — | MVP+ approval | DEFERRED |
| TASK-993 | JSON restore and backup validation (FR-023) | 9 | — | Restore specification | DEFERRED |
| TASK-994 | Local notifications (FR-021) | 9 | — | Notification specification | DEFERRED |

## Change history

| Date | Change | Reason |
|---|---|---|
| 2026-11-06 | Registry created (Phase 3, provisional) | Initial plan |
