import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { orderRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { UserRole } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError('Please sign in to view order');
    }

    const { id } = await params;
    const order = await orderRepository.findById(id);

    if (!order) {
      // Try finding by order number
      const orderByNumber = await orderRepository.findByOrderNumber(id);
      if (!orderByNumber) {
        throw new NotFoundError('Order');
      }
      
      // Check permission
      const isAdmin = session.role === UserRole.COVET_ADMIN || session.role === UserRole.SUPER_ADMIN;
      if (!isAdmin && orderByNumber.buyerId !== session.userId) {
        throw new ForbiddenError('You do not have permission to view this order');
      }

      return createSuccessResponse(orderByNumber);
    }

    // Check permission
    const isAdmin = session.role === UserRole.COVET_ADMIN || session.role === UserRole.SUPER_ADMIN;
    if (!isAdmin && order.buyerId !== session.userId) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return createSuccessResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}
