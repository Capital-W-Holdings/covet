'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button, Textarea, Input, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  orderId: string;
  productTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ orderId, productTitle, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rating,
          title: title || undefined,
          comment: comment || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess?.();
      } else {
        setError(data.error?.message || 'Failed to submit review');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Card className="p-6">
      <h3 className="font-medium text-gray-900 mb-1">Write a Review</h3>
      <p className="text-sm text-gray-500 mb-4">{productTitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 focus:outline-none"
              >
                <Star
                  className={cn(
                    'w-8 h-8 transition-colors',
                    star <= displayRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </p>
          )}
        </div>

        {/* Title */}
        <Input
          label="Review Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />

        {/* Comment */}
        <Textarea
          label="Your Review (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share details about your purchase and the item..."
          maxLength={2000}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={submitting} disabled={rating === 0}>
            Submit Review
          </Button>
        </div>
      </form>
    </Card>
  );
}

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export function ReviewStars({ rating, size = 'md', showCount, count }: ReviewStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : star - 0.5 <= rating
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-gray-500 ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
