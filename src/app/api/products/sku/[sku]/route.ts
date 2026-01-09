import { NextRequest } from 'next/server';
import { productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;
    const product = await productRepository.findBySku(sku);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Increment view count (fire and forget)
    productRepository.incrementViewCount(product.id).catch(console.error);

    return createSuccessResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}
