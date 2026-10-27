import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import type { Category, PaymentMethod } from '@/db/seed';
import type {
  Budget,
  BudgetInput,
  BudgetWithSpending,
} from '@/db/budgets';
import * as BudgetDB from '@/db/budgets';
import type { SavingsGoal, SavingsGoalInput, SavingsGoalWithProgress } from '@/db/goals';
import * as GoalDB from '@/db/goals';
import type { Transaction, TransactionInput, TransactionFilters } from '@/db/transactions';
import * as TransactionDB from '@/db/transactions';
import * as SeedDB from '@/db/seed';
import type { Money } from '@/utils/money';
import { computeBudgetStatus } from '@/db/budgets';
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
  budgets: Budget[];
  goals: SavingsGoal[];
  isLoaded: boolean;

  load: () => Promise<void>;
  reloadTransactions: (filters?: TransactionFilters) => Promise<void>;
  reloadBudgets: () => Promise<void>;
  reloadGoals: () => Promise<void>;
  setProfile: (profile: Partial<Profile>) => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: Partial<TransactionInput>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addBudget: (input: BudgetInput) => Promise<Budget>;
  updateBudget: (id: string, input: Partial<BudgetInput>) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  addGoal: (input: SavingsGoalInput) => Promise<SavingsGoal>;
  updateGoal: (id: string, input: Partial<SavingsGoalInput>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  getTotals: (type: 'income' | 'expense', startDate?: string, endDate?: string) => Money;
  getCategoryTotals: (
    type: 'income' | 'expense',
    startDate?: string,
    endDate?: string
  ) => { categoryId: string; categoryName: string; amount: Money }[];
  getBudgetStatus: (budget: Budget) => BudgetWithSpending;
  getGoalProgress: (goal: SavingsGoal) => SavingsGoalWithProgress;
};

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  categories: [],
  paymentMethods: [],
  transactions: [],
  budgets: [],
  goals: [],
  isLoaded: false,

  load: async () => {
    await SeedDB.seedDefaultData();
    const [categories, paymentMethods, transactions, budgets, goals] = await Promise.all([
      SeedDB.getCategories(),
      SeedDB.getPaymentMethods(),
      TransactionDB.listTransactions(),
      BudgetDB.getBudgets(),
      GoalDB.getGoals(),
    ]);
    set({ categories, paymentMethods, transactions, budgets, goals, isLoaded: true });
  },

  reloadTransactions: async (filters) => {
    const transactions = await TransactionDB.listTransactions(filters);
    set({ transactions });
  },

  reloadBudgets: async () => {
    const budgets = await BudgetDB.getBudgets();
    set({ budgets });
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

  addBudget: async (input) => {
    const budget = await BudgetDB.createBudget(input);
    set((state) => ({ budgets: [...state.budgets, budget] }));
    return budget;
  },

  updateBudget: async (id, input) => {
    const budget = await BudgetDB.updateBudget(id, input);
    if (!budget) return;
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? budget : b)),
    }));
  },

  removeBudget: async (id) => {
    const ok = await BudgetDB.deleteBudget(id);
    if (!ok) return;
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
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

  getBudgetStatus: (budget) => {
    return computeBudgetStatus(budget, 0);
  },

  getGoalProgress: (goal) => {
    return computeGoalProgress(goal);
  },
}));
