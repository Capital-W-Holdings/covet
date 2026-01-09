import { NextRequest } from 'next/server';
import { reviewRepository, storeRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/stores/[slug]/reviews - Get reviews for a store
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Find store by slug
    const store = await storeRepository.findBySlug(slug);
    if (!store) {
      throw new NotFoundError('Store');
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const reviews = await reviewRepository.findByStoreId(store.id, limit);
    const stats = await reviewRepository.getStatsForStore(store.id);

    return createSuccessResponse({
      reviews,
      stats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
