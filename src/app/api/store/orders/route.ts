import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeRepository, orderRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole, OrderStatus } from '@/types';

// GET /api/store/orders - Get store owner's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;

    let orders = await orderRepository.findByStoreId(store.id);

    // Filter by status if provided
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    // Sort by date descending
    orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return createSuccessResponse(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
