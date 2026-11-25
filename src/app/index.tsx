import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/kosh/icons';
import {
  Amount,
  Button,
  Card,
  EmptyState,
  IconButton,
  InsightCard,
  KText,
  ProgressBar,
  Screen,
  SectionHeading,
  StatTile,
  TransactionRow,
} from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import {
  daysLeftInMonth,
  findInsight,
  groupByDate,
  monthKey,
  monthLabel,
  monthlyLimit,
  money,
  sumMonth,
  toDateKey,
} from '@/domain/overview';
import { useTheme } from '@/hooks/use-theme';
import { useTransactionEditor } from '@/hooks/use-transaction-editor';
import { useAppStore } from '@/store/appStore';
import { formatRupees } from '@/utils/money';

function greeting(hour: number): string {
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { transactions, categories, budgets, goals, paymentMethods, hideAmounts, toggleHideAmounts } =
    useAppStore();
  const { openNew, openEdit, sheet } = useTransactionEditor();

  const now = new Date();
  const month = monthKey(now);
  const today = toDateKey(now);
  const income = sumMonth(transactions, 'income', month);
  const expenses = sumMonth(transactions, 'expense', month);
  const saved = income - expenses;
  const limit = monthlyLimit(budgets, transactions, today);
  const insight = findInsight(transactions, categories, now);
  const todayRows = groupByDate(transactions, now).find((g) => g.dateKey === today)?.rows ?? [];
  const featuredGoal = goals.find((g) => g.currentAmount.cents < g.targetAmount.cents) ?? goals[0];

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const pmName = (id?: string) => paymentMethods.find((p) => p.id === id)?.name;

  const heroCents = limit ? limit.limitCents - limit.spentCents : saved;

  return (
    <>
      <Screen>
        <View style={styles.top}>
          <View style={{ flexShrink: 1 }}>
            <KText variant="title" accessibilityRole="header">
              {greeting(now.getHours())}
            </KText>
            <KText variant="caption">{monthLabel(now)}</KText>
          </View>
          <IconButton
            label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
            onPress={toggleHideAmounts}>
            <Icon name={hideAmounts ? 'eye-off' : 'eye'} color={theme.ink} />
          </IconButton>
        </View>

        <Card style={{ gap: Space.s3 }}>
          <KText variant="overline">{limit ? 'Left to spend this month' : 'Saved this month'}</KText>
          <Amount money={money(heroCents)} size="xl" masked={hideAmounts} />
          {limit ? (
            <>
              <KText variant="caption">
                {`of ${hideAmounts ? 'Rs ••••' : formatRupees(money(limit.limitCents))} monthly limit · ${daysLeftInMonth(now)} days left`}
              </KText>
              <ProgressBar
                label="Monthly limit used"
                value={limit.percent}
                detail={
                  hideAmounts
                    ? undefined
                    : limit.limitCents >= limit.spentCents
                      ? `${formatRupees(money(limit.limitCents - limit.spentCents))} left`
                      : `${formatRupees(money(limit.spentCents - limit.limitCents))} over`
                }
              />
            </>
          ) : (
            <KText variant="caption">Set a budget to see how much you can still spend.</KText>
          )}
        </Card>

        <View style={styles.pair}>
          <Button block onPress={() => openNew('expense')} style={{ flex: 1 }}>
            Add expense
          </Button>
          <Button block variant="secondary" onPress={() => openNew('income')} style={{ flex: 1 }}>
            Add income
          </Button>
        </View>

        <View style={{ gap: Space.s3 }}>
          <SectionHeading>This month</SectionHeading>
          <View style={styles.grid}>
            <View style={styles.half}>
              <StatTile label="Income" money={money(income)} tone="in" masked={hideAmounts} />
            </View>
            <View style={styles.half}>
              <StatTile label="Expenses" money={money(expenses)} tone="out" masked={hideAmounts} />
            </View>
            <View style={styles.full}>
              <StatTile
                label="Saved"
                money={money(saved)}
                caption={
                  income > 0 ? `${Math.round((saved / income) * 100)}% of income` : undefined
                }
                masked={hideAmounts}
              />
            </View>
          </View>
        </View>

        {featuredGoal ? (
          <View style={{ gap: Space.s3 }}>
            <View style={styles.headRow}>
              <SectionHeading>Savings goal</SectionHeading>
              <Button variant="ghost" onPress={() => router.push('/goals')}>
                All goals
              </Button>
            </View>
            <Card>
              <ProgressBar
                label={featuredGoal.name}
                kind="goal"
                value={
                  featuredGoal.targetAmount.cents > 0
                    ? (featuredGoal.currentAmount.cents / featuredGoal.targetAmount.cents) * 100
                    : 0
                }
                detail={
                  hideAmounts
                    ? undefined
                    : `${formatRupees(featuredGoal.currentAmount)} of ${formatRupees(featuredGoal.targetAmount)}`
                }
              />
            </Card>
          </View>
        ) : null}

        <View style={{ gap: Space.s3 }}>
          <View style={styles.headRow}>
            <SectionHeading>Today</SectionHeading>
            <Button variant="ghost" onPress={() => router.push('/transactions')}>
              See all
            </Button>
          </View>
          {todayRows.length === 0 ? (
            <EmptyState
              message="Nothing recorded today. Add what you spent or received."
              action="Add expense"
              onAction={() => openNew('expense')}
            />
          ) : (
            <View style={{ gap: Space.s2 }}>
              {todayRows.map((t) => (
                <TransactionRow
                  key={t.id}
                  category={catName(t.categoryId)}
                  note={t.note}
                  type={t.type}
                  money={t.amount}
                  meta={pmName(t.paymentMethodId)}
                  masked={hideAmounts}
                  onPress={() => openEdit(t)}
                />
              ))}
            </View>
          )}
        </View>

        {insight ? (
          <InsightCard
            tag={insight.categoryName}
            title={`${insight.categoryName} spending is ${insight.percentAbove}% above your usual`}
            body={`You spent ${formatRupees(money(insight.thisMonthCents))} on ${insight.categoryName.toLowerCase()} this month. Your 3-month average is ${formatRupees(money(insight.averageCents))}.`}
            saving={money(insight.savingCents)}
            action="See budgets"
            onAction={() => router.push('/budgets')}
          />
        ) : null}
      </Screen>
      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.s3 },
  pair: { flexDirection: 'row', gap: Space.s3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s3 },
  half: { flexBasis: '47%', flexGrow: 1, minWidth: 0 },
  full: { flexBasis: '100%' },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
