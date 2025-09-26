import pool from '@/lib/db';

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    return result.rows as Category[];
  } catch (error) {
    console.error('Database error in getAllCategories:', error);
    throw new Error('Failed to fetch categories from database');
  }
}

export async function getCategoryById(
  id: number
): Promise<Category | undefined> {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] as Category | undefined;
  } catch (error) {
    console.error('Database error in getCategoryById:', error);
    throw new Error('Failed to fetch category from database');
  }
}

export async function createCategory(name: string): Promise<Category> {
  try {
    // Check if category already exists
    const existingCategoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [name.trim()]);

    if (existingCategoryResult.rows.length > 0) {
      throw new Error('Category already exists');
    }

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );

    return result.rows[0] as Category;
  } catch (error) {
    console.error('Database error in createCategory:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to create category in database');
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new Error('Category not found or already deleted');
    }
  } catch (error) {
    console.error('Database error in deleteCategory:', error);
    throw new Error('Failed to delete category from database');
  }
}
