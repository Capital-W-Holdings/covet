import { NextRequest } from 'next/server';
import { productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Increment view count (fire and forget)
    productRepository.incrementViewCount(id).catch(console.error);

    return createSuccessResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}
