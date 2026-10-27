import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';
import { computeBudgetStatus } from '@/db/budgets';
import type { Budget } from '@/db/budgets';
import { useAppStore } from '@/store/appStore';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { budgets, categories, transactions, reloadBudgets, addBudget, removeBudget } = useAppStore();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0, 10));
  const [showForm, setShowForm] = useState(false);

  const inputStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: theme.backgroundElement,
    minHeight: 44,
  } as const;

  const handleSave = async () => {
    const cents = Math.round(parseFloat(amount || '0') * 100);
    await addBudget({ categoryId, amount: { currency: 'INR', cents }, periodStart, periodEnd });
    await reloadBudgets();
    setShowForm(false);
    setCategoryId('');
    setAmount('');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Budgets</ThemedText>

        {showForm && (
          <ThemedView type="backgroundElement" style={styles.formCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Set a Budget</ThemedText>
            <View style={styles.row}>
              <TextInput style={inputStyle} value={categoryId} onChangeText={setCategoryId} placeholder="Category id (e.g. cat_food)" />
              <TextInput style={inputStyle} value={amount} onChangeText={setAmount} placeholder="Amount" keyboardType="numeric" />
            </View>
            <View style={styles.row}>
              <TextInput style={inputStyle} value={periodStart} onChangeText={setPeriodStart} placeholder="Start date (YYYY-MM-DD)" />
              <TextInput style={inputStyle} value={periodEnd} onChangeText={setPeriodEnd} placeholder="End date (YYYY-MM-DD)" />
            </View>
            <Button label="Create Budget" onPress={handleSave} type="default" />
            <Button label="Cancel" onPress={() => setShowForm(false)} type="default" />
          </ThemedView>
        )}

        <Button label="Add Budget" onPress={() => setShowForm(true)} type="default" />

        <ThemedText type="smallBold" style={styles.listTitle}>
          {budgets.length} budget{budgets.length === 1 ? '' : 's'}
        </ThemedText>

        {budgets.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No budgets yet. Create your first budget.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {budgets.map((budget) => {
              const category = categories.find((c) => c.id === budget.categoryId);
              const spentCents = transactions
                .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
                .filter((t) => t.date >= budget.periodStart && t.date <= budget.periodEnd)
                .reduce((sum, t) => sum + t.amount.cents, 0);
              const status = computeBudgetStatus({ ...budget, amount: budget.amount }, spentCents);
              return (
                <BudgetRow key={budget.id} budget={budget} categoryName={category?.name ?? budget.categoryId} status={status} onDelete={() => removeBudget(budget.id)} />
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function BudgetRow({ budget, categoryName, status, onDelete }: { budget: Budget; categoryName: string; status: ReturnType<typeof computeBudgetStatus>; onDelete: () => void }) {
  const statusColor = status.status === 'Exceeded' ? '#e57373' : status.status === 'Warning' ? '#ffb74d' : '#4db6ac';
  const utilization = budget.amount.cents > 0 ? Math.round((status.spentCents / budget.amount.cents) * 100) : 0;
  return (
      <ThemedView type="backgroundElement" style={styles.budgetRow}>
      <ThemedView style={styles.rowContent}>
        <ThemedText type="default">{categoryName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{budget.periodStart} → {budget.periodEnd}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.rowActions}>
        <ThemedText type="default" style={{ fontWeight: '600' }}>
          {formatMoney(budget.amount)}
        </ThemedText>
        <ThemedText type="small" style={{ color: statusColor, fontWeight: '600' }}>
          {status.status} ({utilization}%)
        </ThemedText>
        <PressableDelete onPress={onDelete} />
      </ThemedView>
    </ThemedView>
  );
}

function PressableDelete({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.two }}>
      <ThemedText type="small" style={{ color: '#e57373', fontWeight: '600' }}>Delete</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  title: { fontSize: 32, fontWeight: 600, lineHeight: 44 },
  formCard: { marginBottom: Spacing.four, padding: Spacing.four, borderRadius: Spacing.three },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.three, flexWrap: 'wrap' },
  listTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.three },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
  list: { gap: Spacing.two },
  budgetRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    marginBottom: Spacing.two,
  },
  rowContent: { flex: 1, gap: Spacing.half },
  rowActions: { gap: Spacing.two, alignItems: 'center' },
});
