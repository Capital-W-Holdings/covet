import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { orderRepository, storeRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session) && session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError();
    }

    let orders;
    if (isAdmin(session)) {
      // Get store for Covet
      const store = await storeRepository.getDefault();
      orders = store ? await orderRepository.findByStoreId(store.id) : [];
    } else {
      // Get store for store admin
      const store = await storeRepository.findByOwnerId(session.userId);
      orders = store ? await orderRepository.findByStoreId(store.id) : [];
    }

    return createSuccessResponse(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
