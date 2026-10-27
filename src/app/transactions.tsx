import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TransactionForm } from '@/components/transaction-form';
import type { Category } from '@/db/seed';
import type { Transaction, TransactionFilters } from '@/db/transactions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';
import { useAppStore } from '@/store/appStore';

export default function TransactionsScreen() {
  const theme = useTheme();
  const {
    transactions,
    categories,
    paymentMethods,
    reloadTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const filters: TransactionFilters = {};
  if (search) filters.search = search;
  if (categoryFilter) filters.categoryId = categoryFilter;
  if (typeFilter) filters.type = typeFilter;

  const filtered = transactions.filter((t) => {
    if (filters.search) {
      const haystack = `${t.categoryId} ${t.note ?? ''}`.toLowerCase();
      if (!haystack.includes(filters.search!.toLowerCase())) return false;
    }
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
    if (filters.type && t.type !== filters.type) return false;
    return true;
  });

  const income = filtered.reduce((sum, t) => (t.type === 'income' ? sum + t.amount.cents : sum), 0);
  const expense = filtered.reduce((sum, t) => (t.type === 'expense' ? sum + t.amount.cents : sum), 0);

  const categoryOptions: Category[] = categories;

  const handleSave = async (input: Parameters<typeof addTransaction>[0]) => {
    if (editingId) {
      await updateTransaction(editingId, input);
    } else {
      await addTransaction(input);
    }
    await reloadTransactions(filters);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Transactions</ThemedText>

        <View style={styles.summaryRow}>
          <SummaryChip label="Income" value={formatMoney({ currency: 'INR', cents: income })} positive />
          <SummaryChip label="Expenses" value={formatMoney({ currency: 'INR', cents: expense })} positive={false} />
        </View>

        <View style={styles.filterBar}>
          <TextInput
            placeholder="Search transactions"
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, inputStyle]}
            clearButtonMode="always"
          />
          <View style={styles.filterRow}>
            <ThemedText type="small">Category</ThemedText>
            <Button
              label={
                categoryFilter
                  ? categoryOptions.find((c) => c.id === categoryFilter)?.name ?? 'All'
                  : 'All'
              }
              onPress={() => setCategoryFilter(undefined)}
              type="default"
            />
            <Button
              label={typeFilter ?? 'All'}
              onPress={() => setTypeFilter(undefined)}
              type="default"
            />
          </View>
        </View>

        <Button
          label="Add Transaction"
          onPress={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          type="default"
        />

        {showForm && (
          <ThemedView type="backgroundElement" style={styles.formCard}>
            <TransactionForm
              categories={categoryOptions}
              paymentMethods={paymentMethods}
              transaction={editingId ? transactions.find((t) => t.id === editingId) : undefined}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </ThemedView>
        )}

        <ThemedText type="smallBold" style={styles.listTitle}>
          {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
        </ThemedText>

        {filtered.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No transactions match your filters.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {filtered.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onPress={() => { setEditingId(t.id); setShowForm(true); }}
                onDelete={() => removeTransaction(t.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function SummaryChip({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.summaryChip, { borderLeftColor: positive ? '#4db6ac' : '#e57373' }]}
    >
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

function TransactionRow({
  transaction,
  onPress,
  onDelete,
}: {
  transaction: Transaction;
  onPress: () => void;
  onDelete: () => void;
}) {
  const isIncome = transaction.type === 'income';
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.row, { borderLeftColor: isIncome ? '#4db6ac' : '#e57373' }]}
    >
      <Pressable style={styles.rowPressable} onPress={onPress}>
        <ThemedView style={styles.rowContent}>
          <ThemedText type="default" numberOfLines={1}>
            {transaction.categoryId}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {transaction.date}
          </ThemedText>
          {transaction.note && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
              {transaction.note}
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
      <ThemedView style={styles.rowActions}>
        <ThemedText
          type="default"
          style={{ color: isIncome ? '#4db6ac' : '#e57373', fontWeight: '600' }}
        >
          {formatMoney(transaction.amount)}
        </ThemedText>
        <PressableDelete onPress={onDelete} />
      </ThemedView>
    </ThemedView>
  );
}

function PressableDelete({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.two }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
      <ThemedText type="small" style={{ color: '#e57373', fontWeight: '600' }}>
        Delete
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  title: { fontSize: 32, fontWeight: 600, lineHeight: 44 },
  summaryRow: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.four },
  summaryChip: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    minWidth: 130,
  },
  statValue: { fontSize: 20, fontWeight: 600, marginTop: Spacing.half },
  filterBar: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.four, flexWrap: 'wrap' },
  searchInput: {
    flex: 1,
    minHeight: 44,
  },
  filterRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  formCard: { marginBottom: Spacing.four, padding: Spacing.four, borderRadius: Spacing.three },
  listTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.three },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    marginBottom: Spacing.two,
  },
  rowPressable: { flex: 1 },
  rowContent: { flex: 1, gap: Spacing.half },
  note: { fontStyle: 'italic' },
  rowActions: { gap: Spacing.two, alignItems: 'center' },
});
