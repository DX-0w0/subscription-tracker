import CategoryManager from "@/components/CategoryManager";
import { getAllCategories } from "@/utils/categories";
import { getSubscriptionsByCategory } from "@/utils/subscriptions";
import { Subscription } from "@/types";

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
    <div>
      <main>
        <CategoryManager initialCategories={categories} />
      </main>
    </div>
  );
}
