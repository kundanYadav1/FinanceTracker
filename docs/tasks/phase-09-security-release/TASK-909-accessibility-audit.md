# TASK-909 — Accessibility audit and remediation

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-909
- **Task Name:** Accessibility audit (automated tree checks + TalkBack/VoiceOver + largest font) and remediation
- **Implementation Phase:** 9 — Security, Backup & Release
- **Feature:** F9.5 Quality hardening
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-811, TASK-902, TASK-903, TASK-904, TASK-906
- **Blocks:** TASK-912, TASK-913
- **PRS References:** NFR-006, NFR-006.1, FR-003A.9
- **Design References:** UX §A (contrast, targets, typography, status icons), UX §I (toast announcements), TS §3 "Accessibility" row, TS §5 (TalkBack/VoiceOver, largest font)

## 1. Objective

Verify every MVP screen against WCAG 2.2 AA mobile principles and fix defects found.

## 2. Background and Context

Component-level checks exist per task (`expectAccessible`). This task audits complete screens and real devices.

## 3. Requirements

1. Automated: a test renders every route screen (with fixture data and empty data) and runs `expectAccessible`; re-run the token contrast test.
2. Manual Android TalkBack pass over: onboarding, add/edit/delete transaction, history + filters, dashboard, budgets, goals, recommendations, reports, settings, export, delete all data.
3. Largest system font: amounts never truncated; summary rows stack.
4. Errors identify field and problem in text (not color).
5. Remediation: fix defects in the owning component; if a fix changes a design token or behaviour, stop and report (design change).
6. Evidence `docs/tests/accessibility-audit.md` *(proposed path)*.

## 4. Scope

### Included
- Audit, fixes limited to a11y attributes/layout wrapping, evidence.

### Excluded
- iOS VoiceOver pass (TASK-913) unless macOS is available.

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `tests/a11y/screens.test.tsx` | CREATE *(proposed path)* | Whole-screen checks |
| Affected `src/**/components/*.tsx` | MODIFY | Remediation |
| `docs/tests/accessibility-audit.md` | CREATE *(proposed path)* | Evidence |

## 6. Implementation Instructions

1. Record each finding with screen, issue, fix, and verification.

## 7. Dependencies

- All UI complete (TASK-811, 902 – 906).

## 8. Acceptance Criteria

- [ ] Automated screen test passes for all routes.
- [ ] TalkBack pass completed with no blocking issue.
- [ ] Largest-font pass completed.
- [ ] Every finding fixed or ticketed with an owner task.

## 9. Testing Requirements

- **UI Tests:** automated screen sweep. **Manual:** TalkBack, font scale.

## 10. Verification Commands

```bash
npx jest tests/a11y
npm test
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD plus evidence document.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
