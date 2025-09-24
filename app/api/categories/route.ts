import { NextRequest } from 'next/server';
import { getAllCategories, createCategory } from '@/utils/categories';

export async function GET(request: NextRequest) {
  try {
    const categories = await getAllCategories();
    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Invalid category name' }, { status: 400 });
    }

    const newCategory = await createCategory(name.trim());
    return Response.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create category';
    const status = errorMessage === 'Category already exists' ? 409 : 500;
    return Response.json({ error: errorMessage }, { status });
  }
}
