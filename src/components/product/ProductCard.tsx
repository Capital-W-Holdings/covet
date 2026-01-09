'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Star } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { WishlistButton } from '@/hooks/useWishlist';
import { useQuickView } from '@/components/ui/QuickViewModal';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import type { Product } from '@/types';
import type { ReviewStats } from '@/types/review';
import { AuthenticationStatus, ProductCondition } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
  reviewStats?: ReviewStats | null;
  showReviews?: boolean;
}

const conditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.NEW_WITH_TAGS]: 'New with Tags',
  [ProductCondition.NEW_WITHOUT_TAGS]: 'New',
  [ProductCondition.EXCELLENT]: 'Excellent',
  [ProductCondition.VERY_GOOD]: 'Very Good',
  [ProductCondition.GOOD]: 'Good',
  [ProductCondition.FAIR]: 'Fair',
};

// Generate consistent mock review data based on product ID
function getMockReviewStats(productId: string): ReviewStats | null {
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hasReviews = hash % 3 !== 0;
  
  if (!hasReviews) return null;

  const totalReviews = (hash % 47) + 3;
  const baseRating = 3.5 + ((hash % 15) / 10);
  const averageRating = Math.min(5, Math.round(baseRating * 10) / 10);

  return {
    totalReviews,
    averageRating,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export function ProductCard({ product, className, reviewStats, showReviews = true }: ProductCardProps) {
  const { openQuickView } = useQuickView();
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const discount = product.originalPriceCents
    ? calculateDiscount(product.originalPriceCents, product.priceCents)
    : 0;

  // Use provided stats or generate mock
  const stats = reviewStats ?? (showReviews ? getMockReviewStats(product.id) : null);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <Card hover className={cn('group', className)}>
      <Link href={`/products/${product.sku}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.authenticationStatus === AuthenticationStatus.COVET_CERTIFIED && (
              <Badge variant="gold">Covet Certified</Badge>
            )}
            {discount > 0 && (
              <Badge variant="danger">{discount}% Off</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton product={product} />
            <button
              onClick={handleQuickView}
              className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-600 hover:text-brand-charcoal transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Quick View Overlay - visible on mobile */}
          <button
            onClick={handleQuickView}
            className="absolute inset-x-0 bottom-0 py-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium md:hidden"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs font-medium text-brand-gold uppercase tracking-wider mb-1">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-gold transition-colors">
            {product.title}
          </h3>

          {/* Rating & Condition Row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              {conditionLabels[product.condition]}
            </p>
            
            {/* Social Proof - Star Rating */}
            {stats && stats.totalReviews > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-gray-700">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({stats.totalReviews})
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(product.priceCents)}
            </span>
            {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPriceCents)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

// Skeleton for loading state
export function ProductCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/5" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-1/2" />
      </div>
    </Card>
  );
}
