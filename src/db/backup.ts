import {
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  type BackupFile,
} from '@/domain/export/backup';
import type { CsvTransaction } from '@/domain/export/csv';
import type { MigratableDb } from './migrate';
import { SCHEMA_VERSION } from './schema';

export type BackupDb = MigratableDb & {
  runAsync(sql: string, params?: unknown): Promise<unknown>;
};

type Row = Record<string, unknown>;

const str = (v: unknown) => String(v);
const strOrNull = (v: unknown) => (v === null || v === undefined || v === '' ? null : String(v));

/** Reads every portable table in one transaction so the snapshot is internally consistent. */
export async function readSnapshot(db: BackupDb, appVersion: string, now = new Date()): Promise<BackupFile> {
  let snapshot: BackupFile | undefined;
  await db.withTransactionAsync(async () => {
    const profile = await db.getFirstAsync<Row>("SELECT name, currency FROM profiles WHERE id = 'default'");
    const notif = await db.getFirstAsync<Row>("SELECT * FROM notification_settings WHERE id = 'default'");
    const [categories, methods, transactions, budgets, goals] = await Promise.all([
      db.getAllAsync<Row>('SELECT * FROM categories ORDER BY id'),
      db.getAllAsync<Row>('SELECT * FROM payment_methods ORDER BY id'),
      db.getAllAsync<Row>('SELECT * FROM transactions ORDER BY date, id'),
      db.getAllAsync<Row>('SELECT * FROM budget_versions ORDER BY scope_key, effective_from_month'),
      db.getAllAsync<Row>('SELECT * FROM savings_goals ORDER BY id'),
    ]);

    snapshot = {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_FORMAT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now.toISOString(),
      appVersion,
      profile: profile ? { name: str(profile.name), currency: str(profile.currency) } : null,
      categories: categories.map((c) => ({
        id: str(c.id),
        type: c.type as 'expense' | 'income',
        name: str(c.name),
        color: str(c.color),
        isDefault: Number(c.is_default) === 1,
      })),
      paymentMethods: methods.map((m) => ({ id: str(m.id), name: str(m.name), isDefault: Number(m.is_default) === 1 })),
      transactions: transactions.map((t) => ({
        id: str(t.id),
        type: t.type as 'expense' | 'income',
        amountMinor: Number(t.amount_cents),
        currency: str(t.currency),
        categoryId: str(t.category_id),
        paymentMethodId: strOrNull(t.payment_method_id),
        date: str(t.date),
        note: strOrNull(t.note),
        isRecurring: Number(t.is_recurring) === 1,
        createdAt: str(t.created_at),
        updatedAt: str(t.updated_at),
      })),
      budgetVersions: budgets.map((b) => ({
        id: str(b.id),
        scope: b.scope as 'overall' | 'category',
        categoryId: strOrNull(b.category_id),
        effectiveFromMonth: str(b.effective_from_month),
        amountMinor: b.amount_cents === null || b.amount_cents === undefined ? null : Number(b.amount_cents),
        currency: str(b.currency),
        createdAt: str(b.created_at),
        updatedAt: str(b.updated_at),
      })),
      savingsGoals: goals.map((g) => ({
        id: str(g.id),
        name: str(g.name),
        targetAmountMinor: Number(g.target_amount_cents),
        currentAmountMinor: Number(g.current_amount_cents),
        currency: str(g.currency),
        targetDate: str(g.target_date),
        priority: g.priority as 'low' | 'medium' | 'high',
        status: g.status as 'active' | 'completed' | 'expired',
        createdAt: str(g.created_at),
        updatedAt: str(g.updated_at),
      })),
      notificationPreferences: notif
        ? {
            daily: Number(notif.daily_enabled) === 1,
            budget: Number(notif.budget_enabled) === 1,
            goal: Number(notif.goal_enabled) === 1,
            monthly: Number(notif.monthly_enabled) === 1,
            achievement: Number(notif.achievement_enabled) === 1,
            dailyTime: str(notif.daily_time),
          }
        : null,
    };
  });
  return snapshot as BackupFile;
}

