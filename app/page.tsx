import CategoryManager from '@/components/CategoryManager';
import { getAllCategories } from '@/utils/categories';
import { getSubscriptionsByCategory } from '@/utils/subscriptions';
import { Subscription } from '@/types';

export interface CategoryWithSubscriptions {
  id: number;
  name: string;
  created_at: string;
  subscriptions: Subscription[];
}

async function getCategoriesWithSubscriptions(): Promise<
  CategoryWithSubscriptions[]
> {
  const categories = await getAllCategories();

  // Fetch subscriptions for each category
  const categoriesWithSubscriptions = await Promise.all(
    categories.map(async (category) => {
      const subscriptions = await getSubscriptionsByCategory(category.id);
      return {
        ...category,
        subscriptions,
      };
    })
  );

  return categoriesWithSubscriptions;
}

export default async function Home() {
  const categories = await getCategoriesWithSubscriptions();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Subscription Tracker
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
            Track and manage all your subscriptions in one place. Never pay for
            unwanted services again.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 -mt-8">
        <CategoryManager initialCategories={categories} />
      </main>

      <footer className="py-8 text-center text-gray-600 dark:text-gray-400 bg-gradient-to-t from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <p>
          © {new Date().getFullYear()} Subscription Tracker - Manage your
          subscriptions efficiently
        </p>
      </footer>
    </div>
  );
}
