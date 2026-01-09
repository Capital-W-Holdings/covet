import { NextRequest, NextResponse } from 'next/server';
import { productQuerySchema } from '@/lib/validations';
import { productRepository } from '@/lib/repositories';
import type { ProductQuery, ProductFilters, ProductSort } from '@/types';

// Cache for 60 seconds to prevent serverless instance inconsistency
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params
    const queryParams = {
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      condition: searchParams.get('condition') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      search: searchParams.get('search') || undefined,
      storeId: searchParams.get('storeId') || undefined,
      status: searchParams.get('status') || undefined,
      sortField: searchParams.get('sortField') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    };

    // Validate
    const parsed = productQuerySchema.safeParse(queryParams);
    const validParams = parsed.success ? parsed.data : {};

    // Build query
    const filters: ProductFilters = {
      category: validParams.category,
      brand: validParams.brand,
      condition: validParams.condition,
      minPrice: validParams.minPrice,
      maxPrice: validParams.maxPrice,
      search: validParams.search,
      storeId: validParams.storeId,
      status: validParams.status,
    };

    const sort: ProductSort | undefined = validParams.sortField
      ? { field: validParams.sortField, order: validParams.sortOrder || 'desc' }
      : undefined;

    const query: ProductQuery = {
      filters,
      sort,
      page: validParams.page || 1,
      pageSize: validParams.pageSize || 12,
    };

    const result = await productRepository.findMany(query);

    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch products' } },
      { status: 500 }
    );
  }
}
