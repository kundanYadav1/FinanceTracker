import { z } from 'zod';

export const BACKUP_FORMAT = 'kosh-backup';
export const BACKUP_FORMAT_VERSION = 1;
/** Largest amount (minor units) the app accepts anywhere; mirrors the budget_versions CHECK. */
export const MAX_AMOUNT_MINOR = 9_999_999_999;
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

const amount = z.number().int().min(0).max(MAX_AMOUNT_MINOR);
const currency = z.string().regex(/^[A-Z]{3}$/);
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const timestamp = z.string().min(1).max(40);
const id = z.string().min(1).max(100);

const category = z.object({
  id,
  type: z.enum(['expense', 'income']),
  name: z.string().min(1).max(100),
  color: z.string().min(1).max(20),
  isDefault: z.boolean(),
});

const paymentMethod = z.object({ id, name: z.string().min(1).max(100), isDefault: z.boolean() });

const transaction = z.object({
  id,
  type: z.enum(['expense', 'income']),
  amountMinor: amount,
  currency,
  categoryId: id,
  paymentMethodId: id.nullable(),
  date: dateKey,
  note: z.string().max(2000).nullable(),
  isRecurring: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const budgetVersion = z.object({
  id,
  scope: z.enum(['overall', 'category']),
  categoryId: id.nullable(),
  effectiveFromMonth: monthKey,
  /** null = "no budget from this month". */
  amountMinor: amount.nullable(),
  currency,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const savingsGoal = z.object({
  id,
  name: z.string().min(1).max(200),
  targetAmountMinor: amount,
  currentAmountMinor: amount,
  currency,
  targetDate: dateKey,
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['active', 'completed', 'expired']),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const notificationPrefs = z.object({
  daily: z.boolean(),
  budget: z.boolean(),
  goal: z.boolean(),
  monthly: z.boolean(),
  achievement: z.boolean(),
  dailyTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/),
});

export const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  formatVersion: z.number().int().min(1).max(BACKUP_FORMAT_VERSION),
  schemaVersion: z.number().int().min(1),
  exportedAt: z.string().min(1),
  appVersion: z.string(),
  profile: z.object({ name: z.string().max(200), currency }).nullable(),
  categories: z.array(category),
  paymentMethods: z.array(paymentMethod),
  transactions: z.array(transaction),
  budgetVersions: z.array(budgetVersion),
  savingsGoals: z.array(savingsGoal),
  notificationPreferences: notificationPrefs.nullable(),
});

export type BackupFile = z.infer<typeof backupSchema>;
export type BackupTransaction = BackupFile['transactions'][number];

export type BackupSummary = {
  exportedAt: string;
  transactions: number;
  budgets: number;
  goals: number;
  categories: number;
  firstDate: string | null;
  lastDate: string | null;
};

export type ParseResult =
  | { ok: true; backup: BackupFile; summary: BackupSummary }
  | { ok: false; error: string };

function isRealDate(key: string): boolean {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function duplicates(ids: string[]): boolean {
  return new Set(ids).size !== ids.length;
}

/** Cross-record rules that a schema alone cannot express. Returns the first problem found, or null. */
export function findIntegrityProblem(b: BackupFile): string | null {
  if (duplicates(b.categories.map((c) => c.id))) return 'The backup contains duplicate categories.';
  if (duplicates(b.paymentMethods.map((p) => p.id))) return 'The backup contains duplicate payment methods.';
  if (duplicates(b.transactions.map((t) => t.id))) return 'The backup contains duplicate transactions.';
  if (duplicates(b.budgetVersions.map((v) => v.id))) return 'The backup contains duplicate budgets.';
  if (duplicates(b.savingsGoals.map((g) => g.id))) return 'The backup contains duplicate goals.';

  const categories = new Map(b.categories.map((c) => [c.id, c]));
  const methods = new Set(b.paymentMethods.map((p) => p.id));

  for (const t of b.transactions) {
    const cat = categories.get(t.categoryId);
    if (!cat) return 'A transaction refers to a category that is not in the backup.';
    if (cat.type !== t.type) return 'A transaction does not match its category type.';
    if (t.paymentMethodId !== null && !methods.has(t.paymentMethodId)) {
      return 'A transaction refers to a payment method that is not in the backup.';
    }
    if (!isRealDate(t.date)) return 'A transaction has an invalid date.';
  }

  const scopeKeys = new Set<string>();
  for (const v of b.budgetVersions) {
    if (v.scope === 'overall' && v.categoryId !== null) return 'An overall budget must not have a category.';
    if (v.scope === 'category') {
      if (v.categoryId === null || !categories.has(v.categoryId)) {
        return 'A budget refers to a category that is not in the backup.';
      }
    }
    const key = `${v.scope === 'overall' ? 'overall' : v.categoryId}|${v.effectiveFromMonth}`;
    if (scopeKeys.has(key)) return 'The backup contains two budgets for the same month.';
    scopeKeys.add(key);
  }

  for (const g of b.savingsGoals) {
    if (!isRealDate(g.targetDate)) return 'A goal has an invalid target date.';
  }
  return null;
}

export function summarize(b: BackupFile): BackupSummary {
  const dates = b.transactions.map((t) => t.date).sort();
  return {
    exportedAt: b.exportedAt,
    transactions: b.transactions.length,
    budgets: b.budgetVersions.length,
    goals: b.savingsGoals.length,
    categories: b.categories.length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
  };
}

/**
 * Parses and fully validates backup text. Nothing is written anywhere; the messages are safe to show
 * (they never echo file content, so no financial data leaks into UI or logs).
 */
export function parseBackup(text: string, supportedSchemaVersion: number): ParseResult {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'This file is too large to be a Kosh backup.' };

  let raw: unknown;
  try {
    raw = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  if (typeof raw !== 'object' || raw === null || (raw as { format?: unknown }).format !== BACKUP_FORMAT) {
    return { ok: false, error: 'This is not a Kosh backup file.' };
  }
  const header = raw as { formatVersion?: unknown; schemaVersion?: unknown };
  if (typeof header.formatVersion !== 'number' || header.formatVersion > BACKUP_FORMAT_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of Kosh. Update the app and try again.' };
  }
  if (typeof header.schemaVersion === 'number' && header.schemaVersion > supportedSchemaVersion) {
    return { ok: false, error: 'This backup was made by a newer version of Kosh. Update the app and try again.' };
  }

  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'This backup file is damaged or incomplete.' };

  const problem = findIntegrityProblem(parsed.data);
  if (problem) return { ok: false, error: problem };

  return { ok: true, backup: parsed.data, summary: summarize(parsed.data) };
}
