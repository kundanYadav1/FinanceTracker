import {
  type BudgetScope,
  type BudgetVersion,
  scopeKeyFor,
  validateBudgetAmount,
} from '@/domain/budget';
import { getDatabase } from './database';

function mapRow(row: Record<string, unknown>): BudgetVersion {
  return {
    id: String(row.id),
    scope: row.scope as BudgetScope,
    categoryId: row.category_id == null ? null : String(row.category_id),
    scopeKey: String(row.scope_key),
    effectiveFromMonth: String(row.effective_from_month),
    amountCents: row.amount_cents == null ? null : Number(row.amount_cents),
    currency: String(row.currency ?? 'INR'),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function newId(): string {
  return `bv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getBudgetVersions(): Promise<BudgetVersion[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM budget_versions ORDER BY scope_key, effective_from_month',
  );
  return rows.map(mapRow);
}

type SetBudgetInput = {
  scope: BudgetScope;
  categoryId: string | null;
  /** Calendar month `YYYY-MM` the budget starts applying. */
  month: string;
  amountCents: number;
  currency: string;
};

/**
 * Create or change a budget from `month` onward. One row per scope and month; any later versions are
 * dropped so the new amount really applies from here on.
 */
export async function setBudgetVersion(input: SetBudgetInput): Promise<void> {
  const problem = validateBudgetAmount(input.amountCents);
  if (problem) throw new Error(problem);
  if (input.scope === 'category' && !input.categoryId) throw new Error('Pick a category.');
  const db = await getDatabase();
  if (input.scope === 'category') {
    const category = await db.getFirstAsync<{ type: string }>('SELECT type FROM categories WHERE id = ?', [
      input.categoryId,
    ]);
    if (category?.type !== 'expense') throw new Error('Budgets can only be set on expense categories.');
  }
  const scopeKey = scopeKeyFor(input.scope, input.categoryId);
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM budget_versions WHERE scope_key = ? AND effective_from_month > ?', [
      scopeKey,
      input.month,
    ]);
    await db.runAsync(
      `INSERT INTO budget_versions
         (id, scope, category_id, scope_key, effective_from_month, amount_cents, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(scope_key, effective_from_month)
       DO UPDATE SET amount_cents = excluded.amount_cents, currency = excluded.currency, updated_at = excluded.updated_at`,
      [
        newId(),
        input.scope,
        input.scope === 'category' ? input.categoryId : null,
        scopeKey,
        input.month,
        input.amountCents,
        input.currency,
        now,
        now,
      ],
    );
  });
}

/**
 * Remove a budget from `month` onward. Earlier months keep their amount, so with prior history this
 * writes a "no budget" version; otherwise the row is simply deleted.
 */
export async function removeBudgetVersion(
  scope: BudgetScope,
  categoryId: string | null,
  month: string,
  currency: string,
): Promise<void> {
  const db = await getDatabase();
  const scopeKey = scopeKeyFor(scope, categoryId);
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM budget_versions WHERE scope_key = ? AND effective_from_month > ?', [
      scopeKey,
      month,
    ]);
    const earlier = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM budget_versions WHERE scope_key = ? AND effective_from_month < ? AND amount_cents IS NOT NULL',
      [scopeKey, month],
    );
    if ((earlier?.n ?? 0) > 0) {
      await db.runAsync(
        `INSERT INTO budget_versions
           (id, scope, category_id, scope_key, effective_from_month, amount_cents, currency, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
         ON CONFLICT(scope_key, effective_from_month)
         DO UPDATE SET amount_cents = NULL, updated_at = excluded.updated_at`,
        [newId(), scope, scope === 'category' ? categoryId : null, scopeKey, month, currency, now, now],
      );
    } else {
      await db.runAsync('DELETE FROM budget_versions WHERE scope_key = ? AND effective_from_month = ?', [
        scopeKey,
        month,
      ]);
    }
  });
}
