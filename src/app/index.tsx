import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/kosh/icons';
import { KoshLogo } from '@/components/kosh/logo';
import { RecommendationCard } from '@/components/recommendation-card';
import {
  Amount,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconButton,
  KText,
  ProgressBar,
  Screen,
  SectionHeading,
  StatTile,
  TransactionRow,
} from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { budgetWarnings, buildBudgetLines, monthlyBudgetSummary } from '@/domain/budget';
import {
  daysLeftInMonth,
  groupByDate,
  monthKey,
  monthLabel,
  money,
  sumMonth,
  toDateKey,
} from '@/domain/overview';
import { DASHBOARD_MAX } from '@/domain/recommendations';
import { useRecommendations } from '@/hooks/use-recommendations';
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
  const { transactions, categories, budgetVersions, goals, paymentMethods, hideAmounts, toggleHideAmounts } =
    useAppStore();
  const { openNew, openEdit, sheet } = useTransactionEditor();

  const now = new Date();
  const month = monthKey(now);
  const today = toDateKey(now);
  const income = sumMonth(transactions, 'income', month);
  const expenses = sumMonth(transactions, 'expense', month);
  const saved = income - expenses;
  const budgetLines = buildBudgetLines(budgetVersions, transactions, month);
  const limit = monthlyBudgetSummary(budgetLines);
  const budgetAlerts = budgetWarnings(
    budgetLines,
    (l) => (l.scope === 'overall' ? 'monthly budget' : `${categories.find((c) => c.id === l.categoryId)?.name ?? l.categoryId} budget`),
    (c, cur) => (hideAmounts ? 'Rs ••••' : formatRupees({ currency: cur, cents: c })),
  );
  const recs = useRecommendations();
  const [allRecs, setAllRecs] = useState(false);
  const todayRows = groupByDate(transactions, now).find((g) => g.dateKey === today)?.rows ?? [];
  const featuredGoal = goals.find((g) => g.currentAmount.cents < g.targetAmount.cents) ?? goals[0];

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const pmName = (id?: string) => paymentMethods.find((p) => p.id === id)?.name;

  const heroCents = limit ? Math.max(limit.limitCents - limit.spentCents, 0) : saved;

  return (
    <>
      <Screen>
        <View style={styles.top}>
          <View style={styles.brand}>
            <KoshLogo size={44} />
            <View style={{ flexShrink: 1 }}>
              <KText variant="title" accessibilityRole="header">
                {greeting(now.getHours())}
              </KText>
              <KText variant="caption">{monthLabel(now)}</KText>
            </View>
          </View>
          <View style={styles.actions}>
            <IconButton label="Notification settings" onPress={() => router.push('/settings')}>
              <Icon name="bell" color={theme.ink} />
            </IconButton>
            <IconButton
              label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
              onPress={toggleHideAmounts}>
              <Icon name={hideAmounts ? 'eye-off' : 'eye'} color={theme.ink} />
            </IconButton>
          </View>
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

        {budgetAlerts.length > 0 ? (
          <Card tint style={{ gap: Space.s2 }}>
            <KText variant="overline">Spending alert</KText>
            {budgetAlerts.map((w) => (
              <KText key={w} variant="bodyStrong">
                {w}
              </KText>
            ))}
            <Button variant="ghost" onPress={() => router.push('/budgets')}>
              See budgets
            </Button>
          </Card>
        ) : null}

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

        <View style={{ gap: Space.s3 }}>
          <View style={styles.headRow}>
            <SectionHeading>What you can improve</SectionHeading>
            {recs.recommendations.length > DASHBOARD_MAX ? (
              <Button variant="ghost" onPress={() => setAllRecs(true)}>
                {`See all (${recs.recommendations.length})`}
              </Button>
            ) : null}
          </View>
          {recs.recommendations.slice(0, DASHBOARD_MAX).map((r) => (
            <RecommendationCard key={r.key} rec={r} masked={hideAmounts} />
          ))}
          {recs.notices.map((n) => (
            <KText key={n.id} variant="caption">
              {n.text}
            </KText>
          ))}
        </View>
      </Screen>
      <BottomSheet visible={allRecs} title="All recommendations" onClose={() => setAllRecs(false)}>
        {recs.recommendations.map((r) => (
          <RecommendationCard key={r.key} rec={r} masked={hideAmounts} />
        ))}
        {recs.notices.map((n) => (
          <KText key={n.id} variant="caption">
            {n.text}
          </KText>
        ))}
      </BottomSheet>
      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', gap: Space.s2 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.s3 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Space.s3, flexShrink: 1 },
  pair: { flexDirection: 'row', gap: Space.s3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s3 },
  half: { flexBasis: '47%', flexGrow: 1, minWidth: 0 },
  full: { flexBasis: '100%' },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
