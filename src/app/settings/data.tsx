import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { Button, Card, KText, Screen, SectionHeading } from '@/components/kosh/kosh';
import { PinEntryModal } from '@/components/lock/PinEntryModal';
import { Space } from '@/constants/theme';
import { remainingLockoutSec } from '@/domain/lock/policy';
import { eraseEverything } from '@/services/data/eraseService';
import { EXPORT_WARNING, exportJsonBackup, exportTransactionsCsv } from '@/services/data/exportService';
import { applyRestore, pickAndValidateBackup } from '@/services/data/restoreService';
import { verifyPin } from '@/services/lock/pinService';
import { useLockStore } from '@/store/lockStore';

const GENERIC_ERROR = 'Something went wrong. Your existing data was not changed.';

export default function DataScreen() {
  const router = useRouter();
  const lockEnabled = useLockStore((s) => s.settings.lockEnabled);
  const [busy, setBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const pending = useRef<null | (() => void)>(null);

  /** Sensitive actions re-ask for the PIN when app lock is on. */
  const guarded = (action: () => void) => {
    if (!lockEnabled) return action();
    pending.current = action;
    setGateOpen(true);
  };

  const run = async (task: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await task();
    } catch {
      Alert.alert('Could not finish', GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const confirmExport = (what: string, task: () => Promise<boolean>) =>
    Alert.alert(`Export ${what}?`, EXPORT_WARNING, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Export', onPress: () => void run(async () => void (await task())) },
    ]);

  const restore = () =>
    void run(async () => {
      const picked = await pickAndValidateBackup();
      if (picked.status === 'cancelled') return;
      if (picked.status === 'invalid') {
        Alert.alert('Can’t restore this file', `${picked.error}\n\nYour existing data was not changed.`);
        return;
      }
      const s = picked.summary;
      const range = s.firstDate && s.lastDate ? `\nTransactions from ${s.firstDate} to ${s.lastDate}.` : '';
      Alert.alert(
        'Replace all data?',
        `This backup has ${s.transactions} transactions, ${s.budgets} budget entries and ${s.goals} goals.${range}\n\nEverything currently on this device will be replaced. This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace everything',
            style: 'destructive',
            onPress: () =>
              void run(async () => {
                await applyRestore(picked.backup);
                Alert.alert('Backup restored', 'Your data has been replaced with the backup.');
              }),
          },
        ],
      );
    });

  const deleteAll = () =>
    Alert.alert(
      'Delete all data?',
      'This permanently deletes every transaction, budget and goal, and removes your PIN. It cannot be undone. Export a backup first if you might want it back.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () =>
            void run(async () => {
              await eraseEverything();
              Alert.alert('All data deleted');
            }),
        },
      ],
    );

  return (
    <Screen>
      <KText variant="title" accessibilityRole="header">
        Data &amp; backup
      </KText>
      <KText variant="caption">
        Kosh keeps your data only on this device. Back it up so a lost or reset phone does not lose it.
      </KText>

      <SectionHeading>Export</SectionHeading>
      <Card style={{ gap: Space.s3 }}>
        <KText variant="bodyStrong">Backup file (JSON)</KText>
        <KText variant="caption">Everything: transactions, budgets, goals, categories and settings. Use it to restore.</KText>
        <Button
          variant="secondary"
          disabled={busy}
          onPress={() => guarded(() => confirmExport('backup', exportJsonBackup))}>
          Export backup
        </Button>
      </Card>
      <Card style={{ gap: Space.s3 }}>
        <KText variant="bodyStrong">Transactions (CSV)</KText>
        <KText variant="caption">For spreadsheets. Cannot be restored into Kosh.</KText>
        <Button
          variant="secondary"
          disabled={busy}
          onPress={() => guarded(() => confirmExport('transactions', exportTransactionsCsv))}>
          Export CSV
        </Button>
      </Card>

      <SectionHeading>Restore</SectionHeading>
      <Card style={{ gap: Space.s3 }}>
        <KText variant="caption">
          Choose a Kosh backup file. It is checked first; if anything is wrong your current data stays untouched.
        </KText>
        <Button variant="secondary" disabled={busy} onPress={() => guarded(restore)}>
          Restore from backup
        </Button>
      </Card>

      <SectionHeading>Danger zone</SectionHeading>
      <Card style={{ gap: Space.s3 }}>
        <KText variant="caption">Permanently remove everything Kosh has stored on this device.</KText>
        <Button variant="danger" disabled={busy} onPress={() => guarded(deleteAll)}>
          Delete all data
        </Button>
      </Card>

      <Button variant="ghost" onPress={() => router.back()}>
        Done
      </Button>

      <PinEntryModal
        visible={gateOpen}
        title="Enter your PIN"
        hint="Confirm it’s you to continue."
        onCancel={() => {
          pending.current = null;
          setGateOpen(false);
        }}
        onSubmit={async (pin) => {
          const result = await verifyPin(pin);
          if (!result.ok) {
            if (result.reason === 'locked') {
              return `Too many attempts. Try again in ${remainingLockoutSec(result.lockedUntil, Date.now())}s.`;
            }
            return 'Wrong PIN.';
          }
          const action = pending.current;
          pending.current = null;
          setGateOpen(false);
          action?.();
          return null;
        }}
      />
    </Screen>
  );
}
