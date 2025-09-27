
import pool from '@/lib/db';

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  billing_cycle: string;
  renewal_date: number;
  account_info: string;
  category_id: number;
  user_id: number;
  created_at: string;
  cancelled_at?: string | null;
  status?: 'active' | 'processing' | 'cancelled';
}

export async function getSubscriptionsByCategory(
  categoryId: number,
  userId: number
): Promise<Subscription[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE category_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [categoryId, userId]
    );
    return result.rows as Subscription[];
  } catch (error) {
    console.error('Database error in getSubscriptionsByCategory:', error);
    throw new Error('Failed to fetch subscriptions from database');
  }
}

export async function createSubscription(
  name: string,
  cost: number,
  billingCycle: string,
  renewalDate: number,
  accountInfo: string,
  categoryId: number,
  userId: number
): Promise<Subscription> {
  try {
    const result = await pool.query(
      'INSERT INTO subscriptions (name, cost, billing_cycle, renewal_date, account_info, category_id, user_id, cancelled_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL) RETURNING *',
      [name, cost, billingCycle, renewalDate, accountInfo, categoryId, userId]
    );
    return result.rows[0] as Subscription;
  } catch (error) {
    console.error('Database error in createSubscription:', error);
    throw new Error('Failed to create subscription in database');
  }
}

export async function updateSubscriptionCancellation(
  id: number,
  userId: number,
  cancelledAt: string | null
): Promise<boolean> {
  try {
    const result = await pool.query(
      'UPDATE subscriptions SET cancelled_at = $1 WHERE id = $2 AND user_id = $3',
      [cancelledAt, id, userId]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Database error in updateSubscriptionCancellation:', error);
    throw new Error('Failed to update subscription cancellation status in database');
  }
}

export async function deleteSubscription(id: number, userId: number): Promise<boolean> {
  try {
    const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Database error in deleteSubscription:', error);
    throw new Error('Failed to delete subscription from database');
  }
}
