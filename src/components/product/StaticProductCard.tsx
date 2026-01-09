import Image from 'next/image';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui';

interface StaticProduct {
  id: string;
  sku: string;
  title: string;
  brand: string;
  priceCents: number;
  originalPriceCents?: number;
  condition: string;
  image: string;
}

interface StaticProductCardProps {
  product: StaticProduct;
}

const conditionLabels: Record<string, string> = {
  NEW_WITH_TAGS: 'New with Tags',
  NEW_WITHOUT_TAGS: 'New',
  EXCELLENT: 'Excellent',
  VERY_GOOD: 'Very Good',
  GOOD: 'Good',
  FAIR: 'Fair',
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function calculateDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}

export function StaticProductCard({ product }: StaticProductCardProps) {
  const discount = product.originalPriceCents
    ? calculateDiscount(product.originalPriceCents, product.priceCents)
    : 0;

  return (
    <Card hover className="group">
      <Link href={`/products/${product.sku}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant="gold">Covet Certified</Badge>
            {discount > 0 && (
              <Badge variant="danger">{discount}% Off</Badge>
            )}
          </div>
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

          {/* Condition */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              {conditionLabels[product.condition] || product.condition}
            </p>
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
