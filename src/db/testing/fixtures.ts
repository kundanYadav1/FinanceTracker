/**
 * Representative rows as they existed when each schema version was the latest.
 * Keyed by version; each includes everything valid at that version. Never edit shipped fixtures — add new ones.
 */
const V1 = `
  INSERT INTO profiles (id, name, currency) VALUES ('default', 'Test User', 'INR');
  INSERT INTO categories (id, type, name, color, is_default) VALUES
    ('cat_food', 'expense', 'Food', '#e57373', 1),
    ('cat_salary', 'income', 'Salary', '#66bb6a', 1),
    ('cat_custom', 'expense', 'Pets', '#123456', 0);
  INSERT INTO payment_methods (id, name, is_default) VALUES ('pm_cash', 'Cash', 1), ('pm_upi', 'UPI', 0);
  INSERT INTO transactions (id, type, amount_cents, currency, category_id, payment_method_id, date, note, is_recurring, created_at, updated_at) VALUES
    ('t1', 'expense', 125050, 'INR', 'cat_food', 'pm_upi', '2026-10-04', 'Lunch, "quoted"', 0, '2026-10-04 10:00:00', '2026-10-04 10:00:00'),
    ('t2', 'income', 9999999900, 'INR', 'cat_salary', NULL, '2026-10-01', NULL, 1, '2026-10-01 09:00:00', '2026-10-01 09:00:00'),
    ('t3', 'expense', 1, 'USD', 'cat_custom', 'pm_cash', '2026-10-05', '=SUM(A1)', 0, '2026-10-05 08:00:00', '2026-10-05 08:00:00');
`;

const V2 = `${V1}
  INSERT INTO budgets (id, category_id, amount_cents, currency, period_start, period_end) VALUES
    ('b1', 'cat_food', 500000, 'INR', '2026-10-01', '2026-10-31');
  INSERT INTO savings_goals (id, name, target_amount_cents, current_amount_cents, currency, target_date, priority, status) VALUES
    ('g1', 'Laptop', 8000000, 1200000, 'INR', '2027-03-31', 'high', 'active');
`;

const V3 = `${V2}
  INSERT INTO budget_versions (id, scope, category_id, scope_key, effective_from_month, amount_cents) VALUES
    ('bv1', 'overall', NULL, 'overall', '2026-10', 3000000),
    ('bv2', 'category', 'cat_food', 'cat_food', '2026-11', NULL);
`;

const V4 = `${V3}
  UPDATE notification_settings SET daily_enabled = 0, daily_time = '21:30', permission_asked = 1 WHERE id = 'default';
  INSERT INTO notification_log (dedupe_key, type) VALUES ('budget:cat_food:2026-10:80', 'budget');
`;

export const FIXTURES: Record<number, string> = { 1: V1, 2: V2, 3: V3, 4: V4 };
