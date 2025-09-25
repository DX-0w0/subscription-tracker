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
