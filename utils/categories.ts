import db from '@/lib/db';

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
