# Spec: Local notifications (FR-021, MVP+)

## Types
| Type | Trigger | Default | Dedupe key |
|---|---|---|---|
| Daily expense reminder | Local daily trigger at `dailyTime` (default 20:00) | on | none (rescheduled) |
| Budget warning | Budget line reaches Warning (80%) or Exceeded | on | `budget:{scopeKey}:{month}:{status}` |
| Goal reminder | Active goal is At risk / Behind | on | `goalrem:{goalId}:{ISO week}` (max weekly) |
| Monthly summary | Local trigger on day 1 at 09:00 | on | none (repeating) |
| Savings achievement | Goal reaches 25/50/75/100% | on | `ach:{goalId}:{milestone}` |

Maps to FR-021: daily reminder = "incomplete expense tracking"; achievement = "goal milestones".

## Rules
- **Privacy:** notification text never contains amounts, goal or category names beyond generic wording. Goal and category names are also omitted (lock-screen safe).
- **Permission:** requested once at first launch. Every type is individually toggleable in Settings. If denied, Settings shows a blocked state.
- **Daily reminder** is suppressed for today when an expense is already logged (rescheduled to tomorrow).
- **Data-driven types** are evaluated on app open, after budget/goal/transaction changes, and by a periodic Android WorkManager task (`expo-background-task`, ~12h minimum, OS-controlled).
- Fired notices are recorded in `notification_log`; a dedupe key never fires twice.
- Local only; no push, no backend.
