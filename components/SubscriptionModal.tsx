import { Subscription } from '@/utils/subscriptions';

interface newSubscription {
  name: string;
  cost: string;
  billingCycle: string;
  renewalDate: string;
  accountInfo: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSubscription: newSubscription;
  setNewSubscription: React.Dispatch<
    React.SetStateAction<newSubscription>
  >;
  onAddSubscription: () => void;
  isLoading: boolean;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

const SubscriptionModal = ({
  isOpen,
  onClose,
  newSubscription,
  setNewSubscription,
  onAddSubscription,
  isLoading,
  handleKeyPress,
}: SubscriptionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Subscription
          </h2>
          <button
            onClick={onClose}
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
              htmlFor="renewalDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Renewal Date
            </label>
            <select
              id="renewalDate"
              value={newSubscription.renewalDate}
              onChange={(e) =>
                setNewSubscription({
                  ...newSubscription,
                  renewalDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
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
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onAddSubscription}
            disabled={
              isLoading ||
              !newSubscription.name.trim() ||
              !newSubscription.cost.trim()
            }
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ${
              isLoading ? 'cursor-not-allowed' : ''
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
              'Add'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
