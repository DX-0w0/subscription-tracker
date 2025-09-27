
import pool from '@/lib/db';

export interface Category {
  id: number;
  name: string;
  created_at: string;
  user_id: number;
}

export async function getAllCategories(userId: number): Promise<Category[]> {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows as Category[];
  } catch (error) {
    console.error('Database error in getAllCategories:', error);
    throw new Error('Failed to fetch categories from database');
  }
}

export async function getCategoryById(
  id: number,
  userId: number
): Promise<Category | undefined> {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0] as Category | undefined;
  } catch (error) {
    console.error('Database error in getCategoryById:', error);
    throw new Error('Failed to fetch category from database');
  }
}

export async function createCategory(name: string, userId: number): Promise<Category> {
  try {
    const existingCategoryResult = await pool.query('SELECT id FROM categories WHERE name = $1 AND user_id = $2', [name.trim(), userId]);

    if (existingCategoryResult.rows.length > 0) {
      throw new Error('Category already exists');
    }

    const result = await pool.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
      [name.trim(), userId]
    );

    return result.rows[0] as Category;
  } catch (error) {
    console.error('Database error in createCategory:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to create category in database');
  }
}

export async function deleteCategory(id: number, userId: number): Promise<void> {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
      throw new Error('Category not found or you do not have permission to delete it');
    }
  } catch (error) {
    console.error('Database error in deleteCategory:', error);
    throw new Error('Failed to delete category from database');
  }
}
