import { NextRequest } from 'next/server';
import { storeRepository, productRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/stores/[slug] - Get store by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const store = await storeRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundError('Store');
    }

    // Get store products
    const products = await productRepository.findMany({
      filters: { storeId: store.id },
      sort: { field: 'createdAt', order: 'desc' },
      page: 1,
      pageSize: 12,
    });

    // Get product count
    const productCount = await productRepository.count(store.id);

    return createSuccessResponse({
      store: {
        ...store,
        productCount,
      },
      products: products.items,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
