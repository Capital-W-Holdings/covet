import Link from 'next/link';
import { staticProducts, formatPrice, conditionLabels, categoryLabels } from '@/lib/static-products';

// Filter and sort options
const categories = [
  { value: '', label: 'All Categories' },
  { value: 'HANDBAGS', label: 'Handbags' },
  { value: 'WATCHES', label: 'Watches' },
  { value: 'JEWELRY', label: 'Jewelry' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'SHOES', label: 'Shoes' },
];

interface ShopPageProps {
  searchParams: Promise<{ category?: string; condition?: string; sort?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categoryFilter = params.category || '';
  const conditionFilter = params.condition || '';
  const sortBy = params.sort || 'price:desc';

  // Filter products
  let filteredProducts = [...staticProducts];

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
  }

  if (conditionFilter) {
    filteredProducts = filteredProducts.filter(p => p.condition === conditionFilter);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">{filteredProducts.length} items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-gray-900">Filters</h2>
                {(categoryFilter || conditionFilter) && (
                  <Link href="/shop" className="text-sm text-amber-600 hover:underline">
                    Clear all
                  </Link>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isActive = categoryFilter === cat.value || (!categoryFilter && !cat.value);
                    const href = cat.value
                      ? `/shop?category=${cat.value}${conditionFilter ? `&condition=${conditionFilter}` : ''}${sortBy !== 'price:desc' ? `&sort=${sortBy}` : ''}`
                      : `/shop${conditionFilter ? `?condition=${conditionFilter}` : ''}${sortBy !== 'price:desc' ? `${conditionFilter ? '&' : '?'}sort=${sortBy}` : ''}`;

                    return (
                      <Link
                        key={cat.value}
                        href={href}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cat.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: 'price:desc', label: 'Price: High to Low' },
                    { value: 'price:asc', label: 'Price: Low to High' },
                  ].map((option) => {
                    const isActive = sortBy === option.value;
                    const href = `/shop?${categoryFilter ? `category=${categoryFilter}&` : ''}${conditionFilter ? `condition=${conditionFilter}&` : ''}sort=${option.value}`;

                    return (
                      <Link
                        key={option.value}
                        href={href}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found</p>
                <Link href="/shop" className="text-amber-600 hover:underline mt-2 inline-block">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => {
                  const discount = Math.round(
                    ((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100
                  );

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.sku}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                            Certified
                          </span>
                          {discount > 0 && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              {discount}% Off
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                          {product.brand}
                        </p>
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {conditionLabels[product.condition] || product.condition}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(product.priceCents)}
                          </span>
                          {product.originalPriceCents > product.priceCents && (
                            <span className="text-sm text-gray-400 line-through">
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
