import CategoryManager from "@/components/CategoryManager";
import { getAllCategories } from "@/utils/categories";

export interface CategoryWithSubscriptionCount {
  id: number;
  name: string;
  created_at: string;
  subscriptionCount?: number;
}

async function getCategoriesWithSubscriptionCount(): Promise<
  CategoryWithSubscriptionCount[]
> {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ ...cat, subscriptionCount: 0 }));
}

export default async function Home() {
  const categories = await getCategoriesWithSubscriptionCount();

  return (
    <div>
      <main>
        <CategoryManager initialCategories={categories} />
      </main>
    </div>
  );
}
