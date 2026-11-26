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
import { computeGoalProgress } from '@/db/goals';
import { goalsSummary, monthKey, money, sumMonth, toDateKey } from '@/domain/overview';
import { useAppStore } from '@/store/appStore';
import { formatRupees, toCents } from '@/utils/money';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PRIORITY = { low: 'Low', medium: 'Medium', high: 'High' } as const;

function targetLabel(date: string, priority: keyof typeof PRIORITY): string {
  const [y, m] = date.split('-').map(Number);
  return `By ${MONTHS[m - 1]} ${y} · ${PRIORITY[priority]}`;
}

export default function GoalsScreen() {
  const { goals, transactions, addGoal, removeGoal, hideAmounts } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [targetDate, setTargetDate] = useState(toDateKey(new Date()));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const month = monthKey(now);
  const savedThisMonth = sumMonth(transactions, 'income', month) - sumMonth(transactions, 'expense', month);
  const active = goals.filter((g) => g.currentAmount.cents < g.targetAmount.cents);
  const summary = goalsSummary(active, savedThisMonth);

  const openForm = () => {
    setName('');
    setTarget('');
    setCurrent('0');
    setTargetDate(toDateKey(new Date(now.getFullYear(), now.getMonth() + 6, 1)));
    setPriority('medium');
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
    if (!name.trim()) return setError('Give the goal a name.');
    if (targetCents <= 0) return setError('Target must be more than zero.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return setError('Enter the target date as YYYY-MM-DD.');
    await addGoal({
      name: name.trim(),
      targetAmount: { currency: 'INR', cents: targetCents },
      currentAmount: { currency: 'INR', cents: currentCents },
      targetDate,
      priority,
    });
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

        {active.length > 0 ? (
          <Card tint style={{ gap: Space.s3 }}>
            <KText variant="overline" color="ink">
              Needed each month
            </KText>
            <Amount money={money(summary.neededCents)} size="lg" masked={hideAmounts} />
            <KText variant="body">
              {hideAmounts
                ? 'Amounts are hidden.'
                : summary.gapCents > 0
                  ? `You saved ${formatRupees(money(summary.savedCents))} this month. Your goals need ${formatRupees(money(summary.gapCents))} more each month to finish on time.`
                  : `You saved ${formatRupees(money(summary.savedCents))} this month, which covers what your goals need.`}
            </KText>
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
              const p = computeGoalProgress(g);
              const required = p.requiredMonthlySaving != null ? Math.round(p.requiredMonthlySaving) : null;
              const done = g.currentAmount.cents >= g.targetAmount.cents;
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
                    value={p.progressPercent}
                    status={
                      done
                        ? 'Goal reached'
                        : required != null
                          ? hideAmounts
                            ? 'Monthly saving needed'
                            : `${formatRupees(money(required))} a month needed`
                          : 'Target date reached'
                    }
                    state={done || required != null ? 'ok' : 'warn'}
                    detail={
                      hideAmounts
                        ? undefined
                        : `${formatRupees(g.currentAmount)} of ${formatRupees(g.targetAmount)}`
                    }
                  />
                  <Button variant="ghost" onPress={() => confirmDelete(g.id, g.name)}>
                    Delete goal
                  </Button>
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

      <BottomSheet visible={showForm} title="Add goal" onClose={() => setShowForm(false)}>
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
          Save goal
        </Button>
      </BottomSheet>
    </>
  );
}
