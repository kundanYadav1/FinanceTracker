# Phase 3 — Task Planning Review and Report

**Date:** 2026-11-06 · **Reviewer:** Phase 3 planning agent · **Result:** **TASK PLANNING BLOCKED** (plan fully drafted; mandatory approvals missing — see §1)

## 1. Approval gate check

| Gate item | Required | Found | Result |
|---|---|---|---|
| Phase 1 PRS approved | Approved PRS | PRS v1.1 header: "Revised draft v1.1 — product decisions accepted, **pending final SPEC re-review**"; OD-01 marks this a **Blocker** | ❌ Not approved |
| Phase 2 system design approved | Approved design | All 11 `docs/design/*` documents: "Status: **Provisional** (OD-01)" | ❌ Not approved |
| Critical architecture decisions resolved | Accepted ADRs | ADR-0001 – ADR-0012 all "**Proposed**"; 21 further open decisions (OD-02 – OD-22) | ❌ Unresolved |

Per the Phase 3 instructions, the plan was prepared **provisionally**: every document and task carries a PROVISIONAL banner, unresolved decisions are documented and mapped to the tasks they affect, and Phase 3 is **not** claimed complete. Once G0 is recorded, the classification becomes **TASK PLANNING COMPLETE WITH OPEN ITEMS** (task-specific ODs/DGs and external blockers remain); no task content needs to change unless an approval differs from the recommended option.

## 2. PHASE 3 — TASK PLANNING REPORT

### 2.1 Documents created (all under `docs/tasks/`, Markdown only)

| Document | Purpose |
|---|---|
| `README.md` | Entry point and conventions |
| `master-task-plan.md` | D1 — overview, phases, features, counts, sequence, milestones, completion conditions, risks, blockers |
| `task-registry.md` | D2 — status board for 88 tasks + 10 reserved deferred IDs |
| `dependency-graph.md` | D3 — feature graph, 6 per-phase Mermaid graphs, optional deps, critical path, parallel groups, approval-gated tasks |
| `execution-roadmap.md` | D4 — Wave 0 (approvals) + 9 execution waves, checkpoints CP-4 … CP-9 |
| `implementation-matrix.md` | D5 — every FR, NFR, constraint, user story and design component → tasks → verification |
| `testing-matrix.md` | D6 — every task → unit / DB / UI / integration / migration / device tests and objective verification |
| `agent-execution-guide.md` | Agent workflow, restrictions, stop conditions, global DoD, report format, change management |
| `design-gaps.md` | 13 design gaps (DG-01 – DG-13) found while planning, with smallest proposed corrections |
| `deferred-backlog.md` | 10 reserved IDs for MVP+/deferred work |
| `phase-3-review.md` | This review |
| `phase-04-foundation/` … `phase-09-security-release/` | 88 individual task documents, each following the 13-section template |

No application code, configuration, `package.json`, `app.json`, TypeScript config, PRS or design document was modified.

### 2.2 Total number of tasks

**88 active tasks** (21 SMALL, 64 MEDIUM, 3 LARGE) + **10 reserved DEFERRED IDs**.

### 2.3 Tasks per implementation phase

| Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 |
|---|---|---|---|---|---|
| 24 | 12 | 8 | 16 | 11 | 17 |

### 2.4 Critical tasks (32)

- **Phase 4 (13):** 404 Result/IDs/Clock · 405 errors + logger · 406 money core · 407 money parse/format · 408 calendar dates · 409 Db adapter · 410 SQLite test harness · 411 migration runner · 412 baseline schema · 413 repository helpers · 420 routes + tabs · 421 DatabaseGate · 422 profile + onboarding
- **Phase 5 (6):** 501 categories/methods · 502 transaction validation · 503 transaction repo · 505 transaction service · 507 transaction form · 508 add-transaction workflow
- **Phase 6 (2):** 601 aggregates · 602 FR-007 calculators
- **Phase 7 (5):** 701 budget evaluation · 702 budget versions repo · 708 goal progress/required saving · 709 tracking/projection/gap · 710 goal schema + repo
- **Phase 8 (3):** 801 model · 802 historical analysis · 803 engine pipeline
- **Phase 9 (3):** 904 delete all data · 911 on-device migration verification · 917 final regression

