import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/utils/money';
import { useAppStore } from '@/store/appStore';
import type { Transaction } from '@/db/transactions';

export default function DashboardScreen() {
  const router = useRouter();
  const { transactions, getTotals } = useAppStore();

  const income = getTotals('income');
  const expenses = getTotals('expense');
  const savings = { currency: 'INR', cents: income.cents - expenses.cents };
  const recent = transactions.slice(0, 5);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Dashboard
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Your financial snapshot
        </ThemedText>

        <View style={styles.cardRow}>
          <StatCard label="Income" value={formatMoney(income)} positive />
          <StatCard label="Expenses" value={formatMoney(expenses)} positive={false} />
          <StatCard label="Savings" value={formatMoney(savings)} positive />
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Quick actions
          </ThemedText>
          <View style={styles.actionRow}>
            <Button onPress={() => router.push('/transactions')} label="Add Expense" type="expense" />
            <Button onPress={() => router.push('/transactions')} label="Add Income" type="income" />
            <Button onPress={() => router.push('/goals')} label="Savings Goals" type="default" />
            <Button onPress={() => router.push('/budgets')} label="Budgets" type="default" />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Recent transactions
          </ThemedText>
          {recent.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No transactions yet. Add your first expense or income.
            </ThemedText>
          ) : (
            <View style={styles.list}>
              {recent.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function StatCard({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.statCard, { borderLeftColor: positive ? '#4db6ac' : '#e57373' }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.row, { borderLeftColor: isIncome ? '#4db6ac' : '#e57373' }]}
    >
      <ThemedText type="default">
        {transaction.type === 'income' ? 'Income' : 'Expense'} · {transaction.date}
      </ThemedText>
      <ThemedText
        type="default"
        style={{ color: isIncome ? '#4db6ac' : '#e57373', fontWeight: '600' }}
      >
        {formatMoney(transaction.amount)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  title: { fontSize: 32, fontWeight: 600, lineHeight: 44 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.four },
  cardRow: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.four },
  statCard: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    minWidth: 120,
  },
  statValue: { fontSize: 20, fontWeight: 600, marginTop: Spacing.half },
  section: { marginBottom: Spacing.four },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.three },
  actionRow: { flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    borderLeftWidth: 4,
  },
});
