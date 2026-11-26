import { createHash } from 'crypto';

import { DatabaseTooNewError, getAppliedVersion, runMigrations, type MigratableDb } from './migrate';
import { MIGRATIONS, SCHEMA_VERSION } from './schema';
import { FIXTURES } from './testing/fixtures';
import { createTestDb, type TestDb } from './testing/sqliteAdapter';

/**
 * Migrations are immutable once shipped. If this fails you edited an existing migration:
 * append a new one instead (ADR-0009).
 */
const MIGRATION_HASHES: Record<number, string> = {
  1: 'cd05eec9091cb37edc8e6e6fb397d98a930381fa2409ef65a83c8947a3a6a5b8',
  2: 'caba8006abba8c0d2574e20f7b77d19577c56e8eb7769bcb59657a07b8b9e5ea',
  3: 'd3770312eaaf9e121201316ac00c51c5d79af08d0e8e23e6f3cf3715daf63d86',
  4: '7d5482507db5c3e6933853eb4cb7fdff3b17d14f1b19fc247cef0d11ab2467aa',
  5: '6f9ec97e898528b9b34fbdb174c3d866e2d196dea350c398e5eb82a3cebd6a78',
};

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Builds a database exactly as it looked when `version` was the latest schema, then loads fixture rows. */
async function dbAtVersion(version: number): Promise<TestDb> {
  const db = await createTestDb();
  for (const m of MIGRATIONS.filter((x) => x.version <= version)) {
    await db.withTransactionAsync(async () => db.execAsync(m.up));
  }
  await db.execAsync(FIXTURES[version]);
  return db;
}

async function dump(db: TestDb, table: string): Promise<unknown[]> {
  return db.getAllAsync(`SELECT * FROM ${table} ORDER BY 1`);
}

describe('migrations', () => {
  it('fresh database reaches the latest version with the expected tables', async () => {
    const db = await createTestDb();
    const result = await runMigrations(db);
    expect(result.fromVersion).toBe(0);
    expect(result.applied).toEqual(MIGRATIONS.map((m) => m.version));
    expect(await getAppliedVersion(db)).toBe(SCHEMA_VERSION);
    const tables = (
      await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      )
    ).map((t) => t.name);
    expect(tables).toEqual(
      expect.arrayContaining([
        'profiles',
        'categories',
        'payment_methods',
        'transactions',
        'budgets',
        'savings_goals',
        'budget_versions',
        'notification_settings',
        'notification_log',
        'app_settings',
      ]),
    );
  });

  it('migration versions are contiguous and match SCHEMA_VERSION', () => {
    expect(MIGRATIONS.map((m) => m.version)).toEqual(Array.from({ length: SCHEMA_VERSION }, (_, i) => i + 1));
  });

  it('shipped migrations are immutable', () => {
    for (const m of MIGRATIONS) {
      expect({ version: m.version, hash: sha256(m.up) }).toEqual({
        version: m.version,
        hash: MIGRATION_HASHES[m.version],
      });
    }
  });

  describe.each(MIGRATIONS.slice(0, -1).map((m) => m.version))('upgrade from v%i', (from) => {
    it('keeps every existing row unchanged and ends at the latest version', async () => {
      const db = await dbAtVersion(from);
      const before: Record<string, unknown[]> = {
        profiles: await dump(db, 'profiles'),
        categories: await dump(db, 'categories'),
        payment_methods: await dump(db, 'payment_methods'),
        transactions: await dump(db, 'transactions'),
      };
      if (from >= 2) before.savings_goals = await dump(db, 'savings_goals');
      if (from >= 3) before.budget_versions = await dump(db, 'budget_versions');
      if (from >= 4) before.notification_settings = await dump(db, 'notification_settings');

      const result = await runMigrations(db);

      expect(result.fromVersion).toBe(from);
      expect(result.toVersion).toBe(SCHEMA_VERSION);
      expect(result.foreignKeyViolations).toBe(0);
      expect(await getAppliedVersion(db)).toBe(SCHEMA_VERSION);
      for (const [table, rows] of Object.entries(before)) {
        expect({ table, rows: await dump(db, table) }).toEqual({ table, rows });
      }
      const tx = await db.getAllAsync<{ amount_cents: number }>('SELECT amount_cents FROM transactions');
      expect(tx.length).toBeGreaterThan(0);
      for (const t of tx) expect(Number.isInteger(t.amount_cents)).toBe(true);
    });

    it('calls the upgrade hooks once with the old version', async () => {
      const db = await dbAtVersion(from);
      const beforeUpgrade = jest.fn(async () => undefined);
      const afterUpgrade = jest.fn(async () => undefined);
      await runMigrations(db, { beforeUpgrade, afterUpgrade });
      expect(beforeUpgrade).toHaveBeenCalledTimes(1);
      expect(beforeUpgrade).toHaveBeenCalledWith(from);
      expect(afterUpgrade).toHaveBeenCalledWith(from);
    });
  });

  it('carries v2 budgets into budget_versions when upgrading to v3', async () => {
    const db = await dbAtVersion(2);
    await runMigrations(db);
    const rows = await db.getAllAsync<{ scope_key: string; effective_from_month: string; amount_cents: number }>(
      "SELECT scope_key, effective_from_month, amount_cents FROM budget_versions WHERE scope_key = 'cat_food'",
    );
    expect(rows).toEqual([{ scope_key: 'cat_food', effective_from_month: '2026-10', amount_cents: 500000 }]);
  });

  it('re-running on an up-to-date database is a no-op', async () => {
    const db = await createTestDb();
    await runMigrations(db);
    const beforeUpgrade = jest.fn(async () => undefined);
    const again = await runMigrations(db, { beforeUpgrade });
    expect(again.applied).toEqual([]);
    expect(beforeUpgrade).not.toHaveBeenCalled();
  });

  it('does not take a safety copy for a brand-new database', async () => {
    const db = await createTestDb();
    const beforeUpgrade = jest.fn(async () => undefined);
    await runMigrations(db, { beforeUpgrade });
    expect(beforeUpgrade).not.toHaveBeenCalled();
  });

  it('refuses a database that is newer than the app and writes nothing', async () => {
    const db = await createTestDb();
    await runMigrations(db);
    await db.runAsync('INSERT INTO schema_migrations (version) VALUES (?)', [SCHEMA_VERSION + 1]);
    const exec = jest.spyOn(db, 'execAsync');
    await expect(runMigrations(db)).rejects.toBeInstanceOf(DatabaseTooNewError);
    expect(exec.mock.calls.filter(([sql]) => !/CREATE TABLE IF NOT EXISTS schema_migrations/.test(sql))).toEqual([]);
  });

  it('rolls a failing migration back completely', async () => {
    const db = await dbAtVersion(SCHEMA_VERSION - 1);
    const realExec = db.execAsync.bind(db);
    const failing: MigratableDb = {
      execAsync: (sql: string) =>
        sql.includes('app_settings')
          ? realExec('CREATE TABLE half_done (x); SELECT * FROM does_not_exist;')
          : realExec(sql),
      getFirstAsync: db.getFirstAsync.bind(db),
      getAllAsync: db.getAllAsync.bind(db),
      withTransactionAsync: db.withTransactionAsync.bind(db),
    };
    await expect(runMigrations(failing)).rejects.toThrow();
    expect(await getAppliedVersion(db)).toBe(SCHEMA_VERSION - 1);
    const leftovers = await db.getAllAsync("SELECT name FROM sqlite_master WHERE name = 'half_done'");
    expect(leftovers).toEqual([]);
    expect((await dump(db, 'transactions')).length).toBeGreaterThan(0);
  });
});
