# ADR-0004 — SQLite as the single source of truth; Zustand for UI state only

**Status:** Proposed (2026-11-06)

## Context
The draft `appStore` loads every transaction into Zustand and computes totals in JavaScript. That duplicates the database, does not scale to 50,000 transactions (NFR-001.1), and can show state that was never saved. The design brief requires that Zustand not become a second database.

## Decision
- Persistent financial data lives only in SQLite. Each screen reads it through query hooks that run SQL aggregates and then domain functions.
- Zustand holds:
  - the session (database status, profile snapshot)
  - one revision counter per topic
  - the selected period and transaction filters
  - transient UI state

  It uses no `persist` middleware.
- Services bump revision counters after COMMIT. Hooks re-query when their topics change, when the screen gains focus, and when the calendar day changes. There are no optimistic updates.
- Data loading uses an internal `useServiceQuery` hook instead of TanStack Query.

## Alternatives
- **Keep the in-memory store as a cache (current draft):** rejected for scale and consistency.
- **TanStack Query:** capable, but its strengths (network cache, retries) are not needed, and it adds a dependency.
- **An event emitter instead of a revision store:** equivalent, but less observable from React.

## Consequences
- \+ There is one source of truth. What is shown is always what was saved, and memory use stays bounded.
- − Each screen pays a small query cost when it gains focus. Covering indexes keep this cheap.
