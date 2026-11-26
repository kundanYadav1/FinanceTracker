# ADR-0007 — Recommendations computed on demand, not persisted

**Status:** Proposed (2026-11-06)

## Context
- FR-012.2: recommendations are calculated from current local data each time they are displayed, and reflect changes immediately.
- FR-012.3 and §36: there is no dismiss or snooze in the MVP.
- There are no notifications in the MVP.

## Decision
A pure engine (`domain/recommendations`) runs on a snapshot of aggregates whenever the dashboard or the recommendations screen needs it. There is no table and no read or dismissed state.

Each result carries:
- a deterministic key (`ruleId:subject:month`)
- the rule ID and rule version
- the facts used
- the condition text

## Alternatives
- **Persist generated recommendations:** only needed for dismissal, history or notifications, all of which are out of MVP scope. It would also need invalidation logic and could show stale advice.

## Consequences
- \+ Recommendations always match current data, need no storage or migrations, and are simple to test.
- − Adding dismissal later will need a small `recommendation_dismissals(key, dismissed_at)` table keyed by the deterministic key. The key format already supports this.
