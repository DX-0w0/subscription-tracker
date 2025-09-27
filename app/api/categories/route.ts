
import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from '@/utils/categories';

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Not authorized");
  }
  return session.user.id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const categories = await getAllCategories(userId);
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
    const userId = await getUserId();
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Invalid category name' }, { status: 400 });
    }

    const newCategory = await createCategory(name.trim(), userId);
    return Response.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create category';
    const status = errorMessage === 'Category already exists' ? 409 : 500;
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { id } = await request.json();

    if (!id || typeof id !== 'number') {
      return Response.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    await deleteCategory(id, userId);
    return Response.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return Response.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
