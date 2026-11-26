# TASK-401 — Layer boundary lint rules and source-tree conventions

> **PROVISIONAL** — Gate G0 closed (OD-01; design Provisional; ADRs Proposed). Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-401
- **Task Name:** Layer boundary lint rules and source-tree conventions
- **Implementation Phase:** 4 — Application Foundation
- **Feature:** F4.1 Tooling & conventions
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** SMALL
- **Dependencies:** none (G0 only)
- **Blocks:** TASK-404, TASK-424
- **PRS References:** NFR-007, §35, FR-027.3
- **Design References:** SA §A.2 (rules 1–4), SA §B.1, SA §B.2 (import-rules table), SEC §4, ADR-0001

## 1. Objective

Make the approved layer rules machine-enforced before any new layer code exists, so every later task fails lint if it breaks the architecture.

## 2. Background and Context

ADR-0001 adopts a layered, feature-based architecture with a pure domain core. SA §B.2 states that the import rules are "enforced by ESLint `no-restricted-imports` in a BUILD task" — this is that task. SEC §4 requires `no-console` everywhere except the logger.

## 3. Requirements

1. ESLint rules implement the SA §B.2 import table exactly:
   - `src/domain/**` may not import React, `react-native`, any `expo-*`, `expo-sqlite`, `src/data/**`, `src/features/**`, `src/app/**`, `src/shared/**` except `@/shared/lib/result`. `date-fns` and `zod` are allowed.
   - `src/data/**` may not import `src/features/**`, `src/app/**`, React, or `src/shared/{ui,store}`.
   - `src/shared/**` may not import `src/features/**`, `src/app/**`, `src/data/**`; `src/shared/ui/**` may import `@/domain/format` and domain types.
   - `src/features/**` may not import `src/app/**`; may import another feature only through its `index.ts`; may import `src/data/**` only from `services/`.
   - `src/app/**` may import features only through `index.ts`, may not import `src/data/**`.
2. `no-console: error` for all of `src/**` except `src/shared/lib/logger.ts`.
3. Rules apply to the new directories only; legacy draft files (`src/db/**`, `src/store/**`, `src/utils/**`, `src/components/**`) are excluded until TASK-423 deletes them.
4. A short `src/README.md` *(proposed path)* documents the layer map and links to SA §B.

## 4. Scope

### Included
- `eslint.config.js` rule blocks (flat config, `eslint-config-expo/flat` remains the base).
- A lint fixture test proving each forbidden import is reported.

### Excluded
- Creating any layer source files (later tasks).
- Changing `tsconfig.json` path aliases (already correct: `@/*` → `src/*`).
- Deleting legacy files (TASK-423).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `eslint.config.js` | MODIFY | Add `no-restricted-imports` per layer and `no-console` |
| `src/README.md` | CREATE *(proposed path)* | Layer map and rules for agents |
| `tests/lint/layer-rules.test.ts` | CREATE *(proposed path)* | Runs ESLint's Node API on inline fixture code and asserts violations |

## 6. Implementation Instructions

1. Read SA §B.2 import table. Translate each ✗ cell into a `no-restricted-imports` `patterns` entry scoped with `files:` globs.
2. Cover both alias (`@/data/...`) and relative (`../../data/...`) forms; prefer `patterns` with `group` globs.
3. Add `no-console` with an override that turns it off for `src/shared/lib/logger.ts`.
4. Add an `ignores`/override for legacy draft paths listed in §3.3 so the current code base still lints clean.
5. Write the lint test using `new ESLint({ overrideConfigFile: 'eslint.config.js' }).lintText(code, { filePath })` for one allowed and one forbidden import per row of the table.
6. Do not add ESLint plugins; core `no-restricted-imports` is sufficient.

## 7. Dependencies

None. This is the first task after G0 so that every subsequent file is checked.

## 8. Acceptance Criteria

- [ ] `npx expo lint` passes on the current repository.
- [ ] A file under `src/domain/` importing `react-native` or `@/data/...` produces a lint error.
- [ ] A file under `src/app/` importing `@/data/...` produces a lint error.
- [ ] A feature importing another feature's non-`index` file produces a lint error.
- [ ] `console.log` in any `src/` file other than the logger produces a lint error.
- [ ] The lint test covers every row of the SA §B.2 table.

## 9. Testing Requirements

- **Unit Tests:** `tests/lint/layer-rules.test.ts` — one allowed + one forbidden case per layer row.
- **Integration Tests:** not required.
- **UI Tests:** not required.
- **Manual Verification:** run `npx expo lint` and confirm zero errors on the unchanged code base.

## 10. Verification Commands

```bash
npx expo lint
npx jest tests/lint
npx tsc --noEmit
```

## 11. Definition of Done

Global DoD ([agent-execution-guide §6](../agent-execution-guide.md#6-definition-of-done-global)) plus: every SA §B.2 rule has a passing fixture test; no legacy file was modified.

## 12. Risks and Notes

- `eslint-config-expo` already sets some `import/*` rules; check for conflicts before adding patterns.
- The legacy-path exclusion must be removed by TASK-423; TASK-423 lists this.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status (each box) · Remaining work. See [agent-execution-guide §7](../agent-execution-guide.md#7-completion-report-format).
