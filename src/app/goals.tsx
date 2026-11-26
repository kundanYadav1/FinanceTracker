import { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  Amount,
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  KText,
  ProgressBar,
  Screen,
  SectionHeading,
} from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import type { SavingsGoal } from '@/db/goals';
import {
  STATE_LABEL,
  buildPortfolio,
  expectedMonthlySaving,
  formatMonthKey,
  goalProgress,
  goalTracking,
  savingsGap,
  toToday,
  type GoalTracking,
  type SavingsGap,
} from '@/domain/goals';
import { money, toDateKey } from '@/domain/overview';
import { useAppStore } from '@/store/appStore';
import { formatRupees, toCents } from '@/utils/money';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_CENTS = 9_999_999_999;
const PRIORITY = { low: 'Low', medium: 'Medium', high: 'High' } as const;

function targetLabel(date: string, priority: keyof typeof PRIORITY): string {
  const [y, m] = date.split('-').map(Number);
  return `By ${MONTHS[m - 1]} ${y} · ${PRIORITY[priority]}`;
}

function progressState(t: GoalTracking): 'ok' | 'warn' | 'over' {
  if (t.state === 'atRisk') return 'warn';
  if (t.state === 'behind' || t.state === 'expired') return 'over';
  return 'ok';
}

function projectionText(t: GoalTracking): string {
  const p = t.projection;
  if (p.kind === 'reached') return 'Target reached.';
  if (p.kind === 'month') return `Projected completion: ${formatMonthKey(p.month)}`;
  if (p.kind === 'beyond50Years') return 'More than 50 years at the current pace.';
  if (p.reason === 'expired') return 'Target date has passed. Update the target date to see a projection.';
  if (p.reason === 'noNetSaving') return "Your recent months show no net saving, so a completion date can't be projected.";
  return 'Tracking starts after your first complete month of transactions.';
}

function gapText(gap: SavingsGap): string {
  if (gap.kind === 'requiredOnly') return 'Tracking starts after your first complete month of transactions.';
  if (gap.kind === 'covered') {
    return `You've saved about ${formatRupees(money(gap.expectedCents))} a month recently, which covers what your goals need.`;
  }
  if (gap.kind === 'gap') {
    return `You've saved about ${formatRupees(money(gap.expectedCents))} a month recently. Your goals need ${formatRupees(money(gap.gapCents))} more each month to finish on time.`;
  }
  return '';
}

