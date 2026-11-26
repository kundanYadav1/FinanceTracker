# TASK-502 — Transaction domain model and validation schema

> **PROVISIONAL / BLOCKED** — minimum date depends on [OD-12](../../design/open-decisions.md#od-12).

## Task Metadata

- **Task ID:** TASK-502
- **Task Name:** Transaction domain model and Zod validation schema (FR-003A)
- **Implementation Phase:** 5 — Transaction Management
- **Feature:** F5.2 Transaction core
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-12)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-405, TASK-407, TASK-408, TASK-501
- **Blocks:** TASK-503, TASK-505, TASK-507
- **PRS References:** FR-002, FR-002.1, FR-003, FR-003.1, FR-003.2, FR-003A.1 – .6, .9, FR-019.1, FR-019.5
- **Design References:** BL §A.1 (type), BL §A.2 (validation table), BL §A.4 (editing rules), BL §C.8 (edit date rule), SA §D.1 (schema used by form and service), TS §1 "Validation" row

## 1. Objective

Define the `Transaction` type and one validation schema used both by the form resolver (inline errors) and by the service (authoritative re-check), producing the exact error codes and field-naming messages in BL §A.2.

## 2. Background and Context

BL §A.2 lists every rule and code. The same schema serves the form and the service (SA §D.1). A future date is rejected on create and on edit only when the date changed (BL §C.8).

## 3. Requirements

1. `Transaction` type exactly per BL §A.1 (amount as `Money`, `date: LocalDate`, `paymentMethodId: string | null`, `note: string | null`, `isRecurring`, `createdAt`, `updatedAt`).
2. `TransactionFormValues` (strings as typed by the user) and `TransactionDraft` (parsed).
3. `buildTransactionSchema({ currency, today, mode: 'create' | 'edit', originalDate? })` → Zod schema that:
   - parses `amount` with `parseAmount` (TASK-407) and maps its error codes;
   - requires `categoryId` (`CATEGORY_REQUIRED`; message "Choose a category." or "Choose an income source." by type);
   - requires `paymentMethodId` for expense, forces `null` for income (`PAYMENT_METHOD_REQUIRED`);
   - validates date: valid LocalDate (`DATE_INVALID`), `≥ MIN_TRANSACTION_DATE` (`DATE_TOO_EARLY`), `≤ today` on create, and on edit only if `date !== originalDate` (`DATE_IN_FUTURE`);
   - trims note; empty → `null`; > 200 Unicode code points (`[...s].length`) → `NOTE_TOO_LONG`;
   - `isRecurring` boolean, information only (FR-002.1).
4. Category existence and `category.type === type` are **service** checks (need data) → `CATEGORY_TYPE_MISMATCH`; documented here, implemented in TASK-505.
5. Every Zod issue carries `{ code, field }` so the form shows the catalog message naming the field (FR-003A.9).
6. `applyTypeSwitch(values, newType, defaultMethodId)` pure helper: clears category, sets/clears payment method (BL §A.4).

## 4. Scope

### Included
- Types, schema factory, type-switch helper, tests.

### Excluded
- Persistence (TASK-503), service checks (TASK-505), UI (TASK-507).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/transactions/types.ts` | CREATE *(proposed path)* | Transaction types |
| `src/domain/transactions/schema.ts` | CREATE | Zod schema (path named in BL §A.2) |
| `src/domain/transactions/edit.ts` | CREATE *(proposed path)* | `applyTypeSwitch` |
| `src/domain/transactions/index.ts` | CREATE | Exports |
| `src/domain/transactions/schema.test.ts`, `edit.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. Zod v4 + `@hookform/resolvers` v5 (installed). Use `superRefine` for cross-field rules (payment method by type, date-changed rule).
2. One `it.each` row per BL §A.2 table row asserting `code` and that the message contains the field label.

## 7. Dependencies

- TASK-405 (codes/messages), TASK-407 (`parseAmount`), TASK-408 (dates, `MIN_TRANSACTION_DATE`), TASK-501 (`TransactionType`).

## 8. Acceptance Criteria

- [ ] Every BL §A.2 rule produces its code; messages name the field.
- [ ] Note of 200 code points (with emoji counted as 1) accepted; 201 rejected.
- [ ] Future date rejected on create; accepted on edit when unchanged; rejected on edit when changed to a future date.
- [ ] `1999-12-31` rejected with `DATE_TOO_EARLY` (if OD-12 keeps 2000-01-01).
- [ ] Income with a payment method → value coerced to `null`; expense without one → `PAYMENT_METHOD_REQUIRED`.
- [ ] Domain coverage ≥ 95 %.

## 9. Testing Requirements

- **Unit Tests:** all acceptance items; run under `test:tz`.
- **Integration Tests:** via TASK-505.
- **UI Tests:** via TASK-507.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/transactions
npm run test:tz
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- Zod 4 error-map APIs differ from Zod 3; check installed version docs before implementing custom issues.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
