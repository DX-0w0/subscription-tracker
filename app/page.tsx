import CategoryManager from "@/components/CategoryManager";
import { getAllCategories } from "@/utils/categories";

export default async function Home() {
  const categories = await getAllCategories();

  return (
    <div>
      <main>
        <CategoryManager initialCategories={categories} />
      </main>
    </div>
  );
}
