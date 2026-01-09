import { NextRequest } from 'next/server';
import { trustScoreRepository, storeRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/stores/[slug]/trust - Get store trust profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Find store by slug
    const store = await storeRepository.findBySlug(slug);
    if (!store) {
      throw new NotFoundError('Store');
    }

    const trustProfile = await trustScoreRepository.calculateForStore(store.id);

    return createSuccessResponse(trustProfile);
  } catch (error) {
    return handleApiError(error);
  }
}
