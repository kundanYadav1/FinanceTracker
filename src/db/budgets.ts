import type { Money } from '@/utils/money';
import { getDatabase } from './database';

export type Budget = {
  id: string;
  categoryId: string;
  amount: Money;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetInput = {
  categoryId: string;
  amount: Money;
  periodStart: string;
  periodEnd: string;
};

export type BudgetWithSpending = Budget & {
  spentCents: number;
  status: 'Healthy' | 'Warning' | 'Exceeded';
};

function mapBudgetRow(row: Record<string, unknown>): Budget {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    amount: { currency: String(row.currency ?? 'INR'), cents: Number(row.amount_cents) },
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createBudget(input: BudgetInput): Promise<Budget> {
  const db = await getDatabase();
  const id = `budget_${Date.now()}`;
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO budgets (id, category_id, amount_cents, currency, period_start, period_end, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.categoryId, input.amount.cents, input.amount.currency, input.periodStart, input.periodEnd, now, now]
  );
  return (await getBudget(id)) as Budget;
}

export async function getBudget(id: string): Promise<Budget | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM budgets WHERE id = ?', [id]);
  if (!row) return null;
  return mapBudgetRow(row);
}

export async function getBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM budgets ORDER BY period_start DESC, category_id'
  );
  return rows.map(mapBudgetRow);
}

export async function updateBudget(id: string, input: Partial<BudgetInput>): Promise<Budget | null> {
  const db = await getDatabase();
  const existing = await getBudget(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE budgets
     SET category_id = COALESCE(?, category_id),
         amount_cents = COALESCE(?, amount_cents),
         currency = COALESCE(?, currency),
         period_start = COALESCE(?, period_start),
         period_end = COALESCE(?, period_end),
         updated_at = ?
     WHERE id = ?`,
    [
      input.categoryId ?? existing.categoryId,
      input.amount?.cents ?? existing.amount.cents,
      input.amount?.currency ?? existing.amount.currency,
      input.periodStart ?? existing.periodStart,
      input.periodEnd ?? existing.periodEnd,
      now,
      id,
    ]
  );
  return getBudget(id);
}

export async function deleteBudget(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function getBudgetSpending(categoryId: string, periodStart: string, periodEnd: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(amount_cents) AS total FROM transactions
     WHERE category_id = ? AND type = 'expense' AND date >= ? AND date <= ?`,
    [categoryId, periodStart, periodEnd]
  );
  return row?.total ?? 0;
}

export function computeBudgetStatus(budget: Budget, spentCents: number): BudgetWithSpending {
  const { amount } = budget;
  const utilization = amount.cents > 0 ? spentCents / amount.cents : 0;
  let status: 'Healthy' | 'Warning' | 'Exceeded' = 'Healthy';
  if (spentCents > amount.cents) status = 'Exceeded';
  else if (utilization >= 0.8) status = 'Warning';
  return { ...budget, spentCents, status };
}
