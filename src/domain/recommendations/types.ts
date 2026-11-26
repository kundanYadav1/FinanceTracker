import type { Category } from '@/db/seed';
import type { SavingsGoal } from '@/db/goals';
import type { Transaction } from '@/db/transactions';
import type { BudgetVersion } from '@/domain/budget';

export type RuleId = 'BUD-OVER' | 'BUD-WARN' | 'ANOM-DISC' | 'ANOM-INFO' | 'GAP' | 'GAP-INFO';
export type Priority = 'high' | 'medium' | 'low';

export type Metric = { label: string; display: string };

export type Subject =
  | { type: 'category'; categoryId: string }
  | { type: 'budget'; scopeKey: string }
  | { type: 'goals' };

/**
 * One explainable result. `insight` is facts only; `suggestion` may carry a suggested action.
 * Recommendations are computed on demand and never stored, so there is no read/dismissed state.
 */
export type Recommendation = {
  /** `${ruleId}:${subject}:${month}`, deterministic within an evaluation. */
  key: string;
  ruleId: RuleId;
  ruleVersion: number;
  kind: 'suggestion' | 'insight';
  priority: Priority;
  subject: Subject;
  /** Evaluated month, `YYYY-MM` (the current, incomplete month). */
  month: string;
  title: string;
  /** Observed facts, in plain past/present-perfect language. */
  reason: string;
  supportingMetrics: Metric[];
  /** Conditional wording ("Consider…"); null for insights. */
  suggestedAction: string | null;
  /** Neutral note shown instead of an action, e.g. "This may be expected". */
  note: string | null;
  /** Always an upper bound estimate, never a promise. */
  potentialSavings: { upToCents: number; basis: string } | null;
  explanation: { ruleName: string; condition: string };
  /** `YYYY-MM-DD` used as "today" for the evaluation. */
  evaluatedOn: string;
  /** Sort magnitude in minor units (overspend, gap, excess, …). */
  magnitude: number;
};

export type Notice = {
  id: 'NEEDS_HISTORY' | 'NO_GOALS_OR_BUDGETS' | 'ALL_CLEAR';
  text: string;
};

export type EngineResult = { recommendations: Recommendation[]; notices: Notice[] };

export type RecommendationInput = {
  now: Date;
  transactions: Transaction[];
  categories: Category[];
  budgetVersions: BudgetVersion[];
  goals: SavingsGoal[];
};
