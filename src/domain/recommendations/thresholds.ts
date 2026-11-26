export { BUDGET_WARNING_PERCENT } from '@/domain/budget';
export { AT_RISK_COVERAGE_PERCENT } from '@/domain/goals';

/** Month-to-date spending must be at least this much above the 3-month average to count as an anomaly. */
export const ANOMALY_MIN_INCREASE_PERCENT = 20;
/** ...and at least this many minor units above it (Rs 500), to ignore trivial categories. */
export const ANOMALY_MIN_EXCESS_CENTS = 50_000;
/** Complete months of history that comparison rules need (FR-013.2). */
export const HISTORY_MONTHS_REQUIRED = 3;
/** Recommendations shown on the dashboard (FR-012.3). */
export const DASHBOARD_MAX = 3;
/** Discretionary categories named in a savings-gap suggestion. */
export const GAP_TOP_CATEGORIES = 3;
/** Bump when a rule's thresholds or wording change. */
export const RULE_VERSION = 1;

export const RULE_RANK = {
  'BUD-OVER': 1,
  GAP: 2,
  'ANOM-DISC': 3,
  'BUD-WARN': 4,
  'ANOM-INFO': 5,
  'GAP-INFO': 6,
} as const;
