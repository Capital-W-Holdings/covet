import { NextRequest, NextResponse } from 'next/server';
import type { ReviewStats } from '@/types/review';

// Mock review data - in production this would come from database
const mockReviewStats: Record<string, ReviewStats> = {
  'default': {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
};

// Generate consistent mock data based on product ID
function generateMockStats(productId: string): ReviewStats {
  // Use product ID to generate consistent pseudo-random stats
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hasReviews = hash % 3 !== 0; // 2/3 of products have reviews
  
  if (!hasReviews) {
    return mockReviewStats['default'];
  }

  const totalReviews = (hash % 47) + 3; // 3-50 reviews
  const baseRating = 3.5 + ((hash % 15) / 10); // 3.5-5.0 rating
  const averageRating = Math.min(5, Math.round(baseRating * 10) / 10);

  // Generate realistic distribution based on average
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let remaining = totalReviews;
  
  // Most reviews cluster around average
  const mainBucket = Math.round(averageRating) as 1 | 2 | 3 | 4 | 5;
  dist[mainBucket] = Math.floor(remaining * 0.6);
  remaining -= dist[mainBucket];

  // Distribute rest
  const adjacent = mainBucket === 5 ? 4 : mainBucket + 1;
  dist[adjacent as 1 | 2 | 3 | 4 | 5] = Math.floor(remaining * 0.7);
  remaining -= dist[adjacent as 1 | 2 | 3 | 4 | 5];

  // Scatter the rest
  for (let i = 5; i >= 1 && remaining > 0; i--) {
    const key = i as 1 | 2 | 3 | 4 | 5;
    if (dist[key] === 0) {
      dist[key] = Math.min(remaining, Math.ceil(remaining / 2));
      remaining -= dist[key];
    }
  }

  return {
    totalReviews,
    averageRating,
    ratingDistribution: dist,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Product ID is required',
            code: 'MISSING_PRODUCT_ID',
          },
        },
        { status: 400 }
      );
    }

    // In production, fetch from database
    const stats = generateMockStats(id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: 'Failed to fetch review stats',
          code: 'REVIEW_STATS_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
