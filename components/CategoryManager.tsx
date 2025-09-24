'use client';

import { useState } from 'react';
import { Subscription } from '@/utils/subscriptions';
import SubscriptionManager from './SubscriptionManager';
import CategoryModal from './CategoryModal';

export interface CategoryWithSubscriptions {
  id: number;
  name: string;
  created_at: string;
  subscriptions: Subscription[];
}

interface CategoryManagerProps {
  initialCategories: CategoryWithSubscriptions[];
}

const CategoryManager = ({ initialCategories }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<CategoryWithSubscriptions[]>(
    initialCategories || []
  );
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategory = async (name: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [{...newCategory, subscriptions: []}, ...prev]); // Add to the beginning
        setIsCategoryModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('An error occurred while adding the category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscription = (
    categoryId: number,
    subscription: Subscription
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, subscriptions: [...cat.subscriptions, subscription] }
          : cat
      )
    );
  };

  const handleDeleteSubscription = (
    categoryId: number,
    subscriptionId: number
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subscriptions: cat.subscriptions.filter(
                (sub) => sub.id !== subscriptionId
              ),
            }
          : cat
      )
    );
  };

  const handleCategoryModalClose = () => {
    setIsCategoryModalOpen(false);
  };

  const toggleCategoryExpansion = (id: number) => {
    setExpandedCategoryId(expandedCategoryId === id ? null : id);
  };

  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          New Category
        </button>
      </div>

      {/* Category Containers */}
      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleCategoryExpansion(category.id)}
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category.subscriptions.length} subscriptions
                  </p>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      expandedCategoryId === category.id ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Expanded content */}
              {expandedCategoryId === category.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
                  <SubscriptionManager
                    categoryId={category.id}
                    subscriptions={category.subscriptions}
                    onAddSubscription={(sub) =>
                      handleAddSubscription(category.id, sub)
                    }
                    onSubscriptionDelete={(subId) =>
                      handleDeleteSubscription(category.id, subId)
                    }
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No categories yet. Create your first category!
            </p>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCategoryModalClose}
        onAddCategory={handleAddCategory}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CategoryManager;
