
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  createSubscription,
  deleteSubscription,
  updateSubscriptionCancellation,
} from '@/utils/subscriptions';

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error('Not authorized');
  }
  return session.user.id;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { name, cost, billing_cycle, renewal_date, account_info, category_id } =
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

    if (typeof renewal_date !== 'number' || renewal_date < 1 || renewal_date > 31) {
      return Response.json({ error: 'Invalid renewal date' }, { status: 400 });
    }

    if (typeof category_id !== 'number') {
      return Response.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const newSubscription = await createSubscription(
      name.trim(),
      cost,
      billing_cycle,
      renewal_date,
      account_info || '',
      category_id,
      userId
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
    const userId = await getUserId();
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

    const success = await updateSubscriptionCancellation(id, userId, cancelled_at);

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
    const userId = await getUserId();
    const { id } = await request.json();

    if (typeof id !== 'number') {
      return Response.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    const success = await deleteSubscription(id, userId);

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
