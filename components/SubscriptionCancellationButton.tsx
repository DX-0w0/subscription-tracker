'use client';

import { useState, useEffect } from 'react';

interface SubscriptionCancellationButtonProps {
  subscriptionId: number;
  initialCancelledAt?: string | null;
  onCancellationStatusChange: (id: number, status: 'processing' | 'cancelled', cancelledAt?: string | null) => void;
}

const SubscriptionCancellationButton = ({
  subscriptionId,
  initialCancelledAt,
  onCancellationStatusChange,
}: SubscriptionCancellationButtonProps) => {
  const [status, setStatus] = useState<'active' | 'initializing' | 'processing' | 'cancelled'>('active');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize status based on the initial cancellation state
  useEffect(() => {
    if (initialCancelledAt) {
      setStatus('cancelled');
    } else {
      setStatus('active');
    }
  }, [initialCancelledAt]);

  const handleInitializeCancellation = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmCancellation = async () => {
    setShowConfirmDialog(false);
    setStatus('initializing');
    setIsUpdating(true);
    onCancellationStatusChange(subscriptionId, 'processing');
    
    try {
      // Update the status to processing immediately
      setStatus('processing');
      
      // After 15 seconds, update to cancelled and persist to database
      setTimeout(async () => {
        try {
          const cancelledAt = new Date().toISOString();
          setStatus('cancelled');
          
          // Persist to database
          const response = await fetch('/api/subscriptions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: subscriptionId,
              cancelled_at: cancelledAt,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to update cancellation status:', errorData);
            throw new Error(errorData.error || 'Failed to update cancellation status');
          }
          
          // Update the parent component about the cancellation
          onCancellationStatusChange(subscriptionId, 'cancelled', cancelledAt);
        } catch (error) {
          console.error('Error during cancellation process:', error);
          // Optionally revert back to active state on error
          setStatus('active');
        } finally {
          setIsUpdating(false);
        }
      }, 10000); // 10 seconds
    } catch (error) {
      console.error('Error starting cancellation:', error);
      setStatus('active');
      setIsUpdating(false);
    }
  };

  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
  };

  const getButtonText = () => {
    if (isUpdating) {
      return 'Processing...';
    }
    
    switch (status) {
      case 'active':
        return 'Initialize Cancellation';
      case 'initializing':
        return 'Processing...';
      case 'processing':
        return 'Processing...';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Initialize Cancellation';
    }
  };

  const isButtonDisabled = status !== 'active' || isUpdating;

  return (
    <div className="relative">
      <button
        onClick={status === 'active' ? handleInitializeCancellation : undefined}
        disabled={isButtonDisabled}
        className={`
          py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200
          ${
            status === 'cancelled'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : status === 'active'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-yellow-400 text-white cursor-not-allowed'
          }
        `}
      >
        {getButtonText()}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel? This action is irreversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCancellationButton;