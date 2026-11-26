# Execution Roadmap

> **PROVISIONAL** — Wave 0 (approval) has not happened. No dates or durations are given; waves are ordered by dependency only.

Waves group tasks whose prerequisites are complete at the same point. Within a wave, tracks run in parallel; arrows inside a track are sequential. "Level" in brackets is the task's depth in the dependency graph (1 = no prerequisites).

## Wave 0 — Approval gate G0 (no implementation)

| Needed to start | Approvals |
|---|---|
| **Any task** | OD-01 (PRS v1.1 re-review recorded) · Phase 2 design documents changed from *Provisional* to approved · ADR-0001 … ADR-0012 changed from *Proposed* to *Accepted* (or individually rejected with consequences re-planned) |
| Wave 2 Track B (database) | OD-19, OD-14 (+ PO fact: no device holds real draft data), OD-06, OD-09, OD-20, OD-11 |
| Wave 3 (app shell) | OD-02, OD-13, DG-11 (DG-02 for the diagnostic section) |
| Wave 4 | OD-12, OD-16 (date picker), DG-03 |
| Wave 5 | DG-04, DG-10 |
| Wave 6 | OD-10, OD-03, OD-04, OD-05, OD-21, DG-05 |
| Wave 7 | OD-22 |
| Wave 8 | OD-16 (file-system, sharing), OD-15, OD-21, DG-06 |
| Wave 9 | OD-17, OD-18, DG-07, DG-09 (automated E2E only), DG-12; external accounts/hardware |

Recommendation: request **all** Wave 0 – 4 approvals in one PO/tech-lead session; they are mostly confirmations of recommended options.

## Wave 1 — Tooling and core library

| Track | Tasks | Prerequisites |
|---|---|---|
| A | 401 [1] → 404 [2] → 405 [3] | G0 |
| B | 402 [1] | G0 |

Parallel: 401 ∥ 402. Exit: lint rules and test scripts in place; `Result`, IDs, Clock, errors, logger exist.

## Wave 2 — Domain primitives, database infrastructure, state and UI kit

| Track | Tasks | Prerequisites |
|---|---|---|
| A — money & dates | 406 [4] → 407 [5]; 408 [3] | 404, 405, 402 |
| B — database | 409 [4] → 410 [5] → 411 [6] → 412 [7] → 413 [8] | 405; OD-19, OD-14, OD-06, OD-09, OD-20, OD-11 |
| C — state | 414 [5] → 415 [6] | 404, 405, 406 |
| D — UI kit | 416 [6] → 417 [7] → 418 [8]; 419 [8] | 414; 407 for 419 |
| E — pure domain, pulled forward (optional) | 602 [6], 701 [6], 708 [6], 802 [5] (OD-22), 709 [7] (OD-03/04/05), 801 [7], 803 [8] | 406, 407, 408 (+ listed ODs) |

Parallel opportunities: Tracks A–D run concurrently once their first prerequisite lands. Track E is optional early work: these are pure, file-isolated domain modules; doing them now de-risks Waves 6–7 and the recommendation chain.
Merge hotspots: `src/shared/ui/index.ts` (417/418/419 — append), `src/domain/recommendations/index.ts` (801/802 — append).

## Wave 3 — Application shell → **Checkpoint CP-4**

| Track | Tasks | Prerequisites |
|---|---|---|
| A | 420 [9] → 421 [10] → 422 [11] → 423 [12] → **424 [13] CP-4** | Waves 1–2 (Tracks A–D); OD-02, OD-13, DG-11 |
| B (when approved) | 403 [13] | 423; OD-17, OD-13 |

Sequential by necessity: 420 → 421 → 422 → 423 all modify `src/app/_layout.tsx`.
Exit (CP-4): app runs on Android, onboarding works, five tabs reachable, draft code removed, evidence in `docs/tests/phase-04-verification.md`.

## Wave 4 — Transaction core and UI → **Checkpoint CP-5**

| Track | Tasks | Prerequisites |
|---|---|---|
| A — data | 501 [9] → 502 [10] → 503 [11] → 504 [12] → 601 [13] | 412, 413; OD-12; DG-03 for 504 |
| B — service & form | 506 [9] → 507 [11]; 505 [12]; then both → 508 [13] → 509 [14] | 422, 501–503; OD-16, OD-12 for 506 |
| C — history | 510 [13] → 511 [15] → **512 [16] CP-5** | 504, 506, 508, 509 |

501, 502, 506 may start before CP-4 completes (they need only Track A/B of Wave 2 and the UI kit). Sequential files: `transactionsRepo.ts` (503 → 504 → 601); `transactionService.ts` (505 → 509 → 605).
Exit (CP-5): users can add, edit, delete, search and filter income and expenses offline.

