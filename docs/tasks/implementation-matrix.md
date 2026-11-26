# Implementation Matrix

> **PROVISIONAL** — maps PRS v1.1 (pending re-review, OD-01) to the provisional design and tasks.

Source: `docs/requirements/product-requirements.md` v1.1. Design abbreviations as in [requirements-traceability](../design/requirements-traceability.md). "Primary tasks" implement the requirement; "Verified by" names the task(s) whose tests or checkpoint prove it. The full machine-derived list of every task that references a requirement can be regenerated from the task files' `PRS References` fields.

## 1. Functional requirements

| PRS ID | Status | Design | Primary tasks | Verified by | Verification |
|---|---|---|---|---|---|
| FR-001 Profile (name, currency, theme) | MVP | NAV §C, UX §H, DB §B.1 | 412, 416, 422, 901 | 422, 901, 424 | DB, service, component tests; restart persistence (manual) |
| FR-001.1 Currency before data | MVP | DB §B.1/B.4 triggers, NAV §C guard | 412, 422, 505 | 412, 422, 505 | Trigger tests; guard redirect; `CURRENCY_NOT_SET` |
| FR-001.2 INR only | MVP | DB §D.2 | 406, 422 | 406 | Registry unit tests |
| FR-001.3 Currency on every value | MVP | DB §D, ADR-0002 | 406, 412, 413 | 412, 413 | Mismatch triggers, read guards |
| FR-001.4 Currency lock | MVP | DB §B.1, SA §E.3 | 412, 902 | 412, 902 | Trigger tests; TS §4 #8 |
| FR-002 Expense CRUD, search, filter, by date/category | MVP | BL §A, UX §C, DB §B.4, §I | 502 – 511 | 512 | Unit, DB, component, TS §4 #1/#6 |
| FR-002.1 Recurring flag info-only | MVP | DB §E, RE §B | 412, 502, 507 | 512, 805 | Flag stored; no rule reads it |
| FR-002.2 Search note + category | MVP | DB §I | 504, 511 | 504, 512 | LIKE escaping DB tests |
| FR-002.3 Combined filters | MVP | ST §2, UX §C.5 | 504, 510, 511 | 504, 510, 512 | Brute-force filter tests |
| FR-003 Income (+ .1, .2) | MVP | DB §E, BL §A | 501 – 511 | 512, 608 | Income mode tests; TS §4 #2 |
| FR-003A Input validation 1–9 | MVP | BL §A.2, DB §B CHECKs | 405, 407, 412, 502, 506, 507, 703, 710, 712 | 502, 412, 507, 703, 710 | One test per rule; field-naming messages |
| FR-004 Default categories | MVP (defaults) | DB §J.5 | 412, 501 | 412, 501 | Seed tests |
| FR-004.1 Spending class | MVP | DB §J.5, RE §C | 412, 501, 804 – 807 | 412, 807 | Seed classes; essential-safety property |
| FR-004 custom categories | MVP+ | DB §B.2 | **TASK-591 (deferred)** | — | — |
| FR-005 / FR-005.1 Payment methods, default | MVP | DB §B.3, BL §A.3 | 412, 501, 505, 507 | 501, 507 | Last-used query; preselection |
| FR-006 Dashboard | MVP | UX §B, SA §D.4 | 605, 606, 707, 715, 810 | 608, 716, 811 | TS §4 #1–#3 |
| FR-006.1 Current month default, ≤ 3 recs | MVP | ST §2, RE §E.2 | 604, 803, 810 | 604, 803, 811 | Unit + integration |
| FR-006.2 Empty states | MVP | UX §B, §I | 418, 606, 707, 715, 807, 810 | 606, 707, 715, 810 | Component tests |
| FR-007 Savings & rate (.0 – .4) | MVP | BL §B.1 – B.4 | 406, 407, 601, 602, 606 | 602, 606, 608 | Edge-case tables; SummaryCard tests |
| FR-008 Budgets (.1 – .8) | MVP | DB §F, BL §B.5 – B.6, UX §D, ADR-0006 | 701 – 707 | 701, 702, 716 | Status boundaries; version resolution; TS §4 #3, #7 |
| FR-009 Goals (.1 – .3) | MVP | DB §B.7, §G, BL §B.9, §B.12, UX §E | 708, 710 – 715 | 708, 710, 711, 716 | Unit, DB, TS §4 #4 |
| FR-010 Required monthly saving (.1 – .3) | MVP | BL §B.10 | 708, 711, 712, 714 | 708 | Edge-case table (ceil, p=1, expired) |
| FR-011 Goal tracking (.1 – .3) | MVP | BL §B.11 – B.12 (OD-03/04/05) | 709, 711, 713, 714 | 709, 716 | Threshold + consistency property tests |
| FR-012 Engine (.1 – .3) | MVP | RE §A, ADR-0007 | 801, 803, 807, 808 – 810 | 803, 807, 811 | Determinism; no persistence; TS §4 #5 |
| FR-013 Anomaly (.1 – .5) | MVP | RE §C.3 – C.4, §D | 601, 802, 805 | 802, 805, 811 | Threshold boundaries; history 2 vs 3 |
| FR-014 Budget warning | MVP | RE §C.1 – C.2 | 701, 705, 804 | 804, 811 | FR-014 example; TS §4 #3 |
| FR-015 Savings gap (.1 – .2) | MVP | RE §C.5 – C.6, BL §B.11 | 709, 806, 713 | 709, 806, 811 | FR-015 example; requiredOnly case |
| FR-016 / .1 Discretionary only | MVP | RE §C, §E.3 | 501, 804 – 807 | 807 | Essential-safety property test |
| FR-017 / .1 Explainability, savings cap | MVP | RE §E | 801, 805, 807, 809 | 805, 807, 809 | Cap property; banned phrases; detail UI |
| FR-018.1 MVP reports | MVP | UX §G, BL §B.13 | 601, 603, 607 | 603, 607, 608 | Sum invariant (US-004) |
| FR-018.2 Trend/history reports | MVP+ | — | **TASK-690 (deferred)** | — | — |
| FR-019 Dates & periods (.1 – .7) | MVP | BL §C, ADR-0003 | 404, 408, 502, 506, 604, 802 | 408, 604, 811 | 3-time-zone suite; FR-019.7 integration |
| FR-020 Recurring schedules | MVP+ | DB §H (provisional) | **TASK-590 (deferred)** | — | — |
| FR-021 Notifications | MVP+ | DEP §2 | **TASK-994 (deferred)** | — | — |
| FR-022.1 JSON export | MVP | SEC §6 | 905, 906 | 905, 906, 911 | Schema validation; counts; TS §4 #11 |
| FR-022.2 Unencrypted warning | MVP | SEC §6 | 906 | 906 | Warning-before-write test |
| FR-022.3 CSV export | MVP+ | — | **TASK-992 (deferred)** | — | — |
| FR-023 Restore | Deferred | SEC §6 | **TASK-993 (deferred)**; format prepared in 905 | — | — |
| FR-024 Offline | MVP | SA §F | All features (no network code); 914 audit | 512, 608, 811, 912, 917 | Airplane-mode manual checks; `fetch` grep |
| FR-025.1 MVP settings | MVP | UX §H, NAV §B | 901 – 904, 906 | 901 – 904, 906 | Component tests; scope audit |
| FR-025 app lock / notifications | MVP+ | SEC §5 | **TASK-990, TASK-994 (deferred)** | — | — |
| FR-026.1 Delete confirmation naming item | MVP | UX §C.3, NAV §C | 418, 509, 706, 714 | 509, 706, 714 | Dialog text tests |
| FR-026.2 Delete all data | MVP | DB §J.7 | 904 | 904 | TS §4 #9; failure injection |
| FR-026.3 All-or-nothing save | MVP | SA §D.1 | 409, 413, 503, 505, 702, 710 | 503, 505 | Partial-write tests |
| FR-026.4 One record per save action | MVP | SA §D.1 | 404, 417, 503, 505, 508 | 503, 508 | Same-id insert; double tap |
| FR-026.5 Updates preserve data | MVP | DB §J | 411, 412 | 411, 911 | Migration suite; on-device upgrade |
| FR-027.1 Save failure UX | MVP | SA §E | 405, 418, 505, 507, 508 | 508 | Not-saved banner, values kept |
| FR-027.2 DB open/upgrade failure | MVP | SA §E.2, DB §J.2 | 411, 421 | 421, 911 | TS §4 #10 |
| FR-027.3 No financial details in errors/logs | MVP | SEC §4 | 405, 413, 505 (sentinel helper) | 405, 413, 505, 512, 917 | Sentinel tests |

