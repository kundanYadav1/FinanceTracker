# Agent Execution Guide

How an AI coding agent picks up, executes, verifies and reports one task from this plan. This guide applies in addition to `../AGENTS.md` (workspace) and `./AGENTS.md` (project); where they conflict, AGENTS.md wins and the conflict is reported.

> **Current state: execution gate G0 is closed.** Until the registry banner says otherwise, an agent must not start any task. It may only answer questions about the plan.

## 1. Inputs an agent must read (in order)

1. `AGENTS.md` (workspace root and project) — process, financial-data, privacy and testing rules.
2. `docs/requirements/product-requirements.md` — only the sections in the task's **PRS References**.
3. `docs/design/*` — only the sections in the task's **Design References** (abbreviations: SA, DB, NAV, UX, BL, RE, ST, SEC, TS, DEP, OD) and any ADR listed.
4. The task document itself — fully.
5. `docs/tasks/design-gaps.md` and `docs/design/open-decisions.md` entries named in the task banner/status.
6. The current repository state of every file in the task's **Files to Create or Modify** table and their direct imports.

Do not read unrelated design sections; do not skip the referenced ones.

## 2. Execution workflow

| Step | Action | Output |
|---|---|---|
| 1 | Read AGENTS.md | — |
| 2 | Read the referenced PRS sections | — |
| 3 | Read the referenced design sections/ADRs | — |
| 4 | Read the task document | — |
| 5 | Inspect the repository (files to change, their imports, existing tests) | Notes on current state |
| 6 | **Verify gates and dependencies:** G0 open; task status is `NOT STARTED` (not `BLOCKED`); every task in **Dependencies** is `DONE` in the registry; every OD/DG named in the status is resolved | Go / stop |
| 7 | Set status `IN PROGRESS` (registry + task file) | Status change |
| 8 | Implement **only** the task's Included scope, following its Implementation Instructions | Code + tests |
| 9 | Run the task's Verification Commands plus the global set (`npm test`, `npx tsc --noEmit`, `npx expo lint`; `npx expo-doctor` if dependencies/config changed) | Command results |
| 10 | Check every Acceptance Criteria box with evidence | Checked list |
| 11 | Set status `DONE` (or `BLOCKED`) and write the completion report (§7) | Report |

## 3. Pre-flight checklist (step 6)

