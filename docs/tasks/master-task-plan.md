# Master Task Plan — FinanceTracker MVP

**Phase:** 3 — TASK · **Date:** 2026-11-06 · **Plan status: PROVISIONAL**
**Inputs:** PRS v1.1 (`docs/requirements/product-requirements.md`, *pending final re-review*), Phase 2 design (`docs/design/*`, *Provisional*), ADR-0001 – ADR-0012 (*Proposed*), repository at commit `e4b2a1e` + working tree.

> The approval gate is **not** passed: OD-01 (PRS re-review) is an open blocker and the design/ADRs are not approved. This plan is complete as a draft but **must not be executed** until gate G0 passes (§10). Tasks that additionally depend on specific open decisions are marked `BLOCKED` in the [registry](task-registry.md).

## 1. Implementation overview

The repository contains draft code written before the PRS review (`appStore`, `src/db/*`, `utils/money.ts`, four screens). The design replaces it (SA §0). The plan therefore builds the approved architecture alongside the draft — `src/domain` (pure logic), `src/data` (SQLite + repositories), `src/shared` (lib, stores, theme, UI kit), `src/features/*`, thin `src/app` routes — switches routing to it in Phase 4, and deletes the draft (TASK-423).

Principles carried into every task: money as integer minor units with explicit currency (ADR-0002); local calendar dates (ADR-0003); SQLite as the only source of truth, Zustand only for session/UI state and revision signals (ADR-0004); forward-only migrations on `PRAGMA user_version` (ADR-0009); recommendations computed on demand, deterministic and explainable (ADR-0007); no network code.

## 2. Implementation phases

| Phase | Name | Delivers | Tasks | Checkpoint |
|---|---|---|---|---|
| 4 | Application Foundation | Lint-enforced layers, test tooling, money/date domain, DB connection + migration runner + baseline schema, repository helpers, stores, query hook, theme + UI kit, routes with 5 tabs, DatabaseGate, onboarding, draft code retired | 24 | TASK-424 |
| 5 | Transaction Management | Categories/payment methods, transaction validation, repository, service, form, add/edit/delete, history with search and filters | 12 | TASK-512 |
| 6 | Dashboard & Analytics | SQL aggregates, FR-007 calculators, category distribution, shared period picker, Home summary, Reports | 8 | TASK-608 |
| 7 | Budgets & Savings Goals | Budget versions, evaluation, budget screens; goal calculators (required saving, expected saving, tracking, projection, gap), goal screens; Home sections | 16 | TASK-716 |
| 8 | Recommendation Engine | Model, historical analysis, engine pipeline, 6 rules, merge/suppression, safety tests, service, screens, Home section | 11 | TASK-811 |
| 9 | Security, Backup & Release | Settings (profile, theme, currency lock, privacy, about), delete all data, JSON export, OS backup exclusion, accessibility, performance, migration verification, device verification, release config, builds, docs, final regression | 17 | TASK-917 |
| — | Deferred (reserved IDs) | MVP+ / deferred features requiring their own specification | 10 IDs | — |

## 3. Feature breakdown

| Phase | Feature | Tasks |
|---|---|---|
| 4 | F4.1 Tooling & conventions | 401, 402, 403 |
| 4 | F4.2 Shared core library | 404, 405 |
| 4 | F4.3 Domain primitives | 406, 407, 408 |
| 4 | F4.4 Database foundation | 409, 410, 411, 412, 413, 421 |
| 4 | F4.5 State management foundation | 414, 415 |
| 4 | F4.6 Theme & shared UI | 416, 417, 418, 419 |
| 4 | F4.7 Navigation foundation | 420 (+421) |
| 4 | F4.8 Profile & onboarding | 422 |
| 4 | F4.9 Draft code retirement | 423 |
| 4 | F4.10 Phase verification | 424 |
| 5 | F5.1 Reference data | 501 |
| 5 | F5.2 Transaction core | 502, 503, 505 |
| 5 | F5.3 History, search & filters | 504, 510, 511 |
| 5 | F5.4 Transaction UI | 506, 507 |
| 5 | F5.5 Transaction workflows | 508, 509 |
| 5 | F5.6 Phase verification | 512 |
| 6 | F6.1 Financial data aggregation | 601 |
| 6 | F6.2 Financial calculation services | 602, 603 |
| 6 | F6.3 Date filters | 604 |
| 6 | F6.4 Dashboard | 605, 606 |
| 6 | F6.5 Reports | 607 |
| 6 | F6.6 Phase verification | 608 |
| 7 | F7.1 Budget core | 701, 702 |
| 7 | F7.2 Budget workflows | 703, 704, 706 |
| 7 | F7.3 Budget progress & warnings | 705, 707 |
| 7 | F7.4 Savings goal calculations | 708, 709 |
| 7 | F7.5 Savings goal management | 710, 711, 712 |
| 7 | F7.6 Goal progress & status UI | 713, 714, 715 |
| 7 | F7.7 Phase verification | 716 |
| 8 | F8.1 Engine foundation | 801, 803 |
| 8 | F8.2 Historical analysis | 802 |
| 8 | F8.3 Recommendation rules | 804, 805, 806 |
| 8 | F8.4 Prioritization & suppression | 807 |
| 8 | F8.5 Recommendation delivery | 808, 809, 810 |
| 8 | F8.6 Phase verification | 811 |
| 9 | F9.1 Settings & privacy controls | 901, 902, 903 |
| 9 | F9.2 Data lifecycle | 904 |
| 9 | F9.3 Backup (export) | 905, 906 |
| 9 | F9.4 Local data protection | 907, 908 |
| 9 | F9.5 Quality hardening | 909, 910 |
| 9 | F9.6 Release verification | 911, 912, 913, 917 |
| 9 | F9.7 Release | 914, 915, 916 |