## 2. Non-functional requirements and constraints

| PRS ID | Design | Primary tasks | Verified by | Verification |
|---|---|---|---|---|
| NFR-001 / .1 / .2 Performance | DB §I | 412 (indexes), 504, 601, 808, 905 | 910 | 50k measurement on reference device (OD-18) |
| NFR-002 Reliability | SEC §2, §7 | 409 (WAL, synchronous FULL), 503, 505 | 512, 912 | Kill/reboot manual checks |
| NFR-003 Data integrity | DB §D, BL | 406, 413, 602, 709, 802, 803 | 406, 803, 807 | Exact arithmetic; determinism |
| NFR-004 / .1 / .2 Privacy, backup exclusion, privacy text | SEC §2, UX §H | 903, 907, 908 | 907, 908, 912, 913 | `bmgr`; iOS hook; copy review |
| NFR-005 Cross-platform | SA, DEP §5 | 409, 420, 908 | 912, 913 | Device verification both platforms |
| NFR-006 / .1 Accessibility | UX §A, §J | 416 – 419, 506, 507, 909 | 416, 417, 909 | Contrast test; a11y helper; TalkBack/VoiceOver |
| NFR-007 Maintainability | SA, ADRs | 401, 402, 411, 423 | 401, 424 | Lint layer rules; migration immutability |
| NFR-008 Testability | TS §0 | 402, 404, 410 | 424 | Coverage gates; injected Clock/Db |
| §32 Financial safety | RE §E.3 | 801, 804 – 807, 809, 903 | 807, 917 | Banned phrases; insight vs suggestion |
| §33 / §33.1 Currency display | DB §D.7 | 406, 407, 419 | 407 | Formatter tests (₹, Indian grouping, leading minus) |
| §34 / .1 / .2 Precision | DB §D, BL §0 | 406, 407 | 406, 407 | Reject-not-round; overflow → IntegrityError |
| §35 Security / no encryption claim | SEC | 405, 903, 916 | 903, 917 | Privacy-text test; release audit |
| §36 Out of scope | — | (nothing built) | 917 | Scope audit |

