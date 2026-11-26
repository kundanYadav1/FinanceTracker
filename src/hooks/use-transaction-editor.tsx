import { useState, type ReactNode } from 'react';

import { TransactionSheet } from '@/components/transaction-form';
import type { Transaction } from '@/db/transactions';
import { useAppStore } from '@/store/appStore';

/** Owns the add/edit transaction sheet so any screen can open it. Render `sheet` once in the screen. */
export function useTransactionEditor(): {
  openNew: (type: 'income' | 'expense') => void;
  openEdit: (transaction: Transaction) => void;
  sheet: ReactNode;
} {
  const { categories, paymentMethods, addTransaction, updateTransaction } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [initialType, setInitialType] = useState<'income' | 'expense'>('expense');

  const sheet = (
    <TransactionSheet
      visible={visible}
      categories={categories}
      paymentMethods={paymentMethods}
      transaction={editing}
      initialType={initialType}
      onClose={() => setVisible(false)}
      onSave={async (input) => {
        if (editing) await updateTransaction(editing.id, input);
        else await addTransaction(input);
        setVisible(false);
      }}
    />
  );

  return {
    openNew: (type) => {
      setEditing(null);
      setInitialType(type);
      setVisible(true);
    },
    openEdit: (transaction) => {
      setEditing(transaction);
      setVisible(true);
    },
    sheet,
  };
}
