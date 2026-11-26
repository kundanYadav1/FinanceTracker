# TASK-809 — Recommendation cards, list and detail screens

> **PROVISIONAL** — Gate G0 closed. Do not execute until approved.

## Task Metadata

- **Task ID:** TASK-809
- **Task Name:** `RecommendationCard`, `NoticeCard`, `/recommendations` list and `/recommendations/[key]` detail
- **Implementation Phase:** 8 — Recommendation Engine
- **Feature:** F8.5 Recommendation delivery
- **Priority:** HIGH
- **Status:** NOT STARTED
- **Estimated Complexity:** MEDIUM
- **Dependencies:** TASK-418, TASK-419, TASK-420, TASK-808
- **Blocks:** TASK-810
- **PRS References:** FR-012.1, FR-012.3 (no dismiss), FR-017, FR-017.1, §32, NFR-006.1, US-005
- **Design References:** UX §F (card, detail sections, list, no dismiss), NAV §B (`recommendations/index.tsx`, `[key].tsx`), NAV §B notes ("no longer applies"), TS §3 `RecommendationCard`/detail row

## 1. Objective

Display recommendations transparently: facts separated from suggestions, potential savings as estimates, and a "Why am I seeing this?" explanation.

## 2. Background and Context

UX §F: card with priority indicator (bar + icon + text), kind label, title, first sentence of reason, potential-savings chip. Detail sections: What we noticed (reason + metrics table), What you could do (suggestions only), Potential savings (with basis), Why am I seeing this? (rule name + condition), footer disclaimer "Suggestions are based only on data you entered. They're estimates, not financial advice." No dismiss control.

## 3. Requirements

1. Components: `RecommendationCard`, `RecommendationDetail`, `NoticeCard`.
2. Routes: list (all ranked recommendations then notices); detail by `key` (validated non-empty), re-computed on open; missing key → "This suggestion no longer applies" + link back.
3. Insights render no action section and no potential-savings section.
4. No dismiss/snooze/read UI anywhere.

## 4. Scope

### Included
- Components, two routes, screens, tests.

### Excluded
- Dashboard section (TASK-810).

## 5. Files to Create or Modify

| File Path | Action | Purpose |
|---|---|---|
| `src/app/recommendations/index.tsx`, `src/app/recommendations/[key].tsx` | CREATE | Routes |
| `src/features/recommendations/components/RecommendationCard.tsx`, `RecommendationDetail.tsx`, `NoticeCard.tsx` | CREATE | UX §J |
| `src/features/recommendations/components/RecommendationsScreen.tsx`, `RecommendationDetailScreen.tsx` | CREATE | Screens |
| `src/features/recommendations/index.ts` | MODIFY | Exports |
| tests alongside | CREATE | Component tests |

## 6. Implementation Instructions

1. `[key]` contains `:` characters — encode/decode with `encodeURIComponent` in links.

## 7. Dependencies

- TASK-418, TASK-419, TASK-420, TASK-808.

## 8. Acceptance Criteria (TS §3 row)

- [ ] Priority text present on every card.
- [ ] Insight renders no action and no potential savings.
- [ ] Potential savings shows "Up to … (estimate)".
- [ ] "Why am I seeing this?" shows rule name and condition.
- [ ] Stale key shows "This suggestion no longer applies".
- [ ] No dismiss control exists.

## 9. Testing Requirements

- **UI Tests:** acceptance items + `expectAccessible`.
- **Integration Tests:** TASK-811.
- **Manual Verification:** Android.

## 10. Verification Commands

```bash
npx jest src/features/recommendations
npx tsc --noEmit
npx expo lint
```

## 11. Definition of Done

Global DoD.

## 12. Risks and Notes

- None.

## 13. Completion Report Format

Files created · Files modified · Implementation summary · Tests executed · Tests passed · Tests failed · Known issues · Acceptance criteria status · Remaining work.