export default function GoalsScreen() {
  const { goals, transactions, addGoal, updateGoal, removeGoal, hideAmounts } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [targetDate, setTargetDate] = useState(toDateKey(new Date()));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const today = toToday(now);
  const expected = expectedMonthlySaving(transactions, today);
  const portfolio = buildPortfolio(goals, today);
  const gap = savingsGap(portfolio, expected);

  const openForm = () => {
    setEditingId(null);
    setName('');
    setTarget('');
    setCurrent('0');
    setTargetDate(toDateKey(new Date(now.getFullYear(), now.getMonth() + 6, 1)));
    setPriority('medium');
    setError(null);
    setShowForm(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditingId(g.id);
    setName(g.name);
    setTarget(String(g.targetAmount.cents / 100));
    setCurrent(String(g.currentAmount.cents / 100));
    setTargetDate(g.targetDate.slice(0, 10));
    setPriority(g.priority);
    setError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    let targetCents: number;
    let currentCents: number;
    try {
      targetCents = toCents(target.replace(/,/g, ''));
      currentCents = toCents((current || '0').replace(/,/g, ''));
    } catch {
      return setError('Enter amounts with up to two decimals, for example 200000.');
    }
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 60) return setError('Goal name must be 1 to 60 characters.');
    if (targetCents <= 0) return setError('Target must be more than zero.');
    if (currentCents < 0) return setError('Saved amount cannot be negative.');
    if (targetCents > MAX_CENTS || currentCents > MAX_CENTS) return setError('Amounts can be at most 99,999,999.99.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate) || Number.isNaN(new Date(targetDate).getTime())) {
      return setError('Enter the target date as YYYY-MM-DD.');
    }
    const existing = editingId ? goals.find((g) => g.id === editingId) : undefined;
    if (targetDate < toDateKey(now) && targetDate !== existing?.targetDate.slice(0, 10)) {
      return setError('Target date must be today or later.');
    }
    const input = {
      name: trimmed,
      targetAmount: { currency: 'INR', cents: targetCents },
      currentAmount: { currency: 'INR', cents: currentCents },
      targetDate,
      priority,
    };
    if (editingId) await updateGoal(editingId, input);
    else await addGoal(input);
    setShowForm(false);
  };

  const confirmDelete = (id: string, goalName: string) =>
    Alert.alert('Delete goal?', `${goalName} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeGoal(id) },
    ]);

  return (
    <>
      <Screen>
        <KText variant="title" accessibilityRole="header">
          Savings goals
        </KText>

        {gap.kind !== 'none' ? (
          <Card tint style={{ gap: Space.s3 }}>
            <KText variant="overline" color="ink">
              Needed each month
            </KText>
            <Amount
              money={money(gap.kind === 'requiredOnly' || gap.kind === 'covered' || gap.kind === 'gap' ? gap.requiredCents : 0)}
              size="lg"
              masked={hideAmounts}
            />
            <KText variant="body">{hideAmounts ? 'Amounts are hidden.' : gapText(gap)}</KText>
          </Card>
        ) : null}

        <View style={{ gap: Space.s3 }}>
          <SectionHeading>Your goals</SectionHeading>
          {goals.length === 0 ? (
            <EmptyState
              message="No savings goals yet. Create your first goal."
              action="Add goal"
              onAction={openForm}
            />
          ) : (
            goals.map((g) => {
              const p = goalProgress(g);
              const t = goalTracking(g, portfolio, expected, today);
              return (
                <Card key={g.id} style={{ gap: Space.s3 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Space.s3 }}>
                    <KText variant="heading" style={{ flexShrink: 1 }}>
                      {g.name}
                    </KText>
                    <KText variant="caption">{targetLabel(g.targetDate, g.priority)}</KText>
                  </View>
                  <ProgressBar
                    label="Saved"
                    kind="goal"
                    value={p.percent}
                    status={`Risk: ${STATE_LABEL[t.state]}`}
                    state={progressState(t)}
                    detail={
                      hideAmounts ? undefined : `${formatRupees(g.currentAmount)} of ${formatRupees(g.targetAmount)}`
                    }
                  />
                  {t.requiredCents != null && t.requiredCents > 0 ? (
                    <KText variant="body">
                      {hideAmounts ? 'Monthly saving needed' : `${formatRupees(money(t.requiredCents))} a month needed`}
                    </KText>
                  ) : null}
                  <KText variant="body">{projectionText(t)}</KText>
                  <View style={{ flexDirection: 'row', gap: Space.s2 }}>
                    <Button variant="ghost" onPress={() => openEdit(g)}>
                      Edit
                    </Button>
                    <Button variant="ghost" onPress={() => confirmDelete(g.id, g.name)}>
                      Delete
                    </Button>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {goals.length > 0 ? (
          <Button block onPress={openForm}>
            Add goal
          </Button>
        ) : null}
      </Screen>

      <BottomSheet visible={showForm} title={editingId ? 'Edit goal' : 'Add goal'} onClose={() => setShowForm(false)}>
        <Field label="Goal name" value={name} onChangeText={setName} placeholder="Emergency fund" />
        <Field label="Target (Rs)" value={target} onChangeText={setTarget} placeholder="200000" keyboardType="decimal-pad" />
        <Field label="Saved so far (Rs)" value={current} onChangeText={setCurrent} placeholder="0" keyboardType="decimal-pad" />
        <Field label="Target date" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
        <View style={{ gap: Space.s2 }}>
          <KText variant="overline">Priority</KText>
          <View style={{ flexDirection: 'row', gap: Space.s2 }}>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Chip key={p} label={PRIORITY[p]} selected={priority === p} onPress={() => setPriority(p)} />
            ))}
          </View>
        </View>
        {error ? (
          <KText variant="bodyStrong" color="negative" accessibilityLiveRegion="polite">
            {error}
          </KText>
        ) : null}
        <Button block onPress={handleSave}>
          {editingId ? 'Save changes' : 'Save goal'}
        </Button>
      </BottomSheet>
    </>
  );
}
