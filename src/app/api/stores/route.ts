import { NextRequest } from 'next/server';
import { storeRepository, productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError } from '@/lib/errors';

// GET /api/stores - List all active partner stores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Get active stores (findMany already filters for active)
    const allStores = await storeRepository.findMany();

    // Add product counts
    const storesWithStats = await Promise.all(
      allStores.map(async (store) => {
        const productCount = await productRepository.count(store.id);
        return {
          ...store,
          productCount,
        };
      })
    );

    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedStores = storesWithStats.slice(start, start + pageSize);

    return createSuccessResponse({
      items: paginatedStores,
      total: allStores.length,
      page,
      pageSize,
      hasMore: start + pageSize < allStores.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
