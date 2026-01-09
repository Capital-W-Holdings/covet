import { getSession } from '@/lib/auth';
import { orderRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError } from '@/lib/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError('Please sign in to view orders');
    }

    const orders = await orderRepository.findByBuyerId(session.userId);
    return createSuccessResponse(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
