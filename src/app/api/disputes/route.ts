import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { disputeRepository, orderRepository, storeRepository } from '@/lib/repositories';
import { createDisputeSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { DisputeReason } from '@/types/review';

// GET /api/disputes - Get user's disputes
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    let disputes;

    // If store admin, get disputes for their store
    if (session.role === 'STORE_ADMIN') {
      const store = await storeRepository.findByOwnerId(session.userId);
      if (store) {
        disputes = await disputeRepository.findByStoreId(store.id);
      } else {
        disputes = await disputeRepository.findByBuyerId(session.userId);
      }
    } else {
      // Regular buyer
      disputes = await disputeRepository.findByBuyerId(session.userId);
    }

    return createSuccessResponse(disputes);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/disputes - Create a dispute
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();

    // Validate input
    const parsed = createDisputeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Get order
    const order = await orderRepository.findById(parsed.data.orderId);
    if (!order) {
      throw new NotFoundError('Order');
    }

    // Verify ownership
    if (order.buyerId !== session.userId) {
      throw new ForbiddenError('You can only dispute your own orders');
    }

    // Create dispute
    const result = await disputeRepository.create(session.userId, order, {
      ...parsed.data,
      reason: parsed.data.reason as DisputeReason,
    });

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return createSuccessResponse(result.data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
