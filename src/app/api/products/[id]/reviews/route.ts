import { NextRequest } from 'next/server';
import { reviewRepository, productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]/reviews - Get reviews for a product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify product exists
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const reviews = await reviewRepository.findByProductId(id, limit);
    const stats = await reviewRepository.getStatsForProduct(id);

    return createSuccessResponse({
      reviews,
      stats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
