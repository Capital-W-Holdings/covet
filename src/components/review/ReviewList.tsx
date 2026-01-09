'use client';

import { Check, ThumbsUp } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { ReviewStars } from './ReviewForm';
import type { Review, ReviewStats } from '@/types/review';
import { formatDateTime } from '@/lib/utils';

interface ReviewListProps {
  reviews: Review[];
  stats?: ReviewStats;
  showStats?: boolean;
  emptyMessage?: string;
}

export function ReviewList({ reviews, stats, showStats = true, emptyMessage }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description={emptyMessage || 'Be the first to leave a review!'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {showStats && stats && (
        <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-200">
          <div className="text-center">
            <div className="text-4xl font-semibold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </div>
            <ReviewStars rating={stats.averageRating} size="md" />
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 min-w-[200px]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star as 1 | 2 | 3 | 4 | 5];
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews) * 100 
                : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-500 text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Items */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{review.buyerName}</span>
            {review.verifiedPurchase && (
              <Badge variant="success" className="text-xs">
                <Check className="w-3 h-3 mr-0.5" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <ReviewStars rating={review.rating} size="sm" />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDateTime(review.createdAt)}
        </span>
      </div>

      {review.title && (
        <h4 className="font-medium text-gray-900 mt-2">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
      )}

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Review image ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {review.helpfulCount > 0 && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
          <ThumbsUp className="w-3.5 h-3.5" />
          {review.helpfulCount} found this helpful
        </div>
      )}
    </Card>
  );
}
