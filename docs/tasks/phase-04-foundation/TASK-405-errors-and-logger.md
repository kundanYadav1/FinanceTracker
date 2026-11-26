# TASK-405 — Error taxonomy, message catalog and redacting logger

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-405
- **Task Name:** Error taxonomy, user-message catalog and redacting logger
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.2 Shared core library
- **Priority:** CRITICAL
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-404
- **Blocks:** TASK-406, TASK-409, TASK-413, TASK-414, TASK-415, TASK-418, TASK-424, TASK-502
- **PRS References:** FR-003A.9, FR-027.1, FR-027.2, FR-027.3, §35, §4.4
- **Design References:** SA §E.1 (taxonomy), SA §E.2 (propagation), SA §E.3 (catalog), BL §0 (`UnavailableReason`), BL §A.2 (validation codes), SEC §4 (logging), SEC §8

## 1. Objective

Implement the complete `AppError` hierarchy, the full error-code and user-message catalog defined in the design, the plain-language reason catalog for unavailable values, and the single redacting logger.

## 2. Background and Context

SA §E.1 defines seven error classes and SA §E.3 the message catalog. FR-027.3 forbids amounts, notes or other financial details in user messages and logs. Creating the **whole** catalog here (every code named in SA §E, BL §A.2, BL §0 and RE §C.8) means later tasks import codes but never edit this file, which removes a merge-conflict hotspot.

## 3. Requirements

1. `AppError` base with `code: ErrorCode`, `kind`, `cause?: unknown`, `context?: Record<string, string | number | boolean>`. Subclasses: `ValidationError`, `BusinessRuleError`, `NotFoundError`, `PersistenceError`, `DatabaseUnavailableError`, `IntegrityError`, `UnexpectedError`.
2. `ErrorCode` is a string-literal union containing every code in SA §E.1, SA §E.3, BL §A.2 (`AMOUNT_REQUIRED`, `AMOUNT_INVALID_CHARACTERS`, `AMOUNT_COMMA_DECIMAL`, `AMOUNT_TOO_MANY_DECIMALS`, `AMOUNT_NOT_POSITIVE`, `AMOUNT_ABOVE_MAX`, `CATEGORY_REQUIRED`, `PAYMENT_METHOD_REQUIRED`, `DATE_INVALID`, `DATE_IN_FUTURE`, `DATE_TOO_EARLY`, `NOTE_TOO_LONG`), goal/budget validation codes needed by FR-003A.7/.8 (`GOAL_NAME_REQUIRED`, `GOAL_NAME_TOO_LONG`, `GOAL_TARGET_NOT_POSITIVE`, `GOAL_TARGET_DATE_PAST`, `BUDGET_AMOUNT_NEGATIVE`, `SAVED_AMOUNT_NEGATIVE`), business codes (`CURRENCY_LOCKED`, `CURRENCY_NOT_SET`, `CATEGORY_TYPE_MISMATCH`), not-found codes, persistence codes (`DB_WRITE_FAILED`, `DB_READ_FAILED`, `DB_CONSTRAINT`, `DB_FULL`), startup codes (`DB_OPEN_FAILED`, `DB_MIGRATION_FAILED`, `DB_SCHEMA_NEWER`, `LEGACY_DATA_PRESENT`), integrity codes (`UNSAFE_INTEGER`, `UNKNOWN_CURRENCY`, `CURRENCY_MISMATCH`), `UNEXPECTED`, and `CUSTOM_RANGE_INVALID` (BL §C.7).
3. `messages.ts`: `messageFor(code, { fieldLabel?, entity? })` returns plain English (§4.4). Templates may interpolate **field labels and entity nouns only** ("expense", "budget"), never values. The `DB_WRITE_FAILED` create/update wording follows SA §E.3 and FR-027.1 ("…was not saved. Your entries are still here").
4. `domain/format/reasons.ts`: `UnavailableReason` union (BL §0) and `reasonText(reason)` with the sentences used in BL §B (e.g. `NO_INCOME` → "No income recorded for this period").
5. `shared/lib/logger.ts`: `logger.error(err)`, `logger.warn(event, meta)`, `logger.info(event, meta)`. Accepts only `{ event, code, op, entity, sqliteCode, schemaVersion }` keys (typed). In release builds (`!__DEV__`) only `error` emits, code-only. It is the only file allowed to call `console`.
6. The logger never serialises `cause` objects or SQL parameters; it logs `cause.name`/`code` only.

## 4. Scope

### Included
- Error classes, codes, messages, reasons, logger, tests.

### Excluded
- Repository error wrapping (TASK-413). Sentinel tests over services (each service task adds its own; TASK-505 provides the reusable helper).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/errors/AppError.ts` | CREATE *(proposed path)* | Base + subclasses |
| `src/domain/errors/codes.ts` | CREATE *(proposed path)* | `ErrorCode` union |
| `src/domain/errors/messages.ts` | CREATE | User message catalog (SA §E.3) |
| `src/domain/errors/index.ts` | CREATE | Public exports |
| `src/domain/format/reasons.ts` | CREATE | Unavailable-reason texts (BL §0) |
| `src/shared/lib/logger.ts` | CREATE | Redacting logger |
| `src/domain/errors/errors.test.ts`, `src/shared/lib/logger.test.ts` | CREATE | Unit tests |

## 6. Implementation Instructions

1. Use plain classes extending `Error` with `Object.setPrototypeOf` for Hermes `instanceof` safety.
2. Make `messages.ts` an exhaustive `Record<ErrorCode, …>` so TypeScript fails if a code lacks a message.
3. For the logger, define `type LogMeta = Partial<Record<'event'|'code'|'op'|'entity'|'sqliteCode'|'schemaVersion', string|number>>`.
4. Add a test that every message template contains no `{amount}`-style placeholder and no digits other than the fixed limit text in `AMOUNT_ABOVE_MAX`.

## 7. Dependencies

- TASK-404: `Result` type is referenced by error helpers.

## 8. Acceptance Criteria

- [ ] Every code listed in §3.2 exists and has a message (compile-time exhaustive).
- [ ] `messageFor('DATE_IN_FUTURE')` returns "Date can't be later than today."
- [ ] Logger called with a meta object containing an unexpected key fails type-check.
- [ ] Logger output for an error with a `cause` containing `987654321` and `SENTINEL_NOTE` contains neither string.
- [ ] `console` is referenced only in `logger.ts` (lint).

## 9. Testing Requirements

- **Unit Tests:** class hierarchy and `instanceof`; catalog exhaustiveness; reason texts; logger redaction with sentinel values; release-mode suppression (mock `__DEV__ = false`).
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** not required.

## 10. Verification Commands

```bash
npx jest src/domain/errors src/shared/lib/logger
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: no later task needs to add an error code for any behaviour described in the current design.

## 12. Risks and Notes

- If a later task finds a missing code, it adds it through a documented change (agent guide §8) rather than inventing ad-hoc strings.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