### 2.5 Major dependencies

Database chain 409 → 413 gates all data work; app shell 420 → 422 gates all screens; money/date domain 406 – 408 gates all calculations; aggregates 601 feed four features; goal tracking 709 gates the engine 803; the dashboard file is edited in sequence 606 → 707 → 715 → 810 → 901.

### 2.6 Parallel execution groups

15 groups (P1 – P15) are listed in [dependency-graph §6](dependency-graph.md#6-parallelizable-groups), with their shared files and checkpoints. The most valuable are: UI kit (414 – 419) ∥ database chain (409 – 413); pure domain (602, 701, 708, 709, 801 – 807) pulled forward alongside Phases 4–6; budget track ∥ goal track in Phase 7; rules 804 ∥ 805 ∥ 806. Six sequential chains on shared files are mandatory.

### 2.7 Critical implementation path

26 tasks: 401 → 404 → 405 → 406 → 414 → 416 → 417 → 418 → 420 → 421 → 422 → 505 → 508 → 509 → 511 → 606 → 707 → 715 → 810 → 901 → 902 → 904 → 909 → 912 → 915 → 917.

### 2.8 Requirements without task coverage

**No MVP requirement lacks tasks** (mechanically verified, §6). Requirements intentionally without MVP tasks, each with a reserved ID: FR-004 custom categories (TASK-591), FR-018.2 (TASK-690), FR-020 (TASK-590, 891), FR-021 (TASK-994), FR-022.3 (TASK-992), FR-023 (TASK-993), FR-025 app lock (TASK-990), database encryption (TASK-991).

### 2.9 Tasks blocked by unresolved decisions

All 88 are behind **G0**. In addition, 26 tasks are task-specifically `BLOCKED`:

| Blocker | Tasks |
|---|---|
| OD-02, OD-13 | 420 (OD-13 also 403) |
| OD-03, OD-04, OD-05 | 709 |
| OD-06, OD-09 | 412, 710 |
| OD-10 | 702 |
| OD-11, OD-14, OD-20 | 412 (OD-14 also 411) |
| OD-12 | 502, 506 |
| OD-15 | 907, 908 (+ one sentence of 903) |
| OD-16 | 506, 906 |
| OD-17 | 403 |
| OD-18 | 910 |
| OD-19 | 410 (→ 411) |
| OD-21 | 714, 903 |
| OD-22 | 802 |
| DG-02, DG-11 | 421 |
| DG-03 | 504, 510 |
| DG-04, DG-10 | 606 |
| DG-05 | 705 |
| DG-06 | 903 |
| DG-07 | 914 |
| DG-09 | 917 (automated variant only) |
| DG-12 | 910 |
| External (macOS, Apple/Google accounts, signing, bundle id) | 908, 913, 915 (+ 914 bundle id) |

**DG-11 is the most urgent new gap:** the design puts `DatabaseGate` in the root layout but its own import rules forbid that layer from reaching the database. It sits on the critical path (TASK-421).

### 2.10 Testing coverage overview

- Every task (88/88) has a testing-matrix row with objective verification. Counting only **R**equired cells: 48 tasks require unit tests, 16 database tests, 35 UI component tests, 22 integration/workflow tests, 5 migration-level tests, and 28 manual device checks (more are marked optional).
- All 11 TS §4 integration workflows are owned: #1/#2 (512, 608), #3 (716, 811), #4 (716), #5 (811), #6 (512, 716, 811), #7 (716), #8 (902), #9 (904), #10 (421), #11 (905).
- Every AGENTS.md §12 edge case (zero income/expenses/budget, completed/past goals, no transactions, negative balance, very large values, leap years, month boundaries, currency precision) is assigned to a named task (testing-matrix, last table).
- Every critical calculation has edge-case tests: FR-007 (602), FR-008 (701), FR-010 (708), FR-011/015 (709), FR-013 (802, 805), FR-017.1 (805, 807), FR-018.1 (603).
- Six regression checkpoints: 424, 512, 608, 716, 811, 917.

### 2.11 Major implementation risks

Top five (full list in [master-task-plan §9](master-task-plan.md#9-major-risks)): approval latency across G0 + 21 ODs + 13 DGs; `node:sqlite` viability under Jest (DG-01); baseline migration immutability vs late schema decisions; data loss in migration/delete paths; iOS build/verification without macOS.

### 2.12 Recommended first task

**Before any task:** record G0 (OD-01, design approval, ADR acceptance) and, in the same session, decide the database-path items OD-19, OD-14, OD-06, OD-09, OD-11, OD-20 and the shell items OD-02, OD-13, DG-11 — they unblock the critical path.

**First task to execute after G0:** **TASK-401 — Layer boundary lint rules**, in parallel with **TASK-402 — Test tooling**. Both have no task dependencies, are SMALL, and make every later task's architecture and time-zone rules machine-checked from the first line of new code.

### 2.13 Classification

**TASK PLANNING BLOCKED** — the plan is complete and internally consistent, but the mandatory PRS and design approvals are missing. No implementation task is marked complete, and Phase 4 has not been started.

## 3. Consistency review

### Task coverage

| Check | Result |
|---|---|
| Every approved PRS requirement has implementation tasks | ✅ All MVP FRs, NFRs, §32–§36 and US-001 – US-007 mapped (implementation-matrix §1–§3). MVP+/deferred items mapped to reserved IDs. |
| Every important design component has tasks | ✅ implementation-matrix §4 (layers, money, dates, DB, migrations, stores, hook, theme, UI inventory, routes, engine, export, backup exclusion) |
| Every planned feature has testing tasks | ✅ Each phase ends in a checkpoint; each task has a testing-matrix row |
| Every major database entity has tasks | ✅ `profile` (412, 422, 901 – 904), `categories`/`payment_methods` (412, 501), `transactions` (412, 503, 504, 601), `budget_versions` (412, 702), `savings_goals` (412, 710), `goal_balance_events` (412, 710, conditional on OD-09) |
| Every critical calculation has test coverage | ✅ §2.10 |
| Every release requirement has implementation and verification tasks | ✅ 907 – 917 |

### Dependency integrity

| Check | Result |
|---|---|
| All dependencies identified | ✅ Every task lists direct dependencies; all 88 referenced IDs exist |
| No circular dependencies | ✅ Depth-first cycle check: 0 cycles |
| Critical path documented | ✅ dependency-graph §5 |
| Parallel opportunities identified | ✅ dependency-graph §6, execution-roadmap |
| Blocked tasks explicitly marked | ✅ 26 `BLOCKED` with reason in registry and task files; G0 banner on all |
| `Blocks` fields consistent | ✅ Regenerated as the exact reverse of `Dependencies` |

### Task quality

| Check | Result |
|---|---|
| Unique IDs | ✅ 88 unique; ranges 401–424, 501–512, 601–608, 701–716, 801–811, 901–917; reserved 590, 591, 690, 890, 891, 990–994 |
| Objective, affected files, dependencies, acceptance criteria, testing, DoD | ✅ All 88 files contain all 13 template sections (mechanically counted) |
| Grounded in design, traceable PRS references | ✅ Every task has PRS and design references; paths not named by the design are labelled *(proposed path)* |
| No hidden architecture decisions | ✅ Where the design is silent, the task is blocked on a DG item rather than leaving the choice to the agent |

### Documentation quality

| Check | Result |
|---|---|
| Master plan, registry, graph, roadmap, implementation matrix, testing matrix, agent guide complete | ✅ |
| Individual task documents linked correctly | ✅ Link checker: all relative links and anchors under `docs/tasks/` resolve (§6) |

## 4. Deviations from the requested structure

| Request | What was done | Why |
|---|---|---|
| Phase 9 tasks for app lock, biometrics, DB encryption, CSV, restore, backup validation, notifications "if approved" | Reserved DEFERRED IDs only | Not approved for the MVP (PRS §5.1); a task document would invent unapproved requirements |
| Separate "expense creation" and "income creation" tasks | One workflow task (TASK-508) | Design: income and expense are modes of one form/service (SA §C, ADR-0008) |
| "Recommendation persistence" task | None | ADR-0007: recommendations are never persisted |
| Additional files `design-gaps.md`, `deferred-backlog.md`, `phase-3-review.md` | Added | Needed to report gaps, keep deferred IDs stable, and record this review |

## 5. Recommended next actions (for the product owner / tech lead)

1. Record G0: approve PRS v1.1 (OD-01 option b), approve the Phase 2 design, and accept/reject ADR-0001 – ADR-0012.
2. Decide the database and shell items (OD-02, 06, 09, 11, 13, 14, 19, 20; DG-11).
3. Decide the remaining ODs/DGs before their wave (execution-roadmap Wave 0 table).
4. Update the registry banner to "G0 passed" and authorize TASK-401 / TASK-402.

Phase 4 will not start until this is explicitly approved.

## 6. How consistency was verified

The metadata of all task files was parsed mechanically (`Task ID`, `Status`, `Priority`, `Dependencies`, `Blocks`, `PRS References`, section count), then checked for: missing references, `Blocks` ≠ reverse dependencies, cycles (DFS), longest path, 13 sections per file, PRS coverage, and link/anchor validity across `docs/tasks/`. To re-run after a plan change (Node ≥ 18, from `docs/tasks/`):

```js
// check-plan.js — node check-plan.js
const fs = require('fs'), path = require('path');
const T = {};
for (const d of fs.readdirSync('.').filter((d) => d.startsWith('phase-') && fs.statSync(d).isDirectory()))
  for (const f of fs.readdirSync(d).filter((f) => f.startsWith('TASK-'))) {
    const t = fs.readFileSync(path.join(d, f), 'utf8');
    const line = (k) => (t.split('\n').find((l) => l.startsWith(`- **${k}:**`)) || '').replace(/\([^)]*\)/g, '');
    const ids = (s) => [...new Set(s.match(/TASK-\d{3}/g) || [])];
    T[f.slice(0, 8)] = { deps: ids(line('Dependencies')), blocks: ids(line('Blocks').replace(/—.*$/, '')),
      sections: (t.match(/^## \d+\./gm) || []).length };
  }
const p = [];
for (const [id, t] of Object.entries(T)) {
  if (t.sections !== 13) p.push(`${id}: ${t.sections} sections`);
  for (const d of t.deps) if (!T[d]) p.push(`${id}: unknown dep ${d}`); else if (!T[d].blocks.includes(id)) p.push(`${d}: Blocks lacks ${id}`);
  for (const b of t.blocks) if (!T[b] || !T[b].deps.includes(id)) p.push(`${id}: stale Blocks ${b}`);
}
const st = {}; const visit = (n, s) => { if (st[n] === 2) return; if (st[n] === 1) return p.push('cycle ' + s.concat(n).join('>'));
  st[n] = 1; T[n].deps.filter((d) => T[d]).forEach((d) => visit(d, s.concat(n))); st[n] = 2; };
Object.keys(T).forEach((n) => visit(n, []));
console.log(Object.keys(T).length, 'tasks;', p.length ? p.join('\n') : 'no problems');
```

Last run (2026-11-07): **88 tasks; no problems.** Link check: 190 relative links and anchors checked, 0 broken.
