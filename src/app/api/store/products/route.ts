import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeRepository, productRepository } from '@/lib/repositories';
import { createProductSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole, ProductStatus } from '@/types';

// GET /api/store/products - Get store owner's products
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status') as ProductStatus | null;
    const search = searchParams.get('search');

    const result = await productRepository.findMany({
      filters: {
        storeId: store.id,
        status: status || undefined,
        search: search || undefined,
      },
      sort: { field: 'createdAt', order: 'desc' },
      page,
      pageSize,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/store/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const body = await request.json();

    // Validate input
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Create product
    const result = await productRepository.create({
      ...parsed.data,
      storeId: store.id,
    });

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return createSuccessResponse(result.data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
