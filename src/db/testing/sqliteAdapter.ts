import initSqlJs, { type Database, type SqlValue } from 'sql.js';

import type { MigratableDb } from '../migrate';

/** Test-only: a real in-memory SQLite exposing the slice of expo-sqlite's async API the repositories use. */
export type TestDb = MigratableDb & {
  runAsync(sql: string, params?: unknown): Promise<{ changes: number }>;
  raw: Database;
};

let sqlPromise: ReturnType<typeof initSqlJs> | null = null;

export async function createTestDb(): Promise<TestDb> {
  sqlPromise ??= initSqlJs();
  const SQL = await sqlPromise;
  const raw = new SQL.Database();
  let depth = 0;

  const all = <T,>(sql: string, params: unknown[] = []): T[] => {
    const stmt = raw.prepare(sql);
    try {
      stmt.bind(params as SqlValue[]);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  };

  return {
    raw,
    async execAsync(sql) {
      raw.exec(sql);
    },
    async runAsync(sql, params = []) {
      raw.run(sql, params as SqlValue[]);
      return { changes: raw.getRowsModified() };
    },
    async getAllAsync<T>(sql: string, params?: unknown) {
      return all<T>(sql, params as unknown[] | undefined);
    },
    async getFirstAsync<T>(sql: string, params?: unknown) {
      return all<T>(sql, params as unknown[] | undefined)[0] ?? null;
    },
    async withTransactionAsync(task) {
      if (depth > 0) throw new Error('Nested transactions are not supported by the test adapter');
      raw.exec('BEGIN');
      depth += 1;
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      } finally {
        depth -= 1;
      }
    },
  };
}
