import { getSession, isAdmin } from '@/lib/auth';
import { orderRepository, productRepository, storeRepository, storeApplicationRepository, disputeRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole } from '@/types';
import { StoreApplicationStatus } from '@/types/store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session)) {
      throw new ForbiddenError();
    }

    const store = await storeRepository.getDefault();
    const storeId = store?.id;

    const [orderStats, productCount, pendingApps, openDisputeCount] = await Promise.all([
      orderRepository.getStats(storeId),
      productRepository.count(storeId),
      storeApplicationRepository.findAll(StoreApplicationStatus.PENDING),
      disputeRepository.getOpenCount(),
    ]);

    return createSuccessResponse({
      ...orderStats,
      totalProducts: productCount,
      pendingApplications: pendingApps.length,
      openDisputes: openDisputeCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
