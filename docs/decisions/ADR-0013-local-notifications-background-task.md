# ADR-0013: Local notifications via expo-notifications and expo-background-task

Status: Proposed

## Decision
- Fixed-time notices (daily reminder, monthly summary) use `expo-notifications` repeating local triggers.
- Data-driven notices (budget warning, goal reminder, achievement) are computed by a pure planner (`src/domain/notifications`) over SQLite data and posted by an adapter. The adapter runs on app open, after data changes, and from a periodic `expo-background-task` (WorkManager on Android).
- Notification text contains no amounts or names (lock-screen privacy). All types default on; permission is requested at first launch.

## Why
WorkManager timing is not exact, so exact-time notices use triggers. A pure planner keeps the logic testable and deterministic (AGENTS.md).

## Consequences
Requires a dev-client rebuild. iOS background execution is best-effort. FR-021, FR-025.1, TASK-994 and OD-17 are superseded where they conflict.
