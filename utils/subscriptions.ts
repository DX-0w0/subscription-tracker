import db from "@/lib/db";

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  billing_cycle: string;
  account_info: string;
  category_id: number;
  created_at: string;
}

export async function getSubscriptionsByCategory(categoryId: number): Promise<Subscription[]> {
  try {
    const subscriptions = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE category_id = ? 
      ORDER BY created_at DESC
    `).all(categoryId) as Subscription[];
    return subscriptions;
  } catch (error) {
    console.error('Database error in getSubscriptionsByCategory:', error);
    throw new Error('Failed to fetch subscriptions from database');
  }
}

export async function getAllSubscriptionsWithCategories(): Promise<Subscription[]> {
  try {
    const subscriptions = db.prepare(`
      SELECT s.*, c.name as category_name 
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `).all() as Subscription[];
    return subscriptions;
  } catch (error) {
    console.error('Database error in getAllSubscriptionsWithCategories:', error);
    throw new Error('Failed to fetch subscriptions with categories from database');
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
    const result = db.prepare(`
      INSERT INTO subscriptions (name, cost, billing_cycle, account_info, category_id) 
      VALUES (?, ?, ?, ?, ?)
    `).run(name, cost, billingCycle, accountInfo, categoryId);
    
    const newSubscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid) as Subscription;
    
    return newSubscription;
  } catch (error) {
    console.error('Database error in createSubscription:', error);
    throw new Error('Failed to create subscription in database');
  }
}
