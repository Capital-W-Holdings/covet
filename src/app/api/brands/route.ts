import { productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const brands = await productRepository.getBrands();
    return createSuccessResponse(brands);
  } catch (error) {
    return handleApiError(error);
  }
}
