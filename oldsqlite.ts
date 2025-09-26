import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database instance
const db = new Database(path.join(__dirname, '../db.sqlite'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cost REAL NOT NULL,
    billing_cycle TEXT NOT NULL,
    account_info TEXT,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  )
`);

export default db;

`**************************************`

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = db
      .prepare('SELECT * FROM categories ORDER BY created_at DESC')
      .all() as Category[];
    return categories;
  } catch (error) {
    console.error('Database error in getAllCategories:', error);
    throw new Error('Failed to fetch categories from database');
  }
}

export async function getCategoryById(
  id: number
): Promise<Category | undefined> {
  try {
    const category = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(id) as Category | undefined;
    return category;
  } catch (error) {
    console.error('Database error in getCategoryById:', error);
    throw new Error('Failed to fetch category from database');
  }
}

export async function createCategory(name: string): Promise<Category> {
  try {
    // Check if category already exists
    const existingCategory = db
      .prepare('SELECT id FROM categories WHERE name = ?')
      .get(name.trim());

    if (existingCategory) {
      throw new Error('Category already exists');
    }

    const result = db
      .prepare('INSERT INTO categories (name) VALUES (?)')
      .run(name.trim());

    const newCategory = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid) as Category;

    return newCategory;
  } catch (error) {
    console.error('Database error in createCategory:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to create category in database');
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    if (result.changes === 0) {
      throw new Error('Category not found or already deleted');
    }
  } catch (error) {
    console.error('Database error in deleteCategory:', error);
    throw new Error('Failed to delete category from database');
  }
}

`**************************************`

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
