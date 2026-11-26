import { buildContext, type Context } from './context';
import { anomalyRules } from './rules/anomaly';
import { budgetOverRules, budgetWarnRules } from './rules/budget';
import { gapRules } from './rules/gap';
import { HISTORY_MONTHS_REQUIRED, RULE_RANK } from './thresholds';
import type { EngineResult, Notice, Priority, Recommendation, RecommendationInput } from './types';

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function compareRecommendations(a: Recommendation, b: Recommendation): number {
  return (
    PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
    RULE_RANK[a.ruleId] - RULE_RANK[b.ruleId] ||
    b.magnitude - a.magnitude ||
    (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  );
}

/**
 * One card per subject: a budget card absorbs the anomaly for the same category (facts and, when
 * it is a spend-less suggestion, the potential saving). Rules never call each other; this is the
 * only place results are combined.
 */
function mergeAndEscalate(ctx: Context, rules: { budget: Recommendation[]; anomaly: Recommendation[]; gap: Recommendation[] }) {
  const gap = rules.gap.find((r) => r.ruleId === 'GAP') ?? null;
  const discAnomalies = rules.anomaly.filter((r) => r.ruleId === 'ANOM-DISC');

  const budgets = rules.budget.map((b) => ({ ...b }));
  const standalone: Recommendation[] = [];
  for (const a of rules.anomaly) {
    const categoryId = a.subject.type === 'category' ? a.subject.categoryId : null;
    const target = budgets.find((b) => b.subject.type === 'budget' && b.subject.scopeKey === categoryId);
    if (!target) {
      standalone.push(a.ruleId === 'ANOM-DISC' && gap ? { ...a, priority: 'high' } : a);
      continue;
    }
    target.supportingMetrics = [...target.supportingMetrics, ...a.supportingMetrics.filter((m) => !target.supportingMetrics.some((t) => t.label === m.label))];
    target.reason = `${target.reason} ${a.reason}`;
    if (a.potentialSavings && target.kind === 'suggestion') target.potentialSavings = a.potentialSavings;
    target.explanation = { ...target.explanation, condition: `${target.explanation.condition} ${a.explanation.condition}` };
  }

  const gapOut = gap && discAnomalies.length
    ? [
        {
          ...gap,
          potentialSavings: {
            upToCents: discAnomalies.reduce((s, a) => s + (a.potentialSavings?.upToCents ?? 0), 0),
            basis: `spending above your usual level in ${discAnomalies.map((a) => (a.subject.type === 'category' ? ctx.categoryName(a.subject.categoryId) : '')).join(', ')}`,
          },
        },
      ]
    : rules.gap;

  return [...budgets, ...standalone, ...gapOut];
}

function buildNotices(ctx: Context, hasRecommendations: boolean): Notice[] {
  const notices: Notice[] = [];
  if (ctx.historyMonths < HISTORY_MONTHS_REQUIRED) {
    notices.push({
      id: 'NEEDS_HISTORY',
      text: `Spending comparisons need ${HISTORY_MONTHS_REQUIRED} complete months of history. You have ${ctx.historyMonths}.`,
    });
  }
  if (ctx.budgetLines.length === 0 && ctx.portfolio.goals.length === 0) {
    notices.push({ id: 'NO_GOALS_OR_BUDGETS', text: 'Add a budget or a savings goal to get more suggestions.' });
  }
  if (ctx.historyMonths >= HISTORY_MONTHS_REQUIRED && !hasRecommendations) {
    notices.push({ id: 'ALL_CLEAR', text: 'Nothing needs your attention right now.' });
  }
  return notices;
}

/**
 * Deterministic, explainable recommendations for the current calendar month, computed from the
 * data passed in. Same input, same output; nothing is stored (ADR-0007).
 */
export function evaluateRecommendations(input: RecommendationInput): EngineResult {
  const ctx = buildContext(input);
  const merged = mergeAndEscalate(ctx, {
    budget: [...budgetOverRules(ctx), ...budgetWarnRules(ctx)],
    anomaly: anomalyRules(ctx),
    gap: gapRules(ctx),
  });
  const recommendations = merged.sort(compareRecommendations);
  return { recommendations, notices: buildNotices(ctx, recommendations.length > 0) };
}
