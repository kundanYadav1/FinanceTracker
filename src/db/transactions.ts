import type { Money } from '@/utils/money';
import type { SQLiteBindParams } from 'expo-sqlite';
import { getDatabase } from './database';

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: Money;
  categoryId: string;
  paymentMethodId?: string;
  date: string;
  note?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TransactionInput = {
  type: TransactionType;
  amount: Money;
  categoryId: string;
  paymentMethodId?: string;
  date: string;
  note?: string;
  isRecurring?: boolean;
};

export type TransactionFilters = {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapRow(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    type: row.type as TransactionType,
    amount: { currency: String(row.currency ?? 'INR'), cents: Number(row.amount_cents) },
    categoryId: String(row.category_id),
    paymentMethodId: row.payment_method_id ? String(row.payment_method_id) : undefined,
    date: String(row.date),
    note: row.note ? String(row.note) : undefined,
    isRecurring: Number(row.is_recurring) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO transactions (id, type, amount_cents, currency, category_id, payment_method_id, date, note, is_recurring, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.type,
      input.amount.cents,
      input.amount.currency,
      input.categoryId,
      input.paymentMethodId ?? null,
      input.date,
      input.note ?? null,
      input.isRecurring ? 1 : 0,
      now,
      now,
    ]
  );

  return (await getTransaction(id)) as Transaction;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT * FROM transactions WHERE id = ?`,
    [id]
  );
  if (!row) return null;
  return mapRow(row);
}

export async function listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const params: SQLiteBindParams = [];

  if (filters.type) {
    conditions.push('type = ?');
    params.push(filters.type);
  }
  if (filters.categoryId) {
    conditions.push('category_id = ?');
    params.push(filters.categoryId);
  }
  if (filters.startDate) {
    conditions.push('date >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('date <= ?');
    params.push(filters.endDate);
  }
  if (filters.search) {
    conditions.push('(note LIKE ? OR category_id LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC`,
    params
  );
  return rows.map(mapRow);
}

export async function updateTransaction(
  id: string,
  input: Partial<TransactionInput>
): Promise<Transaction | null> {
  const db = await getDatabase();
  const existing = await getTransaction(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE transactions
     SET type = COALESCE(?, type),
         amount_cents = COALESCE(?, amount_cents),
         currency = COALESCE(?, currency),
         category_id = COALESCE(?, category_id),
         payment_method_id = COALESCE(?, payment_method_id),
         date = COALESCE(?, date),
         note = COALESCE(?, note),
         is_recurring = COALESCE(?, is_recurring),
         updated_at = ?
     WHERE id = ?`,
    [
      input.type ?? existing.type,
      input.amount?.cents ?? existing.amount.cents,
      input.amount?.currency ?? existing.amount.currency,
      input.categoryId ?? existing.categoryId,
      input.paymentMethodId ?? existing.paymentMethodId ?? null,
      input.date ?? existing.date,
      input.note ?? existing.note ?? null,
      input.isRecurring ?? existing.isRecurring ? 1 : 0,
      now,
      id,
    ]
  );

  return getTransaction(id);
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function getTotalsByType(type: TransactionType, startDate?: string, endDate?: string): Promise<Money> {
  const db = await getDatabase();
  const conditions: string[] = ['type = ?'];
  const params: SQLiteBindParams = [type];
  if (startDate) {
    conditions.push('date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('date <= ?');
    params.push(endDate);
  }
  const where = conditions.join(' AND ');
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(amount_cents) AS total FROM transactions WHERE ${where}`,
    params
  );
  const cents = row?.total ?? 0;
  return { currency: 'INR', cents };
}

export async function getTransactionsByCategory(
  type: TransactionType,
  startDate?: string,
  endDate?: string
): Promise<{ categoryId: string; categoryName: string; amount: Money }[]> {
  const db = await getDatabase();
  const conditions: string[] = ['t.type = ?'];
  const params: SQLiteBindParams = [type];
  if (startDate) {
    conditions.push('t.date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('t.date <= ?');
    params.push(endDate);
  }
  const where = conditions.join(' AND ');
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT c.id AS category_id, c.name AS category_name, SUM(t.amount_cents) AS total_cents
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${where}
     GROUP BY c.id, c.name
     ORDER BY total_cents DESC`,
    params
  );
  return rows.map((row) => ({
    categoryId: String(row.category_id),
    categoryName: String(row.category_name),
    amount: { currency: 'INR', cents: Number(row.total_cents) },
  }));
}

export async function deleteAllTransactions(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions');
}
