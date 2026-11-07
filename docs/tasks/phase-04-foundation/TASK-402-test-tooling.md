# TASK-402 — Test tooling: multi-timezone runs and coverage gates

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved. (The Node version pin moved to TASK-410, which carries the OD-19 decision.)

## Task Metadata

- **Task ID:** TASK-402
- **Task Name:** Test tooling — multi-timezone runs and coverage gates
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.1 Tooling & conventions
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** none (G0 only)
- **Blocks:** TASK-408, TASK-410, TASK-424
- **PRS References:** NFR-007, NFR-008, FR-019.1, FR-019.2
- **Design References:** TS §0 (tooling, coverage gates, verification commands), TS §1 "Dates" row (3 time zones)

## 1. Objective

Provide the test commands every later task relies on: running the domain suite under three time zones, enforcing coverage thresholds for `src/domain/**` and `src/data/repositories/**`.

## 2. Background and Context

TS §1 requires date tests to run under `America/Los_Angeles`, `Asia/Kolkata` and `Pacific/Kiritimati` "via an npm script". TS §0 sets coverage gates (domain ≥ 95 % lines/branches; repositories ≥ 85 %).

## 3. Requirements

1. `package.json` gains scripts *(proposed names)*:
   - `test:tz` — runs `jest src/domain` (or the paths passed after `--`) three times with `TZ` set to each zone; fails if any run fails. Must work on Windows (Git Bash/PowerShell) and POSIX; use a small Node runner script rather than shell `TZ=` syntax.
   - `test:coverage` — `jest --coverage`.
2. `jest.config.js` gains `coverageThreshold` entries for `./src/domain/` (95/95) and `./src/data/repositories/` (85/85) and `collectCoverageFrom` for `src/**/*.{ts,tsx}` excluding tests and `src/app/**`.
3. Thresholds must not fail while the directories are empty (Jest only enforces path thresholds when files match; verify).
4. Existing `jest-expo` preset, `transformIgnorePatterns` and `moduleNameMapper` stay unchanged.

## 4. Scope

### Included
- Scripts, Jest coverage config, the TZ runner script.

### Excluded
- The SQLite test adapter (TASK-410).
- Any CI pipeline (none exists; see [DG-08](../design-gaps.md)).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `package.json` | MODIFY | `test:tz`, `test:coverage` scripts |
| `jest.config.js` | MODIFY | Coverage thresholds and collection |
| `scripts/run-tz-tests.js` | CREATE *(proposed path)* | Cross-platform runner setting `process.env.TZ` per child process |

## 6. Implementation Instructions

1. Implement `scripts/run-tz-tests.js` with `child_process.spawnSync('npx', ['jest', 'src/domain', ...args], { env: { ...process.env, TZ }, stdio: 'inherit', shell: true })` per zone; exit non-zero on the first failure and print which zone failed.
2. Add a canary test `src/domain/__tz__/tz-canary.test.ts` *(proposed path)* that asserts `process.env.TZ` is honoured (e.g. `new Date(2026, 0, 1).getTimezoneOffset()` differs between Kolkata and Los Angeles runs) so a silently ignored `TZ` is detected. Delete nothing else.
3. Do not edit `package-lock.json` by hand; no dependency is added.

## 7. Dependencies

None besides G0.

## 8. Acceptance Criteria

- [ ] `npm run test:tz` runs the domain suite three times and reports each zone.
- [ ] The canary test proves `TZ` takes effect on this machine (Windows) — or the task report documents that it does not and proposes an alternative.
- [ ] `npm run test:coverage` applies the configured thresholds.
- [ ] `npm test` still passes with the existing snapshot test.

## 9. Testing Requirements

- **Unit Tests:** TZ canary.
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** run `npm run test:tz` on Windows and confirm three runs.

## 10. Verification Commands

```bash
npm test
npm run test:tz
npm run test:coverage
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus: the TZ runner works on the developer's Windows machine; coverage thresholds are active for the two directories.

## 12. Risks and Notes

- Node on Windows honours `TZ` for ICU-based date functions in recent versions, but this must be proven by the canary rather than assumed.
- Coverage thresholds will start failing once domain files exist without tests — intended.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work ([guide §7](../agent-execution-guide.md#7-completion-report-format)).