- [ ] Registry banner shows G0 passed.
- [ ] Task status is `NOT STARTED`.
- [ ] All dependency tasks are `DONE` (check the registry, not memory).
- [ ] All OD-xx / DG-xx named in the task's banner or status line are recorded as resolved (in `open-decisions.md` / `design-gaps.md`), and the resolution matches what the task assumes.
- [ ] No other agent has the task, or a task sharing a non-append-only file with it, `IN PROGRESS` ([dependency-graph §6](dependency-graph.md#6-parallelizable-groups)).
- [ ] The working tree is clean or contains only this task's changes.

If any box fails, do not start. Report which one.

## 4. Status transitions

```text
NOT STARTED ──start──▶ IN PROGRESS ──all criteria verified──▶ DONE
     │                     │
     │                     └──gap / failing dependency / design conflict──▶ BLOCKED ──resolved──▶ IN PROGRESS
     └──descoped by PO──▶ DEFERRED
BLOCKED (planned) ──decision recorded──▶ NOT STARTED
```

- Update **both** the registry row and the task file's `Status` line in the same commit.
- `DONE` requires the Definition of Done (§6). Never mark DONE without executed tests.
- `DONE` is never reverted silently. A defect found later gets a **new** task or a reopened task with a change-log entry (§8).

## 5. Restrictions and stop conditions

An executing agent must not:

- start a task whose gate, dependencies or named decisions are unresolved;
- implement anything outside the task's Included scope, or anything listed as Excluded;
- add dependencies not named in the task (and named ones only via `npx expo install` for Expo packages);
- change architecture, layer rules, schema of an applied migration, navigation structure, state ownership, money representation, financial formulas, thresholds or recommendation rules;
- edit `docs/requirements/*`, `docs/design/*`, ADRs, or `AGENTS.md` (propose instead);
- modify another task's implementation without a documented reason in the completion report;
- weaken lint rules, coverage gates or tests to make a task pass;
- log or put financial data in fixtures beyond synthetic values;
- declare a phase complete after finishing one task (only checkpoint tasks 424/512/608/716/811/917 close phases, and only with evidence).

**Stop and report** (status → `BLOCKED`) when:

1. the task requires a decision the design does not make (a design gap);
2. the design and existing code or another task conflict;
3. a spike in the task fails its stop condition (TASK-410, TASK-908);
4. a dependency turns out not to provide what the task assumes;
5. a fix would change product behaviour or architecture.

Gap report format: *Gap* (what is missing) · *Where found* (file/section) · *Technical impact* · *Smallest proposed correction* · *Who must approve* (PO for product behaviour, tech lead for technical). Wait for approval when the change affects product behaviour or architecture.

## 6. Definition of Done (global)

A task is DONE only when all of the following hold (AGENTS.md §21 plus plan rules):

1. Every Requirement and Acceptance Criterion in the task is satisfied and individually checked with evidence.
2. Only files in the task's table (or a documented, justified addition) were created/modified/deleted.
3. Required tests per the [testing-matrix](testing-matrix.md) row exist and pass; no existing test was weakened or deleted without a recorded reason.
4. `npm test`, `npx tsc --noEmit`, `npx expo lint` pass; `npx expo-doctor` passes when dependencies or config changed; `npm run test:tz` passes for domain/date-related tasks; coverage gates hold.
5. Manual device checks listed under the task's Manual Verification were performed and recorded (or explicitly marked "not performed" with reason — which keeps the task out of DONE unless the criterion is optional).
6. No financial data appears in logs, error messages or fixtures (sentinel tests where the task specifies them).
7. Task-specific DoD items in section 11 of the task file are met.
8. Registry and task status updated; completion report written.
9. Committed with a conventional commit message referencing the task ID, e.g. `feat(transactions): add transaction service (TASK-505)`.

## 7. Completion report format

```markdown
## Completion report — TASK-XXX

**Status:** DONE | BLOCKED
**Commit(s):** <sha> <message>

### Files created
- path — purpose
### Files modified
- path — what changed
### Files deleted
- path (if any)

### Implementation summary
<3–8 sentences: what was built and any decisions taken within the task's latitude>

### Tests executed
| Command | Result | Notes |
|---|---|---|
| npm test | pass/fail (n passed, m failed) | |
| npx tsc --noEmit | pass/fail | |
| npx expo lint | pass/fail | |
| npx expo-doctor | pass/fail/not run (reason) | |
| task-specific commands | | |

### Tests passed / failed
<counts; list every failure with cause>

### Manual verification
<device, OS, build type, steps, result — or "not required">

### Acceptance criteria
- [x] criterion — evidence
- [ ] criterion — why not met

### Known issues
### Remaining work / follow-up tasks
### Design gaps or conflicts raised (if any)
```

Never claim a command passed that was not run.

## 8. Change management

The plan evolves; history is never deleted.

| Situation | Procedure |
|---|---|
| **New requirement** | Must go through SPEC → DESIGN first. After approval, add new task(s) with the next unused ID in the phase range; update registry, dependency graph, implementation and testing matrices. |
| **Changed requirement** | Identify affected tasks via the implementation matrix. For each NOT STARTED task: edit Requirements/Acceptance Criteria and add a *Change log* section at the end of the task file (date, change, reason, approver). For DONE tasks: create a follow-up task; do not rewrite the DONE task. |
| **Removed feature** | Set affected NOT STARTED tasks to `DEFERRED` with reason; keep files. DONE work removal needs its own task. |
| **New technical constraint** | Record in `design-gaps.md` (new DG-xx) → approval → update affected tasks with a change-log entry. |
| **Database design revision** | Never edit an applied migration. Add a new migration task (next ID) with migration tests and on-device verification (extend TASK-911). |
| **Dependency change between tasks** | Edit the `Dependencies` field only; regenerate `Blocks` fields, registry and graphs, and re-run the cycle check (procedure in [phase-3-review §6](phase-3-review.md#6-how-consistency-was-verified)). |
| **Blocked task** | Status `BLOCKED (reason)` in registry and file; record the blocker in the completion report; the planner decides re-sequencing. |
| **Task needs splitting** | Original ID keeps the first part (scope narrowed, change-logged). New parts get new IDs; dependencies updated. |
| **Tasks need merging** | Keep the lower ID; the other becomes `DEFERRED` with "Merged into TASK-xxx". |
| **Renumbering** | Never. IDs are stable; retired IDs are not reused. |

Every change to a task file adds a *Change log* table at its end:

```markdown
## Change log
| Date | Change | Reason | Approved by |
|---|---|---|---|
```

## 9. Context management

- Each task lists the exact PRS and design sections needed; agents should not load the whole design set.
- Checkpoint tasks may read all phase tasks' completion reports instead of re-deriving their work.
- If a task file is insufficient to implement without guessing, that is a design gap (§5), not an invitation to improvise.