Prompt items intentionally **not** given tasks, with reason: *recommendation persistence* (ADR-0007: never persisted); *recurring transaction management, recurring expense analysis* (FR-020 MVP+ → TASK-590/891); *category management* (custom categories MVP+ → TASK-591); *historical trends, savings trends* (FR-018.2 MVP+ → TASK-690); *app lock, biometrics, database encryption, CSV export, JSON restore, backup validation, notifications* (MVP+/deferred → TASK-990 – 994); *environment configuration* (no environment variables or secrets exist; only the DG-12 perf flag, inside TASK-910); *goal contributions* (PD-06: user-maintained balance; optional history per OD-09 inside TASK-710).

## 4. Task counts

| | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Total |
|---|---|---|---|---|---|---|---|
| Tasks | 24 | 12 | 8 | 16 | 11 | 17 | **88** |
| CRITICAL | 13 | 6 | 2 | 5 | 3 | 3 | 32 |
| HIGH | 10 | 5 | 6 | 9 | 8 | 12 | 50 |
| MEDIUM | 0 | 1 | 0 | 2 | 0 | 2 | 5 |
| LOW | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| Task-specific BLOCKED | 6 | 4 | 1 | 5 | 1 | 9 | 26 |

Plus 10 reserved `DEFERRED` IDs. Complexity: 21 SMALL, 64 MEDIUM, 3 LARGE.

## 5. Major dependencies

- **Database chain** 409 → 410 → 411 → 412 → 413 gates every repository, service and screen. It carries most open decisions (OD-06, 09, 11, 14, 19, 20).
- **App shell** 420 → 421 → 422 gates every feature screen (OD-02, DG-11).
- **Money and date domain** (406 – 408) gates all calculations and validation.
- **Goal tracking** 709 (OD-03/04/05) gates goal UI and the recommendation engine (803).
- **Transaction aggregates** 601 feed dashboard, reports, budgets, goals and recommendations.
- **Dashboard screen** is edited in sequence by 606 → 707 → 715 → 810 → 901.

Full graphs: [dependency-graph.md](dependency-graph.md).

## 6. Critical implementation sequence

Longest chain (26 tasks): 401 → 404 → 405 → 406 → 414 → 416 → 417 → 418 → 420 → 421 → 422 → 505 → 508 → 509 → 511 → 606 → 707 → 715 → 810 → 901 → 902 → 904 → 909 → 912 → 915 → 917.

Levers: start the UI kit (414 → 419) in parallel with the database chain; pull pure domain tasks (602, 701, 708, 709, 801 – 807) forward into Waves 2–4; resolve database-related decisions first, because they block the most work. Waves: [execution-roadmap.md](execution-roadmap.md).

## 7. Testing milestones

| Milestone | Task | Pass condition |
|---|---|---|
| T1 — Tooling ready | 401, 402, 410 | Lint layer rules, 3-TZ runner, real-SQLite tests working in both Jest environments |
| T2 — Domain exactness | 406 – 408 | Money/date suites green in 3 time zones; domain coverage ≥ 95 % |
| T3 — Schema integrity | 411, 412 | Every constraint/trigger/migration scenario tested |
| CP-4 | 424 | Foundation running on Android; full suite + coverage |
| CP-5 | 512 | Transaction workflows; airplane mode; kill/reboot persistence |
| CP-6 | 608 | Dashboard/report workflows; US-004 sum invariant |
| CP-7 | 716 | Budget/goal workflows; dependent updates |
| CP-8 | 811 | Recommendation workflows; safety and determinism; MVP feature-complete |
| T4 — Hardening | 909 – 911 | Accessibility audit, NFR-001 performance, on-device migration |
| CP-9 | 917 | Regression on production build; requirements, scope and privacy audits |

