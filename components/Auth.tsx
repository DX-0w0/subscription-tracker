
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="sticky top-0 bg-black text-white p-4 z-10 shadow-md flex items-center justify-end">
        <p className="text-white0">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="sticky top-0 bg-black text-white p-2 z-10 shadow-md flex items-center justify-end">
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 bg-black text-white p-2 z-10 shadow-md flex items-center justify-end">
      <p className="text-white mr-4">Welcome, {session?.user?.name}</p>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
