import { backupDatabaseAsync, deleteDatabaseAsync, openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from './migrate';

const DATABASE_NAME = 'financetracker.db';

let dbInstance: SQLiteDatabase | null = null;
let opening: Promise<SQLiteDatabase> | null = null;

export function preUpgradeDatabaseName(fromVersion: number): string {
  return `financetracker.pre-v${fromVersion}.db`;
}

/** Copies the live database to `destName` using SQLite's online backup API. */
export async function copyDatabaseTo(source: SQLiteDatabase, destName: string): Promise<void> {
  const dest = await openDatabaseAsync(destName);
  try {
    await backupDatabaseAsync({ sourceDatabase: source, destDatabase: dest });
  } finally {
    await dest.closeAsync();
  }
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  // Share one in-flight open so concurrent callers do not migrate twice.
  opening ??= (async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);
    await runMigrations(db, {
      // ADR-0009: keep a recovery copy while an existing database is upgraded; drop it once the upgrade succeeded.
      beforeUpgrade: (from) => copyDatabaseTo(db, preUpgradeDatabaseName(from)),
      afterUpgrade: (from) => deleteDatabaseAsync(preUpgradeDatabaseName(from)).catch(() => undefined),
    });
    dbInstance = db;
    return db;
  })().finally(() => {
    opening = null;
  });
  return opening;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

export { type SQLiteDatabase };
