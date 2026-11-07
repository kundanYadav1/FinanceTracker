# ADR-0001 — Layered, feature-based architecture with a pure domain core

**Status:** Proposed (2026-11-06)

## Context
AGENTS.md requires the flow UI → hook/store → service → repository → database, with no financial logic in components (§8, §10). The draft code mixes these layers: screens compute totals, and repositories hold calculators. Implementation will be done by AI agents working on small tasks, so module boundaries must be obvious and local. NFR-008 requires calculations to be testable without rendering UI.

## Decision
Feature modules (`src/features/<feature>/{components,hooks,services}`) sit on top of a shared, pure `src/domain` and a `src/data` repository layer.
- Dependencies point inward.
- `domain` imports no React, expo or SQLite code, and takes `today` as a parameter.
- Repositories are plain async functions over an injected `Db` interface.
- Services return `Result<T, AppError>`.
- ESLint `no-restricted-imports` enforces the boundaries.

Details: [system-architecture](../design/system-architecture.md).

## Alternatives
- **Full Clean Architecture** (ports and adapters, DI container, interactor classes): rejected as excessive for a single-source offline app.
- **Screen-centric (current draft):** rejected; it violates AGENTS.md §8 and §10 and is hard to test.
- **Domain logic inside each feature:** rejected; recommendations, dashboard and goals share calculators, which would create cross-feature imports.

## Consequences
- \+ The financial core is fully unit-testable, and agents can work in one feature folder at a time.
- \+ Swapping storage (e.g. SQLCipher) touches only `data/db`.
- − More files than the draft, and the boundaries need discipline and lint rules.
- − The draft code must be migrated incrementally (BUILD tasks).
