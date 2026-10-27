import type { Money } from '@/utils/money';
import { getDatabase } from './database';

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: Money;
  currentAmount: Money;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  updatedAt: string;
};

export type SavingsGoalInput = {
  name: string;
  targetAmount: Money;
  currentAmount: Money;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
};

export type SavingsGoalWithProgress = SavingsGoal & {
  remainingCents: number;
  progressPercent: number;
  requiredMonthlySaving: number | null;
  onTrack: boolean;
};

function mapGoalRow(row: Record<string, unknown>): SavingsGoal {
  return {
    id: String(row.id),
    name: String(row.name),
    targetAmount: { currency: String(row.currency ?? 'INR'), cents: Number(row.target_amount_cents) },
    currentAmount: { currency: String(row.currency ?? 'INR'), cents: Number(row.current_amount_cents) },
    targetDate: String(row.target_date),
    priority: (row.priority as 'low' | 'medium' | 'high') ?? 'medium',
    status: (row.status as 'active' | 'completed' | 'expired') ?? 'active',
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createGoal(input: SavingsGoalInput): Promise<SavingsGoal> {
  const db = await getDatabase();
  const id = `goal_${Date.now()}`;
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO savings_goals (id, name, target_amount_cents, current_amount_cents, currency, target_date, priority, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.targetAmount.cents,
      input.currentAmount.cents,
      input.targetAmount.currency,
      input.targetDate,
      input.priority,
      'active',
      now,
      now,
    ]
  );
  return (await getGoal(id)) as SavingsGoal;
}

export async function getGoal(id: string): Promise<SavingsGoal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM savings_goals WHERE id = ?', [id]);
  if (!row) return null;
  return mapGoalRow(row);
}

export async function getGoals(): Promise<SavingsGoal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM savings_goals ORDER BY priority DESC, target_date'
  );
  return rows.map(mapGoalRow);
}

export async function updateGoal(id: string, input: Partial<SavingsGoalInput>): Promise<SavingsGoal | null> {
  const db = await getDatabase();
  const existing = await getGoal(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE savings_goals
     SET name = COALESCE(?, name),
         target_amount_cents = COALESCE(?, target_amount_cents),
         current_amount_cents = COALESCE(?, current_amount_cents),
         currency = COALESCE(?, currency),
         target_date = COALESCE(?, target_date),
         priority = COALESCE(?, priority),
         updated_at = ?
     WHERE id = ?`,
    [
      input.name ?? existing.name,
      input.targetAmount?.cents ?? existing.targetAmount.cents,
      input.currentAmount?.cents ?? existing.currentAmount.cents,
      input.targetAmount?.currency ?? existing.targetAmount.currency,
      input.targetDate ?? existing.targetDate,
      input.priority ?? existing.priority,
      now,
      id,
    ]
  );
  return getGoal(id);
}

export async function deleteGoal(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM savings_goals WHERE id = ?', [id]);
  return result.changes > 0;
}

export function computeGoalProgress(goal: SavingsGoal): SavingsGoalWithProgress {
  const { targetAmount, currentAmount } = goal;
  const remainingCents = Math.max(0, targetAmount.cents - currentAmount.cents);
  const progressPercent = targetAmount.cents > 0 ? Math.round((currentAmount.cents / targetAmount.cents) * 100) : 0;
  const completed = currentAmount.cents >= targetAmount.cents;

  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const monthsRemaining = Math.max(0, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()));
  const requiredMonthlySaving = monthsRemaining > 0 && !completed ? remainingCents / monthsRemaining : null;

  let onTrack = false;
  if (!completed && requiredMonthlySaving != null) {
    onTrack = currentAmount.cents >= 0; // simplified: user is actively tracking
  }

  return {
    ...goal,
    remainingCents,
    progressPercent,
    requiredMonthlySaving,
    onTrack,
    status: completed ? 'completed' : goal.status,
  };
}
