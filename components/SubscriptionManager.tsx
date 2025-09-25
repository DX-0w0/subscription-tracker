import { useState } from 'react';
import { Subscription } from '@/utils/subscriptions';
import SubscriptionModal from './SubscriptionModal';
import SubscriptionCancellationButton from './SubscriptionCancellationButton';

interface SubscriptionManagerProps {
  categoryId: number;
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Subscription) => void;
  onSubscriptionDelete: (subscriptionId: number) => void;
  onSubscriptionUpdate: (
    categoryId: number,
    subscriptionId: number,
    cancelledAt: string | null
  ) => void;
}

const SubscriptionManager = ({
  categoryId,
  subscriptions,
  onAddSubscription,
  onSubscriptionDelete,
  onSubscriptionUpdate,
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
            
            {/* Buttons Container */}
            <div className="ml-4 flex flex-col items-end space-y-2">
              <SubscriptionCancellationButton
                subscriptionId={sub.id}
                initialCancelledAt={sub.cancelled_at}
                onCancellationStatusChange={(id, cancelledAt) => {
                  onSubscriptionUpdate(categoryId, id, cancelledAt);
                }}
              />
              <button
                onClick={() => handleDeleteSubscription(sub.id)}
                className="p-1.5 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                aria-label="Delete subscription"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
            </div>
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
