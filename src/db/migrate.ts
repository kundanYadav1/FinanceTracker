import { MIGRATIONS, SCHEMA_VERSION, migrationSql } from './schema';

/** The subset of expo-sqlite's SQLiteDatabase that migrations need (lets tests use a real in-memory SQLite). */
export type MigratableDb = {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: unknown): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: unknown): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

export type MigrationResult = {
  fromVersion: number;
  toVersion: number;
  applied: number[];
  /** Rows reported by PRAGMA foreign_key_check after upgrading (0 = healthy). Non-fatal, surfaced for logging. */
  foreignKeyViolations: number;
};

export class DatabaseTooNewError extends Error {
  constructor(
    public readonly databaseVersion: number,
    public readonly appVersion: number,
  ) {
    super(`Database schema v${databaseVersion} is newer than this app supports (v${appVersion}).`);
    this.name = 'DatabaseTooNewError';
  }
}

export type MigrateOptions = {
  /** Called once, before the first migration is applied to an existing (non-empty) database. */
  beforeUpgrade?: (fromVersion: number) => Promise<void>;
  /** Called after a successful upgrade of an existing database. */
  afterUpgrade?: (fromVersion: number) => Promise<void>;
};

export async function getAppliedVersion(db: MigratableDb): Promise<number> {
  await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)');
  const row = await db.getFirstAsync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );
  return row?.version ?? 0;
}

export async function runMigrations(db: MigratableDb, options: MigrateOptions = {}): Promise<MigrationResult> {
  const fromVersion = await getAppliedVersion(db);
  if (fromVersion > SCHEMA_VERSION) throw new DatabaseTooNewError(fromVersion, SCHEMA_VERSION);

  const applied: number[] = [];
  const isUpgrade = fromVersion > 0 && fromVersion < SCHEMA_VERSION;
  if (isUpgrade) await options.beforeUpgrade?.(fromVersion);

  for (let version = fromVersion + 1; version <= SCHEMA_VERSION; version += 1) {
    const sql = migrationSql(version);
    if (!sql) throw new Error(`Missing migration for schema version ${version}`);
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
    });
    applied.push(version);
  }

  const violations = applied.length > 0 ? await db.getAllAsync<unknown>('PRAGMA foreign_key_check') : [];
  if (isUpgrade) await options.afterUpgrade?.(fromVersion);

  return { fromVersion, toVersion: SCHEMA_VERSION, applied, foreignKeyViolations: violations.length };
}

export { MIGRATIONS, SCHEMA_VERSION };
