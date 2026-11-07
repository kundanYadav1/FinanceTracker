# TASK-710 — Goal validation schemas and goals repository

> **PROVISIONAL / BLOCKED** — priority values [OD-06](../../design/open-decisions.md#od-06); saved-amount history [OD-09](../../design/open-decisions.md#od-09).

## Task Metadata

- **Task ID:** TASK-710
- **Task Name:** Goal Zod schemas (create, edit, saved amount) and `goalsRepo` (CRUD, lifecycle, saved amount + optional history event)
- **Implementation Phase:** 7 — Budgets & Savings Goals
- **Feature:** F7.5 Savings goal management
- **Priority:** CRITICAL
- **Status:** BLOCKED (OD-06, OD-09)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-407, TASK-408, TASK-412, TASK-413, TASK-708
- **Blocks:** TASK-711, TASK-808, TASK-902, TASK-905
- **PRS References:** FR-003A.7, FR-003A.9, FR-009, FR-009.1, FR-009.2, FR-026.1, FR-026.3
- **Design References:** DB §B.7, DB §B.8 (OD-09), DB §G, BL §C.10, UX §E (form fields), TS §2

## 1. Objective

Validate goal input and persist goals, including user-maintained saved amount and lifecycle status, without ever storing tracking state.

## 2. Background and Context

FR-009.1: saved amount is user-entered, may go up or down, never negative. FR-009.2: lifecycle Active/Paused/Archived is user-set; tracking state is computed (never stored). Target date ≥ today at creation and whenever changed (BL §C.10).

## 3. Requirements

1. Schemas (`domain/goals/schema.ts`): create `{ name (trim, 1–60), targetText (> 0), savedText (≥ 0, optional default 0), targetDate (≥ today), priority }`; edit (same; date ≥ today only if changed); saved amount `{ newTotalText ≥ 0 }`. Error codes from TASK-405 naming the field.
2. `goalsRepo`: `insert`, `getById`, `list({ lifecycle? })` ordered by priority (high→low) then target date then `created_at`, `update` (full replacement of user fields), `updateSavedAmount(id, newAmount, changedOnDate)` — if OD-09 adopted, insert a `goal_balance_events` row in the same transaction; `setLifecycle(id, status)`, `remove(id)` (hard delete; events cascade), `hasAny()`.
3. Initial saved amount on create also writes an event (previous NULL) when OD-09 adopted.

## 4. Scope

### Included
- Schemas, repository, tests.

### Excluded
- Service (TASK-711), UI.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/domain/goals/schema.ts` | CREATE *(proposed path)* | Zod schemas |
| `src/data/repositories/goalsRepo.ts` | CREATE | Repository |
| `src/domain/goals/schema.test.ts`, `src/data/repositories/goalsRepo.test.ts` | CREATE | Tests |

## 6. Implementation Instructions

1. IDs `newId('goal')`, events `newId('gbe')`.

## 7. Dependencies

- TASK-407 (parse), TASK-408 (dates), TASK-412 (table), TASK-413 (helpers), TASK-708 (types).

## 8. Acceptance Criteria

- [ ] Name 0/61 chars rejected; 1/60 accepted (trimmed).
- [ ] Target 0 rejected; saved 0 accepted; negative saved rejected.
- [ ] Target date yesterday rejected on create; unchanged past date accepted on edit; changed to past rejected.
- [ ] Saved-amount update persists; with OD-09 an event row is written atomically.
- [ ] Delete removes the goal (and its events).
- [ ] No column stores tracking state.

## 9. Testing Requirements

- **Unit Tests:** schemas under `test:tz`.
- **Integration Tests (database):** repository.

## 10. Verification Commands

```bash
npx jest src/domain/goals src/data/repositories/goalsRepo
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
