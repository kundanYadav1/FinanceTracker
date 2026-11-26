# TASK-910 — Performance validation at 50,000 transactions

> **PROVISIONAL / BLOCKED** — reference device [OD-18](../../design/open-decisions.md#od-18); seeding mechanism for a release build [DG-12](../design-gaps.md).

## Task Metadata

- **Task ID:** TASK-910
- **Task Name:** NFR-001 performance measurement on the reference Android device, with targeted optimisation if needed
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.5 Quality hardening
- **Priority:** HIGH
- **Status:** BLOCKED (OD-18, DG-12)
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-811
- **Blocks:** TASK-912
- **PRS References:** NFR-001, NFR-001.1, NFR-001.2
- **Design References:** DB §I (indexes, search, FTS5 escalation), TS §5 "Performance" row, DEP §4 (FlashList revisit), DEP §5 (release/preview build), ST §3.2

## 1. Objective

Measure, on the agreed reference device with 50,000 stored transactions, that a saved transaction appears in the list within 300 ms and the dashboard fully renders within 1 s; optimise only if a target fails.

## 2. Background and Context

TS §5: seed 50,000 transactions with a dev-only mechanism, measure in a release/preview build, 5 runs, median. DG-12: the design does not specify how a release build gets seeded (scripts cannot write into the app sandbox of a non-debuggable build).

## 3. Requirements

1. Seeding per the DG-12 decision (proposed: a build-time flag `EXPO_PUBLIC_PERF_SEED=1` enabling a hidden seed action only in a dedicated EAS `perf` profile build; never in production).
2. Measure: (a) save → visible in list; (b) cold Home open → all sections rendered (instrument with `performance.now()` marks behind the same flag); (c) search over 50k; 5 runs each, median recorded.
3. If a target fails: identify the slow query via `EXPLAIN QUERY PLAN`/timing; propose the documented escalations (FTS5 for search, FlashList) as a **design change** before implementing.
4. Evidence `docs/tests/performance-nfr-001.md` *(proposed path)* with device, OS, build type, results.

## 4. Scope

### Included
- Seed mechanism (once approved), instrumentation behind a flag, measurement, evidence.

### Excluded
- Unapproved optimisations or dependencies.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/features/dev-tools/**` | CREATE *(proposed path, DG-12)* | Flag-gated seeding |
| `eas.json` | MODIFY *(DG-12)* | `perf` build profile |
| `docs/tests/performance-nfr-001.md` | CREATE *(proposed path)* | Evidence |

## 6. Implementation Instructions

1. Seeded data uses synthetic values only (AGENTS.md §15).
2. Verify the production profile does not include the seed code path (flag false → code tree-shaken or unreachable).

## 7. Dependencies

- TASK-811 (feature-complete app).

## 8. Acceptance Criteria

- [ ] Median save-to-visible ≤ 300 ms.
- [ ] Median dashboard full render ≤ 1 s.
- [ ] Results recorded with device/build details.
- [ ] Production build contains no reachable seed action.

## 9. Testing Requirements

- **Manual Verification:** device measurements.

## 10. Verification Commands

```bash
npm test
npx tsc --noEmit
npx expo lint
eas build --profile perf --platform android
```

## 11. Definition of Done

Targets met with evidence, or failures reported with a proposed design change.

## 12. Risks and Notes

- Requires access to the physical reference device (OD-18).

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
