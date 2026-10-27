import { getDatabase } from './database';

export type Category = {
  id: string;
  type: 'expense' | 'income';
  name: string;
  color: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  isDefault: boolean;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', type: 'expense', name: 'Food', color: '#e57373', isDefault: true },
  { id: 'cat_groceries', type: 'expense', name: 'Groceries', color: '#81c784', isDefault: true },
  { id: 'cat_transport', type: 'expense', name: 'Transport', color: '#64b5f6', isDefault: true },
  { id: 'cat_rent', type: 'expense', name: 'Rent', color: '#ba68c8', isDefault: true },
  { id: 'cat_bills', type: 'expense', name: 'Bills', color: '#ffb74d', isDefault: true },
  { id: 'cat_shopping', type: 'expense', name: 'Shopping', color: '#ff8a80', isDefault: true },
  { id: 'cat_entertainment', type: 'expense', name: 'Entertainment', color: '#4db6ac', isDefault: true },
  { id: 'cat_health', type: 'expense', name: 'Health', color: '#aed581', isDefault: true },
  { id: 'cat_education', type: 'expense', name: 'Education', color: '#fff176', isDefault: true },
  { id: 'cat_travel', type: 'expense', name: 'Travel', color: '#90caf9', isDefault: true },
  { id: 'cat_emi', type: 'expense', name: 'EMI', color: '#f48fb1', isDefault: true },
  { id: 'cat_subscriptions', type: 'expense', name: 'Subscriptions', color: '#ce93d8', isDefault: true },
  { id: 'cat_other', type: 'expense', name: 'Other', color: '#bdbdbd', isDefault: true },
  { id: 'cat_salary', type: 'income', name: 'Salary', color: '#66bb6a', isDefault: true },
  { id: 'cat_business', type: 'income', name: 'Business', color: '#42a5f5', isDefault: true },
  { id: 'cat_freelance', type: 'income', name: 'Freelance', color: '#ab47bc', isDefault: true },
  { id: 'cat_investment', type: 'income', name: 'Investment', color: '#26a69a', isDefault: true },
  { id: 'cat_rental', type: 'income', name: 'Rental', color: '#ec407a', isDefault: true },
  { id: 'cat_income_other', type: 'income', name: 'Other', color: '#bdbdbd', isDefault: true },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_cash', name: 'Cash', isDefault: true },
  { id: 'cm_bank_transfer', name: 'Bank transfer', isDefault: false },
  { id: 'pm_debit_card', name: 'Debit card', isDefault: false },
  { id: 'pm_credit_card', name: 'Credit card', isDefault: false },
  { id: 'pm_upi', name: 'UPI', isDefault: false },
  { id: 'pm_other', name: 'Other', isDefault: false },
];

export async function seedDefaultData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const category of DEFAULT_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, type, name, color, is_default)
         VALUES (?, ?, ?, ?, ?)`,
        [category.id, category.type, category.name, category.color, category.isDefault ? 1 : 0]
      );
    }
    for (const method of DEFAULT_PAYMENT_METHODS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO payment_methods (id, name, is_default)
         VALUES (?, ?, ?)`,
        [method.id, method.name, method.isDefault ? 1 : 0]
      );
    }
  });
}

export async function getCategories(type?: 'expense' | 'income'): Promise<Category[]> {
  const db = await getDatabase();
  if (type) {
    return db.getAllAsync<Category>(
      `SELECT id, type, name, color, is_default AS isDefault FROM categories WHERE type = ? ORDER BY name`,
      [type]
    );
  }
  return db.getAllAsync<Category>(
    `SELECT id, type, name, color, is_default AS isDefault FROM categories ORDER BY type, name`
  );
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const db = await getDatabase();
  return db.getAllAsync<PaymentMethod>(
    `SELECT id, name, is_default AS isDefault FROM payment_methods ORDER BY is_default DESC, name`
  );
}
