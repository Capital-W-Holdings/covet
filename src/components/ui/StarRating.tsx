'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  className,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={!interactive}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-1 rounded',
                !interactive && 'cursor-default'
              )}
              tabIndex={interactive ? 0 : -1}
              aria-label={interactive ? `Rate ${index + 1} stars` : undefined}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-gray-300'
                )}
                fill="currentColor"
              />
              
              {/* Foreground star (filled or half) */}
              {(isFilled || isHalfFilled) && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'text-amber-400 absolute inset-0'
                  )}
                  fill="currentColor"
                  style={isHalfFilled ? { 
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' 
                  } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={cn('font-medium text-gray-700', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={cn('text-gray-500', textSizes[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

// Compact inline version for product cards
interface RatingBadgeProps {
  rating: number;
  reviewCount: number;
  className?: string;
}

export function RatingBadge({ rating, reviewCount, className }: RatingBadgeProps) {
  if (reviewCount === 0) return null;

  return (
    <div className={cn('inline-flex items-center gap-1 text-sm', className)}>
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-gray-400">({reviewCount})</span>
    </div>
  );
}

// Trust score badge for stores
interface TrustScoreBadgeProps {
  score: number;
  className?: string;
}

export function TrustScoreBadge({ score, className }: TrustScoreBadgeProps) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 75) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'New';
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      getColor(),
      className
    )}>
      <span>{score}</span>
      <span className="text-[10px] opacity-70">{getLabel()}</span>
    </div>
  );
}
