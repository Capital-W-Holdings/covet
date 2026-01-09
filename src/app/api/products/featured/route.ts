import { NextRequest } from 'next/server';
import { productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const products = await productRepository.getFeatured(Math.min(limit, 20));
    return createSuccessResponse(products);
  } catch (error) {
    return handleApiError(error);
  }
}
