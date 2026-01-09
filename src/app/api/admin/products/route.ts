import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { productRepository, storeRepository } from '@/lib/repositories';
import { createProductSchema, productQuerySchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError, ValidationError } from '@/lib/errors';
import type { ProductQuery, ProductFilters, ProductSort } from '@/types';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    // Check if user is admin or store admin
    if (!isAdmin(session) && session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError();
    }

    const { searchParams } = new URL(request.url);

    // Parse query params
    const queryParams = {
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      condition: searchParams.get('condition') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      sortField: searchParams.get('sortField') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    };

    const parsed = productQuerySchema.safeParse(queryParams);
    const validParams = parsed.success ? parsed.data : {};

    // Get store for non-admin users
    let storeId: string | undefined;
    if (!isAdmin(session)) {
      const store = await storeRepository.findByOwnerId(session.userId);
      if (store) {
        storeId = store.id;
      }
    }

    const filters: ProductFilters = {
      category: validParams.category,
      brand: validParams.brand,
      condition: validParams.condition,
      status: validParams.status,
      search: validParams.search,
      storeId,
    };

    const sort: ProductSort | undefined = validParams.sortField
      ? { field: validParams.sortField, order: validParams.sortOrder || 'desc' }
      : undefined;

    const query: ProductQuery = {
      filters,
      sort,
      page: validParams.page || 1,
      pageSize: validParams.pageSize || 20,
    };

    const result = await productRepository.findMany(query);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session) && session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError();
    }

    const body = await request.json();

    // Validate input
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // For store admins, use their store
    let storeId = parsed.data.storeId;
    if (!isAdmin(session)) {
      const store = await storeRepository.findByOwnerId(session.userId);
      if (!store) {
        throw new ForbiddenError('No store found for user');
      }
      storeId = store.id;
    }

    const result = await productRepository.create({
      ...parsed.data,
      storeId,
    });

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return createSuccessResponse(result.data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
