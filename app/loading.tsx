export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">Subscription Tracker</h1>
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 dark:border-blue-400"></div>
    </div>
  );
}
