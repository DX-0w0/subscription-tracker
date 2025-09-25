import db from '@/lib/db';

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  billing_cycle: string;
  account_info: string;
  category_id: number;
  created_at: string;
  cancelled_at?: string | null;
}

export async function getSubscriptionsByCategory(
  categoryId: number
): Promise<Subscription[]> {
  try {
    const subscriptions = db
      .prepare(
        `
      SELECT * FROM subscriptions 
      WHERE category_id = ? 
      ORDER BY created_at DESC
    `
      )
      .all(categoryId) as Subscription[];
    return subscriptions;
  } catch (error) {
    console.error('Database error in getSubscriptionsByCategory:', error);
    throw new Error('Failed to fetch subscriptions from database');
  }
}

export async function createSubscription(
  name: string,
  cost: number,
  billingCycle: string,
  accountInfo: string,
  categoryId: number
): Promise<Subscription> {
  try {
    const result = db
      .prepare(
        `
      INSERT INTO subscriptions (name, cost, billing_cycle, account_info, category_id, cancelled_at) 
      VALUES (?, ?, ?, ?, ?, NULL)
    `
      )
      .run(name, cost, billingCycle, accountInfo, categoryId);

    const newSubscription = db
      .prepare('SELECT * FROM subscriptions WHERE id = ?')
      .get(result.lastInsertRowid) as Subscription;

    return newSubscription;
  } catch (error) {
    console.error('Database error in createSubscription:', error);
    throw new Error('Failed to create subscription in database');
  }
}

export async function updateSubscriptionCancellation(
  id: number,
  cancelledAt: string | null
): Promise<boolean> {
  try {
    const result = db
      .prepare(
        'UPDATE subscriptions SET cancelled_at = ? WHERE id = ?'
      )
      .run(cancelledAt, id);

    // Check if any row was actually updated
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in updateSubscriptionCancellation:', error);
    throw new Error('Failed to update subscription cancellation status in database');
  }
}

export async function deleteSubscription(id: number): Promise<boolean> {
  try {
    const result = db.prepare('DELETE FROM subscriptions WHERE id = ?').run(id);

    // Check if any row was actually deleted
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteSubscription:', error);
    throw new Error('Failed to delete subscription from database');
  }
}