## 3. User stories

| Story | Tasks | Verified by |
|---|---|---|
| US-001 Record expense | 502 – 508, 511, 606 | 512, 608 |
| US-002 Record income | 502 – 509, 511 | 512, 608 |
| US-003 Savings goal | 708, 710 – 714 | 716 |
| US-004 Understand spending | 601, 603, 607 | 608 |
| US-005 Recommendation | 801 – 810 | 811 |
| US-006 Track budget | 701 – 707, 804 | 716, 811 |
| US-007 Offline | all; 914 audit | 512, 608, 811, 912 |

## 4. Design components → tasks

| Design component | Tasks |
|---|---|
| Layer rules, source tree (SA §A–B, ADR-0001) | 401, 423 |
| Shared lib: Result, IDs, Clock, logger (SA §B.1 row 6) | 404, 405 |
| Error taxonomy + catalog (SA §E) | 405, 413, 421 |
| Money (DB §D, ADR-0002) | 406, 407 |
| Dates (BL §C, ADR-0003) | 408 |
| Db adapter, connection, PRAGMAs (ADR-0004, ADR-0012) | 409, 410 |
| Migrations, backup, legacy guard (DB §J, ADR-0005, ADR-0009) | 411, 412, 911 |
| Tables: `profile` | 412, 422, 901, 902, 904 |
| Tables: `categories`, `payment_methods` | 412, 501 |
| Table: `transactions` (ADR-0008) | 412, 503, 504, 601 |
| Table: `budget_versions` (ADR-0006) | 412, 702 |
| Table: `savings_goals` | 412, 710 |
| Table: `goal_balance_events` (OD-09) | 412, 710 (only if adopted) |
| Recurring `recurring_rules` (DB §H) | TASK-590 (deferred) |
| Stores: session, revision, UI (ST §2) | 414 |
| Stores: period, transaction filter | 604, 510 |
| `useServiceQuery` (ST §3.2) | 415 |
| Theme tokens (UX §A) | 416 |
| Component inventory (UX §J) | 417 – 419, 421, 506, 507, 511, 604 – 607, 705, 713, 714, 809 |
| Routes (NAV §B, ADR-0010) | 420, 422, 508 – 510, 604, 704, 706, 712, 714, 809, 901 – 906 |
| Recommendation engine (RE, ADR-0007) | 801 – 810 |
| Export (SEC §6) | 905, 906 |
| Backup exclusion (SEC §2, ADR-0011) | 907, 908 |
| Testing strategy levels (TS §0–§5) | 402, 410, every task, checkpoints 424/512/608/716/811/917 |

## 5. Requirements without MVP task coverage

| Requirement | Reason | Where tracked |
|---|---|---|
| FR-004 custom categories | MVP+ | TASK-591 |
| FR-018.2 trend/history reports | MVP+ | TASK-690 |
| FR-020 recurring schedules | MVP+, needs own spec | TASK-590, TASK-891 |
| FR-021 notifications | MVP+, needs own spec | TASK-994 |
| FR-022.3 CSV export | MVP+ | TASK-992 |
| FR-023 restore | Deferred, needs own spec | TASK-993 |
| FR-025 app lock | MVP+ | TASK-990 |
| Database encryption | Deferred (§5.1, §35) | TASK-991 |

**No MVP requirement is without implementation tasks.**