## Wave 5 — Dashboard and analytics → **Checkpoint CP-6**

| Track | Tasks | Prerequisites |
|---|---|---|
| A | 603 [10], 604 [10] → 605 [15] → 606 [16] | 601, 602, 509; DG-04, DG-10 for 606 |
| B | 607 [16] → **608 [17] CP-6** | 601–604, 510, 511, 606 |
| C — early security (optional) | 907 [11], 908 [11] | 421; OD-15; macOS for 908 |

Exit (CP-6): Home summary and Reports correct for month and custom periods.

## Wave 6 — Budgets and savings goals → **Checkpoint CP-7**

| Track | Tasks | Prerequisites |
|---|---|---|
| A — budgets | 702 [9] → 703 [14] → 704 [15] → 705 [16] → 706 [17]; 707 [17] | 701, 601, 504; OD-10; DG-05 for 705 |
| B — goals | 710 [9] → 711 [14] → 712 [15] → 713 [16] → 714 [17] → 715 [18] | 708, 709, 601, 422; OD-06, OD-09, OD-21 |
| C — export builder (optional early) | 905 [12] | 503, 702, 710 |
| — | **716 [19] CP-7** | 608, 704–707, 712–715 |

Tracks A and B are independent except the dashboard file: **707 → 715** must be sequential (`DashboardScreen.tsx`).
Exit (CP-7): budgets and goals work end to end, dependent figures update after transaction changes.

## Wave 7 — Recommendation engine → **Checkpoint CP-8 (MVP feature-complete)**

| Track | Tasks | Prerequisites |
|---|---|---|
| A — domain (if not done in Wave 2 Track E) | 801, 802 → 803 → {804 ∥ 805 ∥ 806} → 807 | 701, 709 |
| B — delivery | 808 [14] → 809 [15] → 810 [19] → **811 [20] CP-8** | 807, 601, 702, 710; 715 for 810 |

804/805/806 run in parallel; their only shared file is `rules/index.ts` (one appended line each).
Exit (CP-8): all MVP features integrated; recommendations react to every data change; FR-019.7 verified.

## Wave 8 — Settings, export, privacy and data lifecycle

| Track | Tasks | Prerequisites |
|---|---|---|
| A | 901 [20] → 902 [21] → 904 [22] | 810 (dashboard file), 422; 906 for 904 |
| B | 903 [21] | 901; OD-21, DG-06 |
| C | 905 → 906 [21] | 901; OD-16 |
| D (if not done) | 907, 908 | 421; OD-15 |

Sequential: `settingsService.ts` 901 → 902 → 904. Append hotspot: `SettingsScreen.tsx` rows.

## Wave 9 — Hardening and release → **Checkpoint CP-9 (release readiness)**

| Track | Tasks | Prerequisites |
|---|---|---|
| A | 909 [23], 910 [21], 911 [14] | 811, 902–906; OD-18, DG-12 for 910 |
| B | 912 [24] ∥ 913 [24] | 904, 906, 907, 909–911; 908 for 913 (macOS) |
| C | 914 [14] → 915 [25] | 403, 907; DG-07; 912, 913; accounts |
| D | 916 [22] | 903, 914 |
| — | **917 [26] CP-9** | 911, 912, 913, 915, 916 |

911 can run as early as CP-4 (it only needs the database foundation) and should be repeated whenever a new migration is added.
Exit (CP-9): readiness report delivered; release decision belongs to the PO.

## Integration checkpoints

| ID | Task | What it proves |
|---|---|---|
| CP-4 | TASK-424 | Running foundation (DB, migrations, navigation, onboarding, UI kit) |
| CP-5 | TASK-512 | Local income/expense management |
| CP-6 | TASK-608 | Financial overview and reports |
| CP-7 | TASK-716 | Budgets and goals with dependent updates |
| CP-8 | TASK-811 | Recommendations; MVP feature-complete |
| CP-9 | TASK-917 | Release readiness on production builds |

A failing checkpoint stops the next wave's dependent tasks; independent pulled-forward domain tasks may continue.

## Parallel execution rules

1. Never run two tasks in parallel if they modify the same non-append-only file ([dependency-graph §6](dependency-graph.md#6-parallelizable-groups)).
2. Pull-forward is allowed only for tasks whose **all** dependencies are DONE; checkpoints are soft gates only for the tasks listed in [dependency-graph §3](dependency-graph.md#3-blocking-vs-optional-dependencies).
3. One agent per task; an agent never picks a second task until the first is reported.
4. After merging parallel tasks, run the full verification set before the next wave starts.
