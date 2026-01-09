import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '@/lib/repositories';

// Cache this endpoint for 60 seconds to prevent serverless instance inconsistency
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const products = await productRepository.getFeatured(Math.min(limit, 20));

    return NextResponse.json(
      { success: true, data: products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch featured products' } },
      { status: 500 }
    );
  }
}