export async function readCsvRows(db: BackupDb): Promise<CsvTransaction[]> {
  const rows = await db.getAllAsync<Row>(
    `SELECT t.date, t.type, t.amount_cents, t.currency, t.note, t.is_recurring,
            c.name AS category_name, p.name AS payment_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       LEFT JOIN payment_methods p ON p.id = t.payment_method_id
      ORDER BY t.date DESC, t.id`,
  );
  return rows.map((r) => ({
    date: str(r.date),
    type: r.type as 'income' | 'expense',
    amountMinor: Number(r.amount_cents),
    currency: str(r.currency),
    categoryName: str(r.category_name ?? ''),
    paymentMethodName: str(r.payment_name ?? ''),
    note: str(r.note ?? ''),
    recurring: Number(r.is_recurring) === 1,
  }));
}

/** Tables holding user data, children before parents. */
const DATA_TABLES = [
  'transactions',
  'budget_versions',
  'budgets',
  'savings_goals',
  'notification_log',
  'categories',
  'payment_methods',
  'profiles',
] as const;

export async function deleteAllUserData(db: BackupDb): Promise<void> {
  for (const table of DATA_TABLES) await db.runAsync(`DELETE FROM ${table}`);
}

/**
 * Replaces everything with the backup's contents. Runs in ONE transaction: any failure (including a foreign-key
 * violation found at the end) rolls back and leaves the previous data untouched.
 */
export async function replaceAllData(db: BackupDb, b: BackupFile): Promise<void> {
  await db.withTransactionAsync(async () => {
    await deleteAllUserData(db);

    for (const c of b.categories) {
      await db.runAsync('INSERT INTO categories (id, type, name, color, is_default) VALUES (?, ?, ?, ?, ?)', [
        c.id, c.type, c.name, c.color, c.isDefault ? 1 : 0,
      ]);
    }
    for (const m of b.paymentMethods) {
      await db.runAsync('INSERT INTO payment_methods (id, name, is_default) VALUES (?, ?, ?)', [
        m.id, m.name, m.isDefault ? 1 : 0,
      ]);
    }
    if (b.profile) {
      await db.runAsync("INSERT INTO profiles (id, name, currency) VALUES ('default', ?, ?)", [
        b.profile.name, b.profile.currency,
      ]);
    }
    for (const t of b.transactions) {
      await db.runAsync(
        `INSERT INTO transactions (id, type, amount_cents, currency, category_id, payment_method_id, date, note, is_recurring, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.type, t.amountMinor, t.currency, t.categoryId, t.paymentMethodId, t.date, t.note,
          t.isRecurring ? 1 : 0, t.createdAt, t.updatedAt],
      );
    }
    for (const v of b.budgetVersions) {
      await db.runAsync(
        `INSERT INTO budget_versions (id, scope, category_id, scope_key, effective_from_month, amount_cents, currency, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.scope, v.categoryId, v.scope === 'overall' ? 'overall' : v.categoryId, v.effectiveFromMonth,
          v.amountMinor, v.currency, v.createdAt, v.updatedAt],
      );
    }
    for (const g of b.savingsGoals) {
      await db.runAsync(
        `INSERT INTO savings_goals (id, name, target_amount_cents, current_amount_cents, currency, target_date, priority, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [g.id, g.name, g.targetAmountMinor, g.currentAmountMinor, g.currency, g.targetDate, g.priority, g.status,
          g.createdAt, g.updatedAt],
      );
    }
    if (b.notificationPreferences) {
      const n = b.notificationPreferences;
      await db.runAsync(
        `UPDATE notification_settings SET daily_enabled = ?, budget_enabled = ?, goal_enabled = ?,
           monthly_enabled = ?, achievement_enabled = ?, daily_time = ?, updated_at = datetime('now') WHERE id = 'default'`,
        [n.daily ? 1 : 0, n.budget ? 1 : 0, n.goal ? 1 : 0, n.monthly ? 1 : 0, n.achievement ? 1 : 0, n.dailyTime],
      );
    }

    const violations = await db.getAllAsync<unknown>('PRAGMA foreign_key_check');
    if (violations.length > 0) throw new Error('Restored data failed the integrity check.');
  });
}
