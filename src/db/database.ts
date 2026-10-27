import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'financetracker.db';

let dbInstance: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await openDatabaseAsync(DATABASE_NAME);
  await runMigrations(db);
  dbInstance = db;
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const { SCHEMA_VERSION, migrationSql } = await import('./schema');

  const current = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) AS version FROM schema_migrations'
  );
  const appliedVersion = current?.version ?? 0;

  for (let version = appliedVersion + 1; version <= SCHEMA_VERSION; version += 1) {
    const sql = migrationSql(version);
    if (!sql) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
    });
  }
}

export { type SQLiteDatabase };
