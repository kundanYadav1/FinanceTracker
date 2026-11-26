import { parseBackup, type BackupFile } from '@/domain/export/backup';
import { readCsvRows, readSnapshot, replaceAllData } from './backup';
import { runMigrations } from './migrate';
import { SCHEMA_VERSION } from './schema';
import { FIXTURES } from './testing/fixtures';
import { createTestDb, type TestDb } from './testing/sqliteAdapter';

const NOW = new Date('2026-11-26T10:00:00.000Z');

async function seededDb(): Promise<TestDb> {
  const db = await createTestDb();
  await runMigrations(db);
  await db.execAsync(FIXTURES[4]);
  return db;
}

describe('backup round trip', () => {
  it('export -> wipe -> restore reproduces identical data', async () => {
    const db = await seededDb();
    const before = await readSnapshot(db, '1.0.0', NOW);
    expect(before.transactions).toHaveLength(3);

    const parsed = parseBackup(JSON.stringify(before), SCHEMA_VERSION);
    expect(parsed.ok).toBe(true);

    await db.execAsync('DELETE FROM transactions; DELETE FROM budget_versions; DELETE FROM savings_goals;');
    await replaceAllData(db, (parsed as { ok: true; backup: BackupFile }).backup);

    expect(await readSnapshot(db, '1.0.0', NOW)).toEqual(before);
  });

  it('restores into a brand-new database', async () => {
    const source = await seededDb();
    const snapshot = await readSnapshot(source, '1.0.0', NOW);

    const target = await createTestDb();
    await runMigrations(target);
    await replaceAllData(target, snapshot);
    expect(await readSnapshot(target, '1.0.0', NOW)).toEqual(snapshot);
  });

  it('keeps money as exact integer minor units', async () => {
    const db = await seededDb();
    const snapshot = await readSnapshot(db, '1.0.0', NOW);
    expect(snapshot.transactions.map((t) => t.amountMinor).sort((a, b) => a - b)).toEqual([1, 125050, 9999999900]);
  });

  it('never includes lock or PIN data', async () => {
    const db = await seededDb();
    await db.runAsync("UPDATE app_settings SET lock_enabled = 1, biometric_enabled = 1 WHERE id = 'default'");
    const text = JSON.stringify(await readSnapshot(db, '1.0.0', NOW));
    expect(text).not.toMatch(/lock|pin|biometric|dedupe/i);
  });

  it('rolls back completely when the restored data fails the integrity check', async () => {
    const db = await seededDb();
    const before = await readSnapshot(db, '1.0.0', NOW);

    const bad: BackupFile = {
      ...before,
      transactions: [{ ...before.transactions[0], id: 'orphan', categoryId: 'does_not_exist' }],
    };
    await expect(replaceAllData(db, bad)).rejects.toThrow();
    expect(await readSnapshot(db, '1.0.0', NOW)).toEqual(before);
  });

  it('reads CSV rows with category and payment names', async () => {
    const db = await seededDb();
    const rows = await readCsvRows(db);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ date: '2026-10-05', categoryName: 'Pets', paymentMethodName: 'Cash', note: '=SUM(A1)' });
  });
});

describe('parseBackup validation', () => {
  const valid = async (): Promise<BackupFile> => readSnapshot(await seededDb(), '1.0.0', NOW);
  const parse = (value: unknown) => parseBackup(JSON.stringify(value), SCHEMA_VERSION);
  const errorOf = (r: ReturnType<typeof parseBackup>) => (r.ok ? '' : r.error);

  it('accepts a valid backup (with a BOM) and summarizes it', async () => {
    const b = await valid();
    const r = parseBackup(`﻿${JSON.stringify(b)}`, SCHEMA_VERSION);
    expect(r.ok && r.summary).toMatchObject({ transactions: 3, goals: 1, firstDate: '2026-10-01', lastDate: '2026-10-05' });
  });

  it('rejects non-JSON, wrong format and unknown shapes', async () => {
    expect(errorOf(parseBackup('not json', SCHEMA_VERSION))).toMatch(/not valid JSON/);
    expect(errorOf(parse({ hello: 1 }))).toMatch(/not a Kosh backup/);
    expect(errorOf(parse([]))).toMatch(/not a Kosh backup/);
    expect(errorOf(parse({ ...(await valid()), transactions: 'x' }))).toMatch(/damaged/);
  });

  it('rejects newer format or schema versions', async () => {
    const b = await valid();
    expect(errorOf(parse({ ...b, formatVersion: 2 }))).toMatch(/newer version/);
    expect(errorOf(parse({ ...b, schemaVersion: SCHEMA_VERSION + 1 }))).toMatch(/newer version/);
  });

  it('accepts older schema versions', async () => {
    expect(parse({ ...(await valid()), schemaVersion: 1 }).ok).toBe(true);
  });

  it('rejects bad amounts, dates, enums and currencies', async () => {
    const b = await valid();
    const t = b.transactions[0];
    for (const patch of [
      { amountMinor: 1.5 },
      { amountMinor: -1 },
      { amountMinor: 10_000_000_000 },
      { date: '2026-02-30' },
      { date: '26-1-1' },
      { type: 'transfer' },
      { currency: 'inr' },
    ]) {
      expect(parse({ ...b, transactions: [{ ...t, ...patch }] }).ok).toBe(false);
    }
  });

  it('rejects dangling references and duplicate ids', async () => {
    const b = await valid();
    const t = b.transactions[0];
    expect(errorOf(parse({ ...b, transactions: [{ ...t, categoryId: 'nope' }] }))).toMatch(/category/);
    expect(errorOf(parse({ ...b, transactions: [{ ...t, paymentMethodId: 'nope' }] }))).toMatch(/payment method/);
    expect(errorOf(parse({ ...b, transactions: [t, t] }))).toMatch(/duplicate/);
    const wrongType = b.transactions.find((x) => x.type === 'income')!;
    expect(errorOf(parse({ ...b, transactions: [{ ...wrongType, categoryId: 'cat_food' }] }))).toMatch(/category type/);
    expect(errorOf(parse({ ...b, budgetVersions: [{ ...b.budgetVersions[1], categoryId: 'nope' }] }))).toMatch(/budget/);
  });

  it('error messages never echo file content', async () => {
    const b = await valid();
    const secret = 'SENTINEL_NOTE_987654321';
    const r = parse({ ...b, transactions: [{ ...b.transactions[0], note: secret, categoryId: 'nope' }] });
    expect(errorOf(r)).not.toContain(secret);
  });
});
