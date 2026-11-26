import { useMemo, useState } from 'react';
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
import {
  type BudgetLine,
  type BudgetScope,
  budgetWarnings,
  buildBudgetHistory,
  buildBudgetLines,
  shiftMonthKey,
  validateBudgetAmount,
} from '@/domain/budget';
import { monthKey, monthLabel, money } from '@/domain/overview';
import { useAppStore } from '@/store/appStore';
import { formatRupees, toCents } from '@/utils/money';

const HISTORY_MONTHS = 6;

function labelForMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return monthLabel(new Date(y, m - 1, 1));
}

function centsToInput(cents: number): string {
  const whole = Math.floor(cents / 100);
  const frac = cents % 100;
  return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, '0')}`;
}

function statusWord(line: BudgetLine): string {
  return line.status === 'Exceeded' ? 'Over budget' : line.status === 'Warning' ? 'Approaching limit' : 'Within budget';
}

function detailFor(line: BudgetLine): string {
  const c = line.currency;
  return line.status === 'Exceeded'
    ? `${formatRupees({ currency: c, cents: line.overspentCents })} over`
    : `${formatRupees({ currency: c, cents: line.remainingCents })} left`;
}

type FormState = { scope: BudgetScope; categoryId: string | null; editing: boolean };

export default function BudgetsScreen() {
  const { budgetVersions, categories, transactions, setBudget, removeBudget, hideAmounts } = useAppStore();
  const currentMonth = monthKey(new Date());

  const [month, setMonth] = useState(currentMonth);
  const [form, setForm] = useState<FormState | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? id ?? '';
  const editable = month === currentMonth;
  const mask = (text: string) => (hideAmounts ? undefined : text);
  const fmt = (cents: number, currency = 'INR') => (hideAmounts ? 'Rs ••••' : formatRupees({ currency, cents }));

  const earliest = useMemo(() => {
    const months = [currentMonth, ...budgetVersions.map((v) => v.effectiveFromMonth)];
    for (const t of transactions) months.push(t.date.slice(0, 7));
    return months.reduce((a, b) => (a < b ? a : b));
  }, [budgetVersions, transactions, currentMonth]);

  const lines = useMemo(() => buildBudgetLines(budgetVersions, transactions, month), [budgetVersions, transactions, month]);
  const overall = lines.find((l) => l.scope === 'overall');
  const categoryLines = lines.filter((l) => l.scope === 'category');
  const lineLabel = (l: BudgetLine) => (l.scope === 'overall' ? 'monthly budget' : `${catName(l.categoryId)} budget`);
  const warnings = budgetWarnings(lines, lineLabel, (c, cur) => fmt(c, cur));

  const historyScopes = useMemo(() => {
    const keys = Array.from(new Set(budgetVersions.map((v) => v.scopeKey)));
    return keys
      .sort((a, b) => (a === 'overall' ? -1 : b === 'overall' ? 1 : a.localeCompare(b)))
      .map((key) => ({
        key,
        title: key === 'overall' ? 'Monthly budget' : `${catName(key)} budget`,
        points: buildBudgetHistory(budgetVersions, transactions, key, month, HISTORY_MONTHS).filter(
          (p) => p.amountCents !== null,
        ),
      }))
      .filter((s) => s.points.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetVersions, transactions, month, categories]);

  const availableCategories = expenseCategories.filter((c) => !categoryLines.some((l) => l.categoryId === c.id));

  const openForm = (next: FormState, current?: BudgetLine) => {
    setForm(next);
    setAmount(current ? centsToInput(current.amountCents) : '');
    setError(null);
  };

  const openNewCategory = () => openForm({ scope: 'category', categoryId: availableCategories[0]?.id ?? null, editing: false });

  const handleSave = async () => {
    if (!form) return;
    let cents: number;
    try {
      cents = toCents(amount.replace(/,/g, ''));
    } catch {
      setError('Enter an amount with up to two decimals, for example 15000.');
      return;
    }
    const problem = validateBudgetAmount(cents);
    if (problem) return setError(problem);
    if (form.scope === 'category' && !form.categoryId) return setError('Pick a category.');
    try {
      await setBudget(form.scope, form.categoryId, cents);
      setForm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the budget.');
    }
  };

  const confirmRemove = (line: BudgetLine) =>
    Alert.alert(
      'Remove budget?',
      `The ${lineLabel(line)} stops applying from ${labelForMonth(currentMonth)}. Earlier months keep their budget.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => void removeBudget(line.scope, line.categoryId) },
      ],
    );

  const renderLine = (line: BudgetLine, title: string) => (
    <Card key={line.scopeKey} style={{ gap: Space.s3 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Space.s3 }}>
        <KText variant="bodyStrong">{title}</KText>
        <KText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
          {`${fmt(line.spentCents, line.currency)} of ${fmt(line.amountCents, line.currency)}`}
        </KText>
      </View>
      <ProgressBar
        label={line.utilizationPercent === null ? 'Zero budget' : 'Used'}
        value={line.progressPercent}
        state={line.status === 'Exceeded' ? 'over' : line.status === 'Warning' ? 'warn' : 'ok'}
        status={statusWord(line)}
        detail={mask(detailFor(line))}
      />
      {line.utilizationPercent === null ? (
        <KText variant="caption">A zero budget means any spending counts as over budget.</KText>
      ) : null}
      {editable ? (
        <View style={{ flexDirection: 'row', gap: Space.s2 }}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => openForm({ scope: line.scope, categoryId: line.categoryId, editing: true }, line)}>
            Edit
          </Button>
          <Button variant="ghost" style={{ flex: 1 }} onPress={() => confirmRemove(line)}>
            Remove
          </Button>
        </View>
      ) : null}
    </Card>
  );

  return (
    <>
      <Screen>
        <View>
          <KText variant="title" accessibilityRole="header">
            Budgets
          </KText>
          <KText variant="caption">{labelForMonth(month)}</KText>
        </View>

        <View style={{ flexDirection: 'row', gap: Space.s2 }}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            disabled={month <= earliest}
            onPress={() => setMonth(shiftMonthKey(month, -1))}>
            Previous month
          </Button>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            disabled={month >= currentMonth}
            onPress={() => setMonth(shiftMonthKey(month, 1))}>
            Next month
          </Button>
        </View>

        {warnings.length > 0 ? (
          <Card tint style={{ gap: Space.s2 }} >
            <KText variant="overline">Spending alert</KText>
            {warnings.map((w) => (
              <KText key={w} variant="bodyStrong" accessibilityLiveRegion="polite">
                {w}
              </KText>
            ))}
          </Card>
        ) : null}

        <View style={{ gap: Space.s3 }}>
          <SectionHeading>Monthly budget</SectionHeading>
          {overall ? (
            <>
              <Card style={{ gap: Space.s2 }}>
                <KText variant="overline">Spent this month</KText>
                <Amount money={money(overall.spentCents, overall.currency)} size="lg" masked={hideAmounts} />
              </Card>
              {renderLine(overall, 'All spending')}
            </>
          ) : editable ? (
            <EmptyState
              message="Set one limit for all your spending this month."
              action="Set monthly budget"
              onAction={() => openForm({ scope: 'overall', categoryId: null, editing: false })}
            />
          ) : (
            <KText variant="caption">No monthly budget was set for this month.</KText>
          )}
        </View>

        <View style={{ gap: Space.s3 }}>
          <SectionHeading>By category</SectionHeading>
          {categoryLines.length === 0 ? (
            editable ? (
              <EmptyState
                message="No category budgets yet. Set one to see how much you can still spend."
                action="Set a category budget"
                onAction={openNewCategory}
              />
            ) : (
              <KText variant="caption">No category budgets were set for this month.</KText>
            )
          ) : (
            categoryLines.map((l) => renderLine(l, catName(l.categoryId)))
          )}
          {editable && categoryLines.length > 0 && availableCategories.length > 0 ? (
            <Button block variant="secondary" onPress={openNewCategory}>
              Add category budget
            </Button>
          ) : null}
        </View>

        {historyScopes.length > 0 ? (
          <View style={{ gap: Space.s3 }}>
            <SectionHeading>History</SectionHeading>
            <KText variant="caption">{`Last ${HISTORY_MONTHS} months up to ${labelForMonth(month)}`}</KText>
            {historyScopes.map((s) => (
              <Card key={s.key} style={{ gap: Space.s2 }}>
                <KText variant="bodyStrong">{s.title}</KText>
                {s.points.map((p) => (
                  <View key={p.month} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Space.s3 }}>
                    <KText variant="caption">{labelForMonth(p.month)}</KText>
                    <KText
                      variant="caption"
                      style={{ fontVariant: ['tabular-nums'] }}
                      color={p.spentCents > (p.amountCents ?? 0) ? 'negative' : undefined}>
                      {`${fmt(p.spentCents)} of ${fmt(p.amountCents ?? 0)}`}
                      {p.spentCents > (p.amountCents ?? 0) ? ' · over' : ''}
                    </KText>
                  </View>
                ))}
              </Card>
            ))}
          </View>
        ) : null}

        {!editable ? (
          <KText variant="caption">Past months are read-only. Go to the current month to change budgets.</KText>
        ) : null}
      </Screen>

      <BottomSheet
        visible={form !== null}
        title={form?.scope === 'overall' ? 'Monthly budget' : form?.editing ? 'Edit budget' : 'Set a category budget'}
        onClose={() => setForm(null)}>
        {form?.scope === 'category' && !form.editing ? (
          <View style={{ gap: Space.s2 }}>
            <KText variant="overline">Category</KText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Space.s2 }}>
              {availableCategories.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  selected={c.id === form.categoryId}
                  onPress={() => setForm({ ...form, categoryId: c.id })}
                />
              ))}
            </View>
          </View>
        ) : form?.scope === 'category' ? (
          <KText variant="bodyStrong">{catName(form.categoryId)}</KText>
        ) : null}
        <Field label="Limit (Rs)" value={amount} onChangeText={setAmount} placeholder="15000" keyboardType="decimal-pad" />
        <KText variant="caption">{`Applies from ${labelForMonth(currentMonth)} onward. Earlier months are not changed.`}</KText>
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
