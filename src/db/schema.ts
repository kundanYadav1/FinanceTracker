export const SCHEMA_VERSION = 4;

export const MIGRATIONS = [
  {
    version: 1,
    up: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY CHECK (id = 'default'),
        name TEXT NOT NULL DEFAULT '',
        currency TEXT NOT NULL DEFAULT 'INR',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#3c87f7',
        is_default INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        category_id TEXT NOT NULL,
        payment_method_id TEXT,
        date TEXT NOT NULL,
        note TEXT,
        is_recurring INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

      INSERT OR IGNORE INTO schema_migrations (version) VALUES (1);
    `,
  },
  {
    version: 2,
    up: `
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS savings_goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_amount_cents INTEGER NOT NULL,
        current_amount_cents INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        target_date TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      INSERT OR IGNORE INTO schema_migrations (version) VALUES (2);
    `,
  },
  {
    version: 3,
    up: `
      -- Month-effective budget versions (ADR-0006). A row applies from its month onward until a later
      -- row for the same scope. amount_cents NULL means "no budget from this month".
      CREATE TABLE IF NOT EXISTS budget_versions (
        id TEXT PRIMARY KEY,
        scope TEXT NOT NULL CHECK (scope IN ('overall', 'category')),
        category_id TEXT,
        scope_key TEXT NOT NULL,
        effective_from_month TEXT NOT NULL
          CHECK (effective_from_month GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'),
        amount_cents INTEGER CHECK (amount_cents IS NULL OR (amount_cents >= 0 AND amount_cents <= 9999999999)),
        currency TEXT NOT NULL DEFAULT 'INR',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        CHECK ((scope = 'overall' AND category_id IS NULL AND scope_key = 'overall')
            OR (scope = 'category' AND category_id IS NOT NULL AND scope_key = category_id)),
        FOREIGN KEY (category_id) REFERENCES categories(id),
        UNIQUE (scope_key, effective_from_month)
      );

      CREATE INDEX IF NOT EXISTS ix_budget_category ON budget_versions(category_id);

      -- Carry over budgets from the draft table; the latest edit wins when two start in the same month.
      INSERT OR IGNORE INTO budget_versions
        (id, scope, category_id, scope_key, effective_from_month, amount_cents, currency, created_at, updated_at)
      SELECT id, 'category', category_id, category_id, substr(period_start, 1, 7), amount_cents, currency,
             created_at, updated_at
      FROM budgets
      WHERE amount_cents >= 0 AND amount_cents <= 9999999999
        AND substr(period_start, 1, 7) GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
      ORDER BY updated_at DESC;

      INSERT OR IGNORE INTO schema_migrations (version) VALUES (3);
    `,
  },
  {
    version: 4,
    up: `
      -- Notification preferences (single row) and a log used to dedupe data-driven notices (ADR-0013).
      CREATE TABLE IF NOT EXISTS notification_settings (
        id TEXT PRIMARY KEY CHECK (id = 'default'),
        daily_enabled INTEGER NOT NULL DEFAULT 1,
        budget_enabled INTEGER NOT NULL DEFAULT 1,
        goal_enabled INTEGER NOT NULL DEFAULT 1,
        monthly_enabled INTEGER NOT NULL DEFAULT 1,
        achievement_enabled INTEGER NOT NULL DEFAULT 1,
        daily_time TEXT NOT NULL DEFAULT '20:00' CHECK (daily_time GLOB '[0-2][0-9]:[0-5][0-9]'),
        permission_asked INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS notification_log (
        dedupe_key TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        sent_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      INSERT OR IGNORE INTO notification_settings (id) VALUES ('default');
      INSERT OR IGNORE INTO schema_migrations (version) VALUES (4);
    `,
  },
];

export function migrationSql(version: number): string | undefined {
  const migration = MIGRATIONS.find((m) => m.version === version);
  return migration?.up;
}
