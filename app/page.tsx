'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import CategoryManager from '@/components/CategoryManager';
import HeroBanner from '@/components/HeroBanner';
import { useEffect, useState } from 'react';
import Loading from './loading';

export default function Home() {
  const { data: session, status } = useSession();
  const [funFact, setFunFact] = useState('');

  useEffect(() => {
    const fetchFunFact = async () => {
      const res = await fetch('/api/funfact');
      const data = await res.json();
      setFunFact(data.funFact);
    };
    fetchFunFact();
  }, []);

  if (status === 'loading') {
    return <Loading />;
  }

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <HeroBanner />
      </header>

      <main className="max-w-4xl mx-auto p-6 -mt-8">
        <div className="text-center p-6">{funFact}</div>
        <CategoryManager />
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
