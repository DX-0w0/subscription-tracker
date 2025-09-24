import db from "@/lib/db";

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  billing_cycle: string;
  account_info: string;
  category_id: number;
  created_at: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = db
      .prepare("SELECT * FROM categories ORDER BY created_at DESC")
      .all() as Category[];
    return categories;
  } catch (error) {
    console.error("Database error in getAllCategories:", error);
    throw new Error("Failed to fetch categories from database");
  }
}

export async function getCategoryById(
  id: number
): Promise<Category | undefined> {
  try {
    const category = db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(id) as Category | undefined;
    return category;
  } catch (error) {
    console.error("Database error in getCategoryById:", error);
    throw new Error("Failed to fetch category from database");
  }
}

export async function createCategory(name: string): Promise<Category> {
  try {
    // Check if category already exists
    const existingCategory = db
      .prepare("SELECT id FROM categories WHERE name = ?")
      .get(name.trim());

    if (existingCategory) {
      throw new Error("Category already exists");
    }

    const result = db
      .prepare("INSERT INTO categories (name) VALUES (?)")
      .run(name.trim());

    const newCategory = db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(result.lastInsertRowid) as Category;

    return newCategory;
  } catch (error) {
    console.error("Database error in createCategory:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create category in database");
  }
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
