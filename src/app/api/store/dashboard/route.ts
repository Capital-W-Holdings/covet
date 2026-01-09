import { getSession } from '@/lib/auth';
import { storeRepository, storeStatsRepository, storePayoutRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole } from '@/types';

// GET /api/store/dashboard - Get store dashboard data
export async function GET() {
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
      throw new ForbiddenError('No store found for this account');
    }

    // Get stats
    const stats = await storeStatsRepository.getStats(store.id);

    // Get recent payouts
    const payouts = await storePayoutRepository.findByStoreId(store.id);

    return createSuccessResponse({
      store,
      stats,
      payouts: payouts.slice(0, 5),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
