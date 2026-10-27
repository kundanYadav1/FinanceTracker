import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import type { Money } from '@/utils/money';
import { toCents } from '@/utils/money';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category, PaymentMethod } from '@/db/seed';

export type TransactionFormProps = {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transaction?: {
    id: string;
    type: 'income' | 'expense';
    amount: Money;
    categoryId: string;
    paymentMethodId?: string;
    date: string;
    note?: string;
    isRecurring: boolean;
  };
  onSave: (input: {
    type: 'income' | 'expense';
    amount: Money;
    categoryId: string;
    paymentMethodId?: string;
    date: string;
    note?: string;
    isRecurring: boolean;
  }) => void | Promise<void>;
  onCancel: () => void;
};

export function TransactionForm({ categories, paymentMethods, transaction, onSave, onCancel }: TransactionFormProps) {
  const theme = useTheme();
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction ? (transaction.amount.cents / 100).toFixed(2) : '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? categories[0]?.id ?? '');
  const [paymentMethodId, setPaymentMethodId] = useState(transaction?.paymentMethodId ?? '');
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(transaction?.note ?? '');
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring ?? false);

  const handleSave = async () => {
    const cents = toCents(amount);
    await onSave({
      type,
      amount: { currency: 'INR', cents },
      categoryId,
      paymentMethodId: paymentMethodId || undefined,
      date,
      note: note || undefined,
      isRecurring,
    });
  };

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

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {transaction ? 'Edit Transaction' : 'Add Transaction'}
      </ThemedText>

      <ThemedText type="small">Type</ThemedText>
      <View style={styles.toggleRow}>
        <TypeChip value="income" selected={type === 'income'} onPress={() => setType('income')} theme={theme} />
        <TypeChip value="expense" selected={type === 'expense'} onPress={() => setType('expense')} theme={theme} />
      </View>

      <ThemedText type="small" style={styles.label}>Amount</ThemedText>
      <TextInput style={inputStyle} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" />

      <ThemedText type="small" style={styles.label}>Category</ThemedText>
      <View style={styles.chipGrid}>
        {categories.map((cat) => {
          const selected = cat.id === categoryId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setCategoryId(cat.id)}
            >
              <ThemedText
                type="small"
                style={[
                  styles.chipText,
                  selected ? { color: '#fff' } : { color: theme.textSecondary },
                ]}
              >
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ThemedText type="small" style={styles.label}>Payment Method</ThemedText>
      <View style={styles.chipGrid}>
        {paymentMethods.map((pm) => {
          const selected = paymentMethodId === pm.id;
          return (
            <TouchableOpacity
              key={pm.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setPaymentMethodId(pm.id)}
            >
              <ThemedText
                type="small"
                style={[
                  styles.chipText,
                  selected ? { color: '#fff' } : { color: theme.textSecondary },
                ]}
              >
                {pm.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ThemedText type="small" style={styles.label}>Date</ThemedText>
      <TextInput style={inputStyle} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <ThemedText type="small" style={styles.label}>Note (optional)</ThemedText>
      <TextInput style={inputStyle} value={note} onChangeText={setNote} placeholder="e.g. Groceries" />

      <View style={styles.recurringRow}>
        <TouchableOpacity style={styles.recurringWrap} onPress={() => setIsRecurring(!isRecurring)}>
          <ThemedText type="small" style={styles.recurringText}>
            {isRecurring ? '✓' : '○'} Recurring
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.backgroundElement }]} onPress={onCancel}>
          <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>{transaction ? 'Save' : 'Add'}</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function TypeChip({ value, selected, onPress, theme }: { value: 'income' | 'expense'; selected: boolean; onPress: () => void; theme: ReturnType<typeof useTheme> }) {
  return (
    <TouchableOpacity
      style={[styles.typeChip, selected && styles.typeChipSelected]}
      onPress={onPress}>
      <ThemedText
        type="smallBold"
        style={[
          styles.typeChipText,
          selected ? { color: '#fff' } : { color: theme.textSecondary },
        ]}>
        {value === 'income' ? 'Income' : 'Expense'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.two },
  label: { fontSize: 12, fontWeight: 600, marginBottom: Spacing.half },
  toggleRow: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.two },
  typeChip: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#E0E1E6',
    alignItems: 'center',
  },
  typeChipSelected: {
    backgroundColor: '#3c87f7',
    borderColor: '#3c87f7',
  },
  typeChipText: { fontSize: 13, fontWeight: 600 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#E0E1E6',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#3c87f7',
    borderColor: '#3c87f7',
  },
  chipText: { fontSize: 12, fontWeight: 600 },
  recurringRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  recurringWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  recurringText: { fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.three,
    backgroundColor: '#3c87f7',
  },
});
