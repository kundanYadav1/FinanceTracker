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
import { buildBudgetView, monthLabel, monthlyLimit, money, toDateKey } from '@/domain/overview';
import { useAppStore } from '@/store/appStore';
import { formatRupees, toCents } from '@/utils/money';

function monthBounds(now: Date): { start: string; end: string } {
  return {
    start: toDateKey(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: toDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

export default function BudgetsScreen() {
  const { budgets, categories, transactions, addBudget, removeBudget, hideAmounts } = useAppStore();
  const now = new Date();
  const bounds = monthBounds(now);

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [periodStart, setPeriodStart] = useState(bounds.start);
  const [periodEnd, setPeriodEnd] = useState(bounds.end);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const views = budgets.map((b) => buildBudgetView(b, transactions));
  const total = monthlyLimit(budgets, transactions, toDateKey(now));
  const mask = (text: string) => (hideAmounts ? undefined : text);

  const openForm = () => {
    setCategoryId(expenseCategories[0]?.id ?? '');
    setAmount('');
    setPeriodStart(bounds.start);
    setPeriodEnd(bounds.end);
    setError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    let cents: number;
    try {
      cents = toCents(amount.replace(/,/g, ''));
    } catch {
      setError('Enter an amount with up to two decimals, for example 15000.');
      return;
    }
    if (cents <= 0) return setError('Budget must be more than zero.');
    if (!categoryId) return setError('Pick a category.');
    const dateOk = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateOk.test(periodStart) || !dateOk.test(periodEnd) || periodEnd < periodStart) {
      return setError('Enter the period as YYYY-MM-DD, with the end on or after the start.');
    }
    await addBudget({ categoryId, amount: { currency: 'INR', cents }, periodStart, periodEnd });
    setShowForm(false);
  };

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Delete budget?', `The ${name} budget will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeBudget(id) },
    ]);

  return (
    <>
      <Screen>
        <View>
          <KText variant="title" accessibilityRole="header">
            Budgets
          </KText>
          <KText variant="caption">{monthLabel(now)}</KText>
        </View>

        {total ? (
          <Card style={{ gap: Space.s3 }}>
            <KText variant="overline">Spent of monthly limit</KText>
            <Amount money={money(total.spentCents)} size="lg" masked={hideAmounts} />
            <ProgressBar
              label={hideAmounts ? 'Monthly limit' : `${formatRupees(money(total.limitCents))} limit`}
              value={total.percent}
              detail={mask(
                total.limitCents >= total.spentCents
                  ? `${formatRupees(money(total.limitCents - total.spentCents))} left`
                  : `${formatRupees(money(total.spentCents - total.limitCents))} over`,
              )}
            />
          </Card>
        ) : null}

        <View style={{ gap: Space.s3 }}>
          <SectionHeading>By category</SectionHeading>
          {views.length === 0 ? (
            <EmptyState
              message="No budgets yet. Set one to see how much you can still spend."
              action="Set a budget"
              onAction={openForm}
            />
          ) : (
            views.map((v) => (
              <Card key={v.budget.id} style={{ gap: Space.s3 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Space.s3 }}>
                  <KText variant="bodyStrong">{catName(v.budget.categoryId)}</KText>
                  <KText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
                    {hideAmounts
                      ? 'Rs •••• of Rs ••••'
                      : `${formatRupees(money(v.spentCents))} of ${formatRupees(v.budget.amount)}`}
                  </KText>
                </View>
                <ProgressBar label="Used" value={v.percent} detail={mask(v.detail)} />
                <Button variant="ghost" onPress={() => confirmDelete(v.budget.id, catName(v.budget.categoryId))}>
                  Delete budget
                </Button>
              </Card>
            ))
          )}
        </View>

        {views.length > 0 ? (
          <Button block onPress={openForm}>
            Set a budget
          </Button>
        ) : null}
      </Screen>

      <BottomSheet visible={showForm} title="Set a budget" onClose={() => setShowForm(false)}>
        <View style={{ gap: Space.s2 }}>
          <KText variant="overline">Category</KText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Space.s2 }}>
            {expenseCategories.map((c) => (
              <Chip key={c.id} label={c.name} selected={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
            ))}
          </View>
        </View>
        <Field label="Limit (Rs)" value={amount} onChangeText={setAmount} placeholder="15000" keyboardType="decimal-pad" />
        <Field label="Starts" value={periodStart} onChangeText={setPeriodStart} placeholder="YYYY-MM-DD" />
        <Field label="Ends" value={periodEnd} onChangeText={setPeriodEnd} placeholder="YYYY-MM-DD" />
        {error ? (
          <KText variant="bodyStrong" color="negative" accessibilityLiveRegion="polite">
            {error}
          </KText>
        ) : null}
        <Button block onPress={handleSave}>
          Save budget
        </Button>
      </BottomSheet>
    </>
  );
}
