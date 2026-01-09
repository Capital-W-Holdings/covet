import Link from 'next/link';
import { staticProducts, formatPrice, conditionLabels } from '@/lib/static-products';

// Filter options
const categories = [
  { value: '', label: 'All' },
  { value: 'HANDBAGS', label: 'Handbags' },
  { value: 'WATCHES', label: 'Watches' },
  { value: 'JEWELRY', label: 'Jewelry' },
];

interface ShopPageProps {
  searchParams: Promise<{ category?: string; condition?: string; sort?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categoryFilter = params.category || '';
  const sortBy = params.sort || 'price:desc';

  // Filter products
  let filteredProducts = [...staticProducts];

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
  }

  // Sort products
  const [sortField, sortOrder] = sortBy.split(':');
  filteredProducts.sort((a, b) => {
    if (sortField === 'price') {
      return sortOrder === 'asc' ? a.priceCents - b.priceCents : b.priceCents - a.priceCents;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <div className="border-b-2 border-brand-navy">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <h1 className="font-heading text-4xl lg:text-5xl text-brand-navy mb-2">Shop</h1>
          <p className="font-mono text-sm text-brand-muted">{filteredProducts.length} items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-48 flex-shrink-0">
            <div className="sticky top-28">
              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-4">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isActive = categoryFilter === cat.value || (!categoryFilter && !cat.value);
                    const href = cat.value
                      ? `/shop?category=${cat.value}${sortBy !== 'price:desc' ? `&sort=${sortBy}` : ''}`
                      : `/shop${sortBy !== 'price:desc' ? `?sort=${sortBy}` : ''}`;

                    return (
                      <Link
                        key={cat.value}
                        href={href}
                        className={`block font-mono text-sm transition-opacity ${
                          isActive
                            ? 'text-brand-navy'
                            : 'text-brand-muted hover:text-brand-navy'
                        }`}
                      >
                        {isActive && '→ '}{cat.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-4">Sort</h3>
                <div className="space-y-2">
                  {[
                    { value: 'price:desc', label: 'Price High → Low' },
                    { value: 'price:asc', label: 'Price Low → High' },
                  ].map((option) => {
                    const isActive = sortBy === option.value;
                    const href = `/shop?${categoryFilter ? `category=${categoryFilter}&` : ''}sort=${option.value}`;

                    return (
                      <Link
                        key={option.value}
                        href={href}
                        className={`block font-mono text-sm transition-opacity ${
                          isActive
                            ? 'text-brand-navy'
                            : 'text-brand-muted hover:text-brand-navy'
                        }`}
                      >
                        {isActive && '→ '}{option.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {(categoryFilter) && (
                <Link
                  href="/shop"
                  className="block font-mono text-xs uppercase tracking-wider text-brand-muted mt-8 hover:text-brand-navy transition-colors"
                >
                  Clear Filters
                </Link>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-mono text-brand-muted">No products found</p>
                <Link href="/shop" className="font-mono text-sm text-brand-navy hover:opacity-60 mt-4 inline-block">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredProducts.map((product) => {
                  const discount = Math.round(
                    ((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100
                  );

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.sku}`}
                      className="group"
                    >
                      <div className="aspect-square bg-brand-cream mb-4 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-brand-navy text-white font-mono text-xs px-2 py-1">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-1">
                          {product.brand}
                        </p>
                        <h3 className="font-heading text-brand-navy mb-1 group-hover:opacity-60 transition-opacity line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="font-mono text-xs text-brand-muted mb-2">
                          {conditionLabels[product.condition] || product.condition}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-sm text-brand-navy">
                            {formatPrice(product.priceCents)}
                          </span>
                          {product.originalPriceCents > product.priceCents && (
                            <span className="font-mono text-xs text-brand-muted line-through">
                              {formatPrice(product.originalPriceCents)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
