# TASK-505 — Transaction service (save, update, delete, get)

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-505
- **Task Name:** Transaction service — validated, idempotent, all-or-nothing writes with revision signalling
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.2 Transaction core
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-414, TASK-422, TASK-501, TASK-502, TASK-503
- **Blocks:** TASK-508, TASK-509
- **PRS References:** FR-001.1, FR-001.3, FR-002, FR-003, FR-003A, FR-026.3, FR-026.4, FR-027.1, FR-027.3
- **Design References:** SA §B.1 row 2 (services), SA §D.1 – D.3 (lifecycles), SA §E.2 rules 3–4, ST §3.4 (write path), ST §4 rules 1–3, SEC §4 (sentinel test)

## 1. Objective

Implement the use-case layer for transactions: authoritative validation, data-dependent business checks, persistence in one transaction, revision bumps after commit, and error mapping that never leaks financial data.

## 2. Background and Context

SA §D.1 is the reference sequence. Services return `Promise<Result<T, AppError>>`, log once, never throw to the UI (SA §E.2.3). Revisions are bumped only after commit (ST §4.1).

## 3. Requirements

1. `saveNew(draftId, values)`:
   - read profile currency inside the operation; `null` → `BusinessRuleError('CURRENCY_NOT_SET')`;
   - validate with `buildTransactionSchema({ mode:'create', currency, today: clock.today() })`;
   - load category; missing or `category.type !== type` → `CATEGORY_TYPE_MISMATCH`;
   - insert with `id = draftId`; `inserted:false` → still `Ok(id)` (FR-026.4);
   - `revisionStore.bump(['transactions'])` after commit; return `Ok(id)`.
2. `update(id, values)`: load existing (`null` → `NotFoundError('TRANSACTION_NOT_FOUND')`), validate with `mode:'edit', originalDate`, category check, full replacement; `updated:false` → NotFound; bump.
3. `remove(id)`: delete; `deleted:false` → NotFound; bump.
4. `get(id)`: `Result<TransactionDetail, NotFoundError | PersistenceError>`; detail includes category (with spending class) and payment method names.
5. `defaultsForNew(type)`: `{ date: today, paymentMethodId: defaultPaymentMethodId(lastUsed) (expense only), categoryId: null }`.
6. Errors: every caught error → `AppError`, logged once via `logger.error`; unknown → `UnexpectedError`.
7. Reusable test helper `expectNoSensitiveLeak(fn)` *(proposed path `src/shared/lib/testing/sentinel.ts`)* that spies on logger and asserts sentinel values (`987654321`, `SENTINEL_NOTE`) never appear in logs or returned error messages/contexts. Later service tasks reuse it.

## 4. Scope

### Included
- Service, hookable defaults, sentinel helper, integration tests (service + real SQLite).

### Excluded
- UI/hooks (TASK-508/509), list queries (wrapped by TASK-511's hook calling a thin `listPage` service function — add `listPage`/`summarize` pass-throughs here so UI never imports repos).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/transactions/services/transactionService.ts` | CREATE | Use cases |
| `src/features/transactions/index.ts` | CREATE | Public API |
| `src/shared/lib/testing/sentinel.ts` | CREATE *(proposed path)* | Leak-check helper |
| `src/features/transactions/services/transactionService.test.ts` | CREATE | Integration tests |

## 6. Implementation Instructions

1. Services obtain `Db` via `getDb()` but accept an optional injected `db`/`clock` parameter object for tests (TS §0 enablers).
2. Re-read currency inside the write transaction (ST §2 "Selected currency").

## 7. Dependencies

- TASK-414 (revisions), TASK-422 (profile repo), TASK-501 (categories, default method), TASK-502 (schema), TASK-503 (repo).

## 8. Acceptance Criteria

- [ ] Save before onboarding → `CURRENCY_NOT_SET`, nothing stored.
- [ ] Valid expense → one row, `transactions` revision +1.
- [ ] Same `draftId` saved twice → one row, both calls `Ok`.
- [ ] Income with an expense category → `CATEGORY_TYPE_MISMATCH`.
- [ ] Simulated DB failure → `PersistenceError`, no revision bump, nothing stored, message "…was not saved…".
- [ ] Update/delete of a deleted id → `NotFoundError`.
- [ ] Sentinel helper passes for all failure paths.
- [ ] `defaultsForNew('expense')` returns last-used method or `pm_cash`.

## 9. Testing Requirements

- **Unit Tests:** error mapping branches with an adapter double.
- **Integration Tests:** all acceptance items with real SQLite + fixed clock.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/features/transactions/services
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Revision bump inside a failed path would show unsaved data; tests must assert no bump on failure.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
