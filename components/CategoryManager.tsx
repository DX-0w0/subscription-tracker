"use client";

import { useState } from "react";
import { Subscription } from "@/utils/subscriptions";
import SubscriptionManager from "./SubscriptionManager";
import CategoryModal from "./CategoryModal";

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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const calculateSubtotal = (subscriptions: Subscription[]) => {
    return subscriptions.reduce((acc, sub) => {
      if (!sub.cancelled_at) {
        return acc + parseFloat(`${sub.cost}`);
      }
      return acc;
    }, 0);
  };

  const grandTotal = categories.reduce((acc, category) => {
    return acc + calculateSubtotal(category.subscriptions);
  }, 0);

  const handleAddCategory = async (name: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [
          { ...newCategory, subscriptions: [] },
          ...prev,
        ]); // Add to the beginning
        setIsCategoryModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("An error occurred while adding the category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/categories`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: categoryId }),
        });

        if (response.ok) {
          setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("An error occurred while deleting the category");
      } finally {
        setIsLoading(false);
      }
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

  const handleSubscriptionUpdate = (
    categoryId: number,
    subscriptionId: number,
    status: "processing" | "cancelled",
    cancelledAt?: string | null
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subscriptions: cat.subscriptions.map((sub) =>
                sub.id === subscriptionId
                  ? { ...sub, status, cancelled_at: cancelledAt }
                  : sub
              ),
            }
          : cat
      )
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Categories</h1>
          <span className="ml-4 text-xl font-bold text-gray-500 dark:text-gray-400">
            ${grandTotal.toFixed(2)}
          </span>
        </div>
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
                  <span className="mr-4 text-lg font-semibold text-gray-900 dark:text-white">
                    ${calculateSubtotal(category.subscriptions).toFixed(2)}
                  </span>
                  {category.subscriptions.length === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent toggling the category
                        handleDeleteCategory(category.id);
                      }}
                      className="text-red-500 hover:text-red-700 mr-4"
                      disabled={isLoading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      expandedCategoryId === category.id ? "rotate-180" : ""
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
                    onSubscriptionUpdate={handleSubscriptionUpdate}
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
