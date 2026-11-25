import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, IconButton, KText, Segmented } from '@/components/kosh/kosh';
import { Icon } from '@/components/kosh/icons';
import { FontFamily, Radius, Space, TapMin } from '@/constants/theme';
import type { Category, PaymentMethod } from '@/db/seed';
import { DEFAULT_CURRENCY, toDateKey } from '@/domain/overview';
import { useTheme } from '@/hooks/use-theme';
import type { Money } from '@/utils/money';
import { toCents } from '@/utils/money';

export type TransactionDraft = {
  type: 'income' | 'expense';
  amount: Money;
  categoryId: string;
  paymentMethodId?: string;
  date: string;
  note?: string;
  isRecurring: boolean;
};

export type TransactionSheetProps = {
  visible: boolean;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  /** Existing transaction to edit; omit to add. */
  transaction?: (TransactionDraft & { id: string }) | null;
  initialType?: 'income' | 'expense';
  onSave: (input: TransactionDraft) => void | Promise<void>;
  onClose: () => void;
};

/** Bottom sheet for adding or editing a transaction. */
export function TransactionSheet(props: TransactionSheetProps) {
  const theme = useTheme();
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={[styles.scrim, { backgroundColor: theme.scrim }]}>
        <Pressable accessibilityLabel="Close" style={{ flex: 1 }} onPress={props.onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.surface200 }]}>
            {props.visible ? <TransactionForm {...props} /> : null}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function TransactionForm({
  categories,
  paymentMethods,
  transaction,
  initialType = 'expense',
  onSave,
  onClose,
}: TransactionSheetProps) {
  const theme = useTheme();
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? initialType);
  const [amount, setAmount] = useState(transaction ? String(transaction.amount.cents / 100) : '');
  const [pickedCategoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [paymentMethodId, setPaymentMethodId] = useState(transaction?.paymentMethodId ?? '');
  const [date, setDate] = useState(transaction?.date.slice(0, 10) ?? toDateKey(new Date()));
  const [note, setNote] = useState(transaction?.note ?? '');
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring ?? false);
  const [error, setError] = useState<string | null>(null);

  const visibleCategories = categories.filter((c) => c.type === type);

  // Falls back to the first category of the chosen type when the picked one belongs to the other type.
  const categoryId = visibleCategories.some((c) => c.id === pickedCategoryId)
    ? pickedCategoryId
    : (visibleCategories[0]?.id ?? '');

  const handleSave = async () => {
    let cents: number;
    try {
      cents = toCents(amount.replace(/,/g, ''));
    } catch {
      setError('Enter an amount with up to two decimals, for example 450 or 450.50.');
      return;
    }
    if (cents <= 0) {
      setError('Amount must be more than zero.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Enter the date as YYYY-MM-DD.');
      return;
    }
    if (!categoryId) {
      setError('Pick a category.');
      return;
    }
    setError(null);
    await onSave({
      type,
      amount: { currency: transaction?.amount.currency ?? DEFAULT_CURRENCY, cents },
      categoryId,
      paymentMethodId: paymentMethodId || undefined,
      date,
      note: note.trim() || undefined,
      isRecurring,
    });
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.surface200, borderColor: theme.lineStrong, color: theme.ink },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ gap: Space.s5, padding: Space.s4, paddingTop: Space.s3 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={[styles.handle, { backgroundColor: theme.lineStrong }]} />
      <View style={styles.titleRow}>
        <KText variant="title" accessibilityRole="header">
          {transaction ? 'Edit transaction' : 'Add transaction'}
        </KText>
        <IconButton label="Close" onPress={onClose} bare>
          <Icon name="close" color={theme.ink} />
        </IconButton>
      </View>

      <Segmented
        value={type}
        onChange={setType}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
      />

      <View style={{ gap: Space.s1 }}>
        <KText variant="overline">Amount</KText>
        <View style={[styles.amountRow, { borderBottomColor: theme.lineStrong }]}>
          <KText variant="displayLg" color="inkMuted">
            Rs
          </KText>
          <TextInput
            accessibilityLabel="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.inkMuted}
            style={[styles.amountInput, { color: theme.ink }]}
          />
        </View>
      </View>

      <View style={{ gap: Space.s2 }}>
        <KText variant="overline">Category</KText>
        <View style={styles.chips}>
          {visibleCategories.map((c) => (
            <Chip key={c.id} label={c.name} selected={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
          ))}
        </View>
      </View>

      <View style={{ gap: Space.s1 }}>
        <KText variant="overline">Date</KText>
        <TextInput
          accessibilityLabel="Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.inkMuted}
          style={inputStyle}
        />
      </View>

      <View style={{ gap: Space.s2 }}>
        <KText variant="overline">Payment method</KText>
        <View style={styles.chips}>
          {paymentMethods.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              selected={p.id === paymentMethodId}
              onPress={() => setPaymentMethodId(p.id === paymentMethodId ? '' : p.id)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: Space.s1 }}>
        <KText variant="overline">Note</KText>
        <TextInput
          accessibilityLabel="Note"
          value={note}
          onChangeText={setNote}
          placeholder="Groceries for the week"
          placeholderTextColor={theme.inkMuted}
          style={inputStyle}
        />
      </View>

      <View style={styles.chips}>
        <Chip label="Recurring" selected={isRecurring} onPress={() => setIsRecurring(!isRecurring)} />
      </View>

      {error ? (
        <KText variant="bodyStrong" color="negative" accessibilityLiveRegion="polite">
          {error}
        </KText>
      ) : null}

      <Button block onPress={handleSave}>
        {transaction ? 'Save changes' : type === 'income' ? 'Save income' : 'Save expense'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  handle: { width: 40, height: 4, borderRadius: Radius.full, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s2 },
  input: {
    minHeight: TapMin,
    borderWidth: 2,
    borderRadius: Radius.sm,
    paddingHorizontal: Space.s3,
    fontFamily: FontFamily.sans500,
    fontSize: 15,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Space.s2, borderBottomWidth: 2 },
  amountInput: { flex: 1, minHeight: TapMin, fontFamily: FontFamily.display, fontSize: 32, paddingVertical: 0 },
});
