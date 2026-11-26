import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/kosh/icons';
import {
  Button,
  Chip,
  EmptyState,
  IconButton,
  KText,
  Screen,
  TransactionRow,
} from '@/components/kosh/kosh';
import { FontFamily, Radius, Space, TapMin } from '@/constants/theme';
import { groupByDate, money } from '@/domain/overview';
import { useTheme } from '@/hooks/use-theme';
import { useTransactionEditor } from '@/hooks/use-transaction-editor';
import type { Transaction } from '@/db/transactions';
import { useAppStore } from '@/store/appStore';
import { formatRupees } from '@/utils/money';

type TypeFilter = 'all' | 'expense' | 'income';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { transactions, categories, paymentMethods, removeTransaction, hideAmounts } = useAppStore();
  const { openNew, openEdit, sheet } = useTransactionEditor();

  const [filter, setFilter] = useState<TypeFilter>('all');
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const pmName = (id?: string) => paymentMethods.find((p) => p.id === id)?.name;

  const needle = search.trim().toLowerCase();
  const filtered = transactions.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (needle && !`${catName(t.categoryId)} ${t.note ?? ''}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const groups = groupByDate(filtered, new Date());

  const confirmDelete = (t: Transaction) =>
    Alert.alert('Delete transaction?', `${t.note || catName(t.categoryId)} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(t.id) },
    ]);

  return (
    <>
      <Screen>
        <View style={styles.top}>
          <KText variant="title" accessibilityRole="header">
            Transactions
          </KText>
          <IconButton
            label={searching ? 'Close search' : 'Search transactions'}
            onPress={() => {
              setSearching(!searching);
              if (searching) setSearch('');
            }}>
            <Icon name={searching ? 'close' : 'search'} color={theme.ink} />
          </IconButton>
        </View>

        {searching ? (
          <TextInput
            accessibilityLabel="Search transactions"
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder="Search by category or note"
            placeholderTextColor={theme.inkMuted}
            style={[
              styles.input,
              { backgroundColor: theme.surface200, borderColor: theme.lineStrong, color: theme.ink },
            ]}
          />
        ) : null}

        <View style={styles.chips}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Expenses" selected={filter === 'expense'} onPress={() => setFilter('expense')} />
          <Chip label="Income" selected={filter === 'income'} onPress={() => setFilter('income')} />
        </View>

        {groups.length === 0 ? (
          <EmptyState
            message={
              transactions.length === 0
                ? 'No transactions yet. Add your first expense or income.'
                : 'No transactions match your filters.'
            }
            action={transactions.length === 0 ? 'Add expense' : undefined}
            onAction={() => openNew('expense')}
          />
        ) : (
          groups.map((g) => (
            <View key={g.dateKey} style={{ gap: Space.s3 }}>
              <View style={styles.groupHead}>
                <KText variant="heading" accessibilityRole="header">
                  {g.label}
                </KText>
                <KText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
                  {hideAmounts
                    ? 'Rs ••••'
                    : formatRupees(money(g.netCents), g.netCents >= 0 ? '+' : '−')}
                </KText>
              </View>
              <View style={{ gap: Space.s2 }}>
                {g.rows.map((t) => (
                  <TransactionRow
                    key={t.id}
                    category={catName(t.categoryId)}
                    note={t.note}
                    type={t.type}
                    money={t.amount}
                    meta={pmName(t.paymentMethodId)}
                    masked={hideAmounts}
                    onPress={() => openEdit(t)}
                    onDelete={() => confirmDelete(t)}
                  />
                ))}
              </View>
            </View>
          ))
        )}

        <Button block onPress={() => openNew('expense')}>
          Add transaction
        </Button>
      </Screen>
      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s2 },
  groupHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  input: {
    minHeight: TapMin,
    borderWidth: 2,
    borderRadius: Radius.sm,
    paddingHorizontal: Space.s3,
    fontFamily: FontFamily.sans500,
    fontSize: 15,
  },
});