Details: [testing-matrix.md](testing-matrix.md).

## 8. Phase completion conditions

A phase is complete only when **all** of its tasks are `DONE` (or `DEFERRED` with PO approval), its checkpoint task is `DONE` with evidence in `docs/tests/`, and the full verification set passes on the merged result:

| Phase | Completion condition (in addition to the above) |
|---|---|
| 4 | Fresh Android install reaches onboarding → Home; no draft code remains; `user_version = 1` |
| 5 | Income and expenses can be added, edited, deleted, searched and filtered offline; data survives kill and reboot |
| 6 | Home and Reports show correct totals, savings, rate and category distribution for month and custom periods |
| 7 | Budgets (with history) and goals (with tracking/projection) work; all figures update after transaction changes |
| 8 | Recommendations meet RE rules, safety language, determinism; dashboard shows top 3; FR-019.7 holds |
| 9 | Release-readiness report delivered; PO makes the release decision |

## 9. Major risks

| # | Risk | Impact | Mitigation in plan |
|---|---|---|---|
| R1 | Approvals (G0 + 21 ODs + 13 DGs) are slow or change the design | Plan rework; idle agents | Wave 0 batches approvals; IDs are stable and change management is defined (agent guide §8) |
| R2 | `node:sqlite` unusable under Jest/jest-expo (DG-01) | No real-SQLite tests → weaker DB guarantees | TASK-410 spike with stop condition; `better-sqlite3` fallback (OD-19) |
| R3 | Baseline migration becomes immutable before late decisions (OD-06/09/11/20) | Early migration 2 needed | Those ODs listed as blockers of TASK-412 |
| R4 | Data loss during migration or Delete All | Financial data destroyed | Legacy guard, transactional migrations, pre-migration backup, failure-injection tests (411, 904), on-device verification (911) |
| R5 | Money/date subtlety (float, UTC parsing, rounding) | Wrong figures | Pure domain with BigInt ratios; 3-TZ suite; property tests (406 – 409, 708, 709, 802) |
| R6 | Recommendation wording implies advice or guarantees | Violates §32 | Banned-phrase, essential-safety and determinism tests (807); PO copy review (916) |
| R7 | NFR-001.2 targets missed at 50k rows | Performance failure | Covering indexes from the start; measurement task (910) with pre-designed escalations (FTS5, FlashList) as design changes |
| R8 | `NativeTabs` unstable API changes | Navigation breakage | JS `Tabs` fallback confined to `(tabs)/_layout.tsx` (NAV §A.2) |
| R9 | iOS cannot be built/verified (no macOS) | iOS backup exclusion and release blocked | iOS isolated in 908/913; PO may release Android first (915) |
| R10 | Parallel agents collide on hotspot files | Merge conflicts, regressions | Sequential chains and append-only hotspots documented (dependency-graph §6) |
| R11 | Draft DB on a developer device contains test data | Startup error `LEGACY_DATA_PRESENT` | Intended behaviour; developer clears app data (DB §J.6) |

## 10. External blockers and approval gates

### Gate G0 (blocks all 88 tasks)

| Item | Owner | Current state |
|---|---|---|
| OD-01: record PRS v1.1 final re-review (recommended: approve with OD-05/06/12/21/22 clarifications) | Product owner | **Not recorded** — PRS header says "pending final SPEC re-review" |
| Phase 2 design approval (11 documents marked *Provisional*) | Product owner + tech lead | **Not approved** |
| ADR-0001 – ADR-0012 acceptance | Tech lead (ADR-0010 also PO) | All **Proposed** |

### Task-specific decisions

See [dependency-graph §7](dependency-graph.md#7-tasks-requiring-approval-before-execution) for the full OD/DG → task mapping, and [design-gaps.md](design-gaps.md) for the 13 gaps found during planning.

### External (outside the project)

| Blocker | Tasks |
|---|---|
| macOS + Xcode (iOS builds, native module, simulator) | 908, 913 |
| Apple developer account, iOS bundle identifier | 913, 914, 915 |
| Google Play Console account, Android signing via EAS | 915 |
| Physical reference Android device (OD-18) | 910, 912 |
| Expo/EAS account access (`projectId` already in `app.json`) | 910, 912, 913, 915 |

## Document index

[README](README.md) · [task-registry](task-registry.md) · [dependency-graph](dependency-graph.md) · [execution-roadmap](execution-roadmap.md) · [implementation-matrix](implementation-matrix.md) · [testing-matrix](testing-matrix.md) · [agent-execution-guide](agent-execution-guide.md) · [design-gaps](design-gaps.md) · [deferred-backlog](deferred-backlog.md) · [phase-3-review](phase-3-review.md)
