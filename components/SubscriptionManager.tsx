import { useState } from 'react';
import { Subscription } from '@/utils/subscriptions';
import SubscriptionModal from './SubscriptionModal';

interface SubscriptionManagerProps {
  categoryId: number;
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Subscription) => void;
  onSubscriptionDelete: (subscriptionId: number) => void;
}

const SubscriptionManager = ({
  categoryId,
  subscriptions,
  onAddSubscription,
  onSubscriptionDelete,
}: SubscriptionManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    cost: '',
    billingCycle: 'month', // Default to month
    accountInfo: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubscription = async () => {
    if (!newSubscription.name.trim() || !newSubscription.cost.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          name: '',
          cost: '',
          billingCycle: 'month',
          accountInfo: '',
        });
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add subscription');
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('An error occurred while adding the subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: subscriptionId }),
      });

      if (response.ok) {
        // Remove the subscription from the local state
        onSubscriptionDelete(subscriptionId);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('An error occurred while deleting the subscription');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSubscription({
      name: '',
      cost: '',
      billingCycle: 'month',
      accountInfo: '',
    });
  };

  // Handle Enter key in the subscription input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
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

      <div className="space-y-2">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 flex justify-between items-center"
          >
            <div className="flex-1">
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
            <button
              onClick={() => handleDeleteSubscription(sub.id)}
              className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Delete subscription"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        newSubscription={newSubscription}
        setNewSubscription={setNewSubscription}
        onAddSubscription={handleAddSubscription}
        isLoading={isLoading}
        handleKeyPress={handleKeyPress}
      />
    </>
  );
};

export default SubscriptionManager;
