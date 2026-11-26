export type SpendingClass = 'essential' | 'discretionary' | 'unclassified';

/**
 * Whether spending in a category can reasonably be reduced (FR-004.1, FR-016.1).
 * Only discretionary categories may be the subject of a "spend less" suggestion.
 * Static for the default categories; anything else is unclassified and gets facts only.
 */
const CLASSES: Record<string, SpendingClass> = {
  cat_food: 'discretionary',
  cat_shopping: 'discretionary',
  cat_entertainment: 'discretionary',
  cat_travel: 'discretionary',
  cat_subscriptions: 'discretionary',
  cat_groceries: 'essential',
  cat_transport: 'essential',
  cat_rent: 'essential',
  cat_bills: 'essential',
  cat_health: 'essential',
  cat_education: 'essential',
  cat_emi: 'essential',
};

export function spendingClassOf(categoryId: string): SpendingClass {
  return CLASSES[categoryId] ?? 'unclassified';
}

export const SUBSCRIPTIONS_CATEGORY_ID = 'cat_subscriptions';
