import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { reviewRepository, orderRepository } from '@/lib/repositories';
import { createReviewSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';

// GET /api/reviews - Get user's reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const reviews = await reviewRepository.findByBuyerId(session.userId);

    return createSuccessResponse(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();

    // Validate input
    const parsed = createReviewSchema.safeParse(body);
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
      throw new ForbiddenError('You can only review your own orders');
    }

    // Create review
    const result = await reviewRepository.create(
      session.userId,
      session.userName || 'Anonymous',
      order,
      parsed.data
    );

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return createSuccessResponse(result.data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
