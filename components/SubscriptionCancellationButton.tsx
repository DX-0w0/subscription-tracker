'use client';

import { useState, useEffect } from 'react';

interface SubscriptionCancellationButtonProps {
  subscriptionId: number;
  initialCancelledAt?: string | null;
  onCancellationStatusChange: (id: number, cancelledAt: string | null) => void;
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
          onCancellationStatusChange(subscriptionId, cancelledAt);
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
          py-1 px-3 rounded-lg text-sm font-medium transition-colors duration-200
          ${status === 'cancelled' 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : status === 'active'
            ? 'bg-orange-600 hover:bg-orange-700 text-white'
            : 'bg-yellow-500 text-white cursor-not-allowed'
          }
        `}
      >
        {getButtonText()}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel this subscription? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDialog}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCancellationButton;