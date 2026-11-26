import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import type { Category, PaymentMethod } from '@/db/seed';
import * as BudgetDB from '@/db/budgets';
import type { BudgetScope, BudgetVersion } from '@/domain/budget';
import { DEFAULT_CURRENCY, monthKey } from '@/domain/overview';
import type { SavingsGoal, SavingsGoalInput, SavingsGoalWithProgress } from '@/db/goals';
import * as GoalDB from '@/db/goals';
import type { Transaction, TransactionInput, TransactionFilters } from '@/db/transactions';
import * as TransactionDB from '@/db/transactions';
import * as SeedDB from '@/db/seed';
import type { Money } from '@/utils/money';
import { computeGoalProgress } from '@/db/goals';

export type Profile = {
  id: string;
  name: string;
  currency: string;
};

type AppState = {
  profile: Profile | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  budgetVersions: BudgetVersion[];
  goals: SavingsGoal[];
  isLoaded: boolean;
  /** Session-only privacy mask for amounts. */
  hideAmounts: boolean;
  toggleHideAmounts: () => void;

  load: () => Promise<void>;
  reloadTransactions: (filters?: TransactionFilters) => Promise<void>;
  reloadBudgets: () => Promise<void>;
  reloadGoals: () => Promise<void>;
  setProfile: (profile: Partial<Profile>) => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: Partial<TransactionInput>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  /** Create or change a budget from the current month onward. */
  setBudget: (scope: BudgetScope, categoryId: string | null, amountCents: number) => Promise<void>;
  /** Remove a budget from the current month onward; earlier months keep their amount. */
  removeBudget: (scope: BudgetScope, categoryId: string | null) => Promise<void>;
  addGoal: (input: SavingsGoalInput) => Promise<SavingsGoal>;
  updateGoal: (id: string, input: Partial<SavingsGoalInput>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  getTotals: (type: 'income' | 'expense', startDate?: string, endDate?: string) => Money;
  getCategoryTotals: (
    type: 'income' | 'expense',
    startDate?: string,
    endDate?: string
  ) => { categoryId: string; categoryName: string; amount: Money }[];
  getGoalProgress: (goal: SavingsGoal) => SavingsGoalWithProgress;
};

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  categories: [],
  paymentMethods: [],
  transactions: [],
  budgetVersions: [],
  goals: [],
  isLoaded: false,
  hideAmounts: false,
  toggleHideAmounts: () => set((state) => ({ hideAmounts: !state.hideAmounts })),

  load: async () => {
    await SeedDB.seedDefaultData();
    const [categories, paymentMethods, transactions, budgetVersions, goals] = await Promise.all([
      SeedDB.getCategories(),
      SeedDB.getPaymentMethods(),
      TransactionDB.listTransactions(),
      BudgetDB.getBudgetVersions(),
      GoalDB.getGoals(),
    ]);
    set({ categories, paymentMethods, transactions, budgetVersions, goals, isLoaded: true });
  },

  reloadTransactions: async (filters) => {
    const transactions = await TransactionDB.listTransactions(filters);
    set({ transactions });
  },

  reloadBudgets: async () => {
    const budgetVersions = await BudgetDB.getBudgetVersions();
    set({ budgetVersions });
  },

  reloadGoals: async () => {
    const goals = await GoalDB.getGoals();
    set({ goals });
  },

  setProfile: async (partial) => {
    const { profile } = get();
    const next: Profile = profile
      ? { ...profile, ...partial }
      : { id: 'default', name: partial.name ?? '', currency: partial.currency ?? 'INR' };
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO profiles (id, name, currency, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, currency = excluded.currency, updated_at = datetime('now')`,
      [next.id, next.name, next.currency]
    );
    set({ profile: next });
  },

  addTransaction: async (input) => {
    const transaction = await TransactionDB.createTransaction(input);
    set((state) => ({ transactions: [transaction, ...state.transactions] }));
    return transaction;
  },

  updateTransaction: async (id, input) => {
    const transaction = await TransactionDB.updateTransaction(id, input);
    if (!transaction) return;
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? transaction : t)),
    }));
  },

  removeTransaction: async (id) => {
    const ok = await TransactionDB.deleteTransaction(id);
    if (!ok) return;
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
  },

  setBudget: async (scope, categoryId, amountCents) => {
    await BudgetDB.setBudgetVersion({
      scope,
      categoryId,
      month: monthKey(new Date()),
      amountCents,
      currency: get().profile?.currency ?? DEFAULT_CURRENCY,
    });
    await get().reloadBudgets();
  },

  removeBudget: async (scope, categoryId) => {
    await BudgetDB.removeBudgetVersion(
      scope,
      categoryId,
      monthKey(new Date()),
      get().profile?.currency ?? DEFAULT_CURRENCY,
    );
    await get().reloadBudgets();
  },

  addGoal: async (input) => {
    const goal = await GoalDB.createGoal(input);
    set((state) => ({ goals: [...state.goals, goal] }));
    return goal;
  },

  updateGoal: async (id, input) => {
    const goal = await GoalDB.updateGoal(id, input);
    if (!goal) return;
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? goal : g)),
    }));
  },

  removeGoal: async (id) => {
    const ok = await GoalDB.deleteGoal(id);
    if (!ok) return;
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  getTotals: (type, startDate, endDate) => {
    const { transactions } = get();
    const cents = transactions
      .filter((t) => t.type === type)
      .filter((t) => (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate))
      .reduce((sum, t) => sum + t.amount.cents, 0);
    return { currency: 'INR', cents };
  },

  getCategoryTotals: (type, startDate, endDate) => {
    const { transactions, categories } = get();
    const byCat = new Map<string, { name: string; cents: number }>();
    for (const t of transactions) {
      if (t.type !== type) continue;
      if (startDate && t.date < startDate) continue;
      if (endDate && t.date > endDate) continue;
      const category = categories.find((c) => c.id === t.categoryId);
      const name = category ? category.name : t.categoryId;
      if (!byCat.has(t.categoryId)) {
        byCat.set(t.categoryId, { name, cents: 0 });
      }
      byCat.get(t.categoryId)!.cents += t.amount.cents;
    }
    return Array.from(byCat.entries()).map(([categoryId, value]) => ({
      categoryId,
      categoryName: value.name,
      amount: { currency: 'INR', cents: value.cents },
    }));
  },

  getGoalProgress: (goal) => {
    return computeGoalProgress(goal);
  },
}));
