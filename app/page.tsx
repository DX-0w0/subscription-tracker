
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CategoryManager from '@/components/CategoryManager'
import HeroBanner from '@/components/HeroBanner'
import { getAllCategories } from '@/utils/categories'
import { getSubscriptionsByCategory, Subscription } from '@/utils/subscriptions'
import { getFunFact } from '@/utils/funfact'

export const revalidate = 0

export interface CategoryWithSubscriptions {
  id: number
  name: string
  created_at: string
  subscriptions: Subscription[]
}

async function getCategoriesWithSubscriptions(userId: number): Promise<
  CategoryWithSubscriptions[]
> {
  const categories = await getAllCategories(userId)

  const categoriesWithSubscriptions = await Promise.all(
    categories.map(async (category) => {
      const subscriptions = await getSubscriptionsByCategory(category.id, userId)
      return {
        ...category,
        subscriptions,
      }
    })
  )

  return categoriesWithSubscriptions
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const categories = await getCategoriesWithSubscriptions(userId)
  const funFact = await getFunFact()

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <header className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4'>
        <HeroBanner />
      </header>

      <main className='max-w-4xl mx-auto p-6 -mt-8'>
        <div className='text-center p-6'>{funFact}</div>
        <CategoryManager initialCategories={categories} />
      </main>

      <footer className='py-8 text-center text-gray-600 dark:text-gray-400 bg-gradient-to-t from-blue-50 to-white dark:from-gray-900 dark:to-gray-800'>
        <p>
          © {new Date().getFullYear()} Subscription Tracker - Manage your
          subscriptions efficiently
        </p>
      </footer>
    </div>
  )
}
