'use client';

import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { EmptyState, Button } from '@/components/ui';
import { Package } from 'lucide-react';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = 'No products found',
  columns = 4,
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-4 lg:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-12 h-12" />}
        title={emptyMessage}
        description="Try adjusting your filters or search terms"
      />
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 lg:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Grid with pagination
interface ProductGridWithPaginationProps extends ProductGridProps {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function ProductGridWithPagination({
  products,
  loading,
  emptyMessage,
  columns,
  total,
  page,
  pageSize,
  hasMore,
  onPageChange,
}: ProductGridWithPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <ProductGrid
        products={products}
        loading={loading}
        emptyMessage={emptyMessage}
        columns={columns}
      />

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600 px-4">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
