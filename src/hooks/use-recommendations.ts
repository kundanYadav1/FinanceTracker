import { useMemo } from 'react';

import { toDateKey } from '@/domain/overview';
import { evaluateRecommendations, type EngineResult } from '@/domain/recommendations';
import { useAppStore } from '@/store/appStore';

/**
 * Recommendations for the current month, recomputed whenever transactions, budgets, goals or the
 * calendar day change (FR-012.2). Independent of any dashboard period.
 */
export function useRecommendations(): EngineResult {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const budgetVersions = useAppStore((s) => s.budgetVersions);
  const goals = useAppStore((s) => s.goals);
  const day = toDateKey(new Date());

  return useMemo(() => {
    const [y, m, d] = day.split('-').map(Number);
    return evaluateRecommendations({ now: new Date(y, m - 1, d), transactions, categories, budgetVersions, goals });
  }, [transactions, categories, budgetVersions, goals, day]);
}
