import { useState } from 'react';
import { Subscription } from '@/utils/subscriptions';

interface SubscriptionManagerProps {
  categoryId: number;
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Subscription) => void;
}

const SubscriptionManager = ({
  categoryId,
  subscriptions,
  onAddSubscription,
}: SubscriptionManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    cost: "",
    billingCycle: "month", // Default to month
    accountInfo: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubscription = async () => {
    if (!newSubscription.name.trim() || !newSubscription.cost.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSubscription.name.trim(),
          cost: parseFloat(newSubscription.cost),
          billing_cycle: newSubscription.billingCycle,
          account_info: newSubscription.accountInfo,
          category_id: categoryId,
        }),
      });

      if (response.ok) {
        const newSubscriptionData = await response.json();
        onAddSubscription(newSubscriptionData);
        setNewSubscription({
          name: "",
          cost: "",
          billingCycle: "month",
          accountInfo: "",
        });
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add subscription");
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      alert("An error occurred while adding the subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSubscription({
      name: "",
      cost: "",
      billingCycle: "month",
      accountInfo: "",
    });
  };

  // Handle Enter key in the subscription input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleAddSubscription();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Subscriptions
        </h4>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-200 text-sm"
        >
          Add Subscription
        </button>
      </div>

      {subscriptions.length ? (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  {sub.name}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${sub.cost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>
                  {sub.billing_cycle.charAt(0).toUpperCase() +
                    sub.billing_cycle.slice(1)}
                </span>
                {sub.account_info && (
                  <span className="truncate max-w-[50%]">
                    {sub.account_info}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-600 dark:text-gray-400 text-sm py-2">
          No subscriptions added yet.
        </div>
      )}

      {/* Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Subscription
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="subscriptionName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subscription Name
                </label>
                <input
                  type="text"
                  id="subscriptionName"
                  value={newSubscription.name}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      name: e.target.value,
                    })
                  }
                  onKeyUp={handleKeyPress}
                  placeholder="Enter subscription name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="subscriptionCost"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Cost
                </label>
                <input
                  type="number"
                  id="subscriptionCost"
                  value={newSubscription.cost}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      cost: e.target.value,
                    })
                  }
                  onKeyUp={handleKeyPress}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="billingCycle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Billing Cycle
                </label>
                <select
                  id="billingCycle"
                  value={newSubscription.billingCycle}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      billingCycle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="annual">Annually</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="accountInfo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Account Information
                </label>
                <textarea
                  id="accountInfo"
                  value={newSubscription.accountInfo}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      accountInfo: e.target.value,
                    })
                  }
                  placeholder="Enter account details (email, login info, etc.)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleModalClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubscription}
                disabled={
                  isLoading ||
                  !newSubscription.name.trim() ||
                  !newSubscription.cost.trim()
                }
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ${
                  isLoading ? "cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionManager;
