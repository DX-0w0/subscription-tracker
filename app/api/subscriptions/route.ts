import { NextRequest } from 'next/server';
import { 
  createSubscription, 
  deleteSubscription, 
  updateSubscriptionCancellation 
} from '@/utils/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const { name, cost, billing_cycle, account_info, category_id } =
      await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { error: 'Invalid subscription name' },
        { status: 400 }
      );
    }

    if (typeof cost !== 'number' || cost < 0) {
      return Response.json({ error: 'Invalid cost' }, { status: 400 });
    }

    if (
      !billing_cycle ||
      !['day', 'week', 'month', 'annual'].includes(billing_cycle)
    ) {
      return Response.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    if (typeof category_id !== 'number') {
      return Response.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const newSubscription = await createSubscription(
      name.trim(),
      cost,
      billing_cycle,
      account_info || '',
      category_id
    );

    return Response.json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return Response.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, cancelled_at } = await request.json();

    if (typeof id !== 'number') {
      return Response.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    if (typeof cancelled_at !== 'string' && cancelled_at !== null) {
      return Response.json(
        { error: 'Invalid cancelled_at value' },
        { status: 400 }
      );
    }

    const success = await updateSubscriptionCancellation(id, cancelled_at);

    if (!success) {
      return Response.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return Response.json({ 
      message: cancelled_at ? 'Subscription cancelled successfully' : 'Subscription reactivated successfully',
      cancelled_at 
    });
  } catch (error) {
    console.error('Error updating subscription cancellation:', error);
    return Response.json(
      { error: 'Failed to update subscription cancellation status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (typeof id !== 'number') {
      return Response.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    const success = await deleteSubscription(id);

    if (!success) {
      return Response.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return Response.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return Response.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
