import { NextRequest } from 'next/server';
import { productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const related = await productRepository.getRelated(id, Math.min(limit, 12));
    return createSuccessResponse(related);
  } catch (error) {
    return handleApiError(error);
  }
}
