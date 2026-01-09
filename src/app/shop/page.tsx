'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Container, Button, Input, Select } from '@/components/ui';
import { ProductGridWithPagination } from '@/components/product/ProductGrid';
import { useProducts } from '@/hooks';
import { ProductCategory, ProductCondition } from '@/types';
import { cn } from '@/lib/utils';

const categories = [
  { value: '', label: 'All Categories' },
  { value: ProductCategory.HANDBAGS, label: 'Handbags' },
  { value: ProductCategory.WATCHES, label: 'Watches' },
  { value: ProductCategory.JEWELRY, label: 'Jewelry' },
  { value: ProductCategory.ACCESSORIES, label: 'Accessories' },
  { value: ProductCategory.CLOTHING, label: 'Clothing' },
  { value: ProductCategory.SHOES, label: 'Shoes' },
];

const conditions = [
  { value: '', label: 'All Conditions' },
  { value: ProductCondition.NEW_WITH_TAGS, label: 'New with Tags' },
  { value: ProductCondition.NEW_WITHOUT_TAGS, label: 'New' },
  { value: ProductCondition.EXCELLENT, label: 'Excellent' },
  { value: ProductCondition.VERY_GOOD, label: 'Very Good' },
  { value: ProductCondition.GOOD, label: 'Good' },
];

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'viewCount:desc', label: 'Most Popular' },
];

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Get current filters from URL
  const category = searchParams.get('category') as ProductCategory | null;
  const condition = searchParams.get('condition') as ProductCondition | null;
  const sortParam = searchParams.get('sort') || 'createdAt:desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [sortField, sortOrder] = sortParam.split(':') as ['price' | 'createdAt' | 'viewCount', 'asc' | 'desc'];

  const { products, loading, total, pageSize, hasMore } = useProducts({
    filters: {
      category: category || undefined,
      condition: condition || undefined,
      search: search || undefined,
    },
    sort: { field: sortField, order: sortOrder },
    page,
    pageSize: 12,
  });

  // Update URL params
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except for page changes)
    if (!('page' in updates)) {
      params.delete('page');
    }

    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search || null });
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/shop');
  };

  const activeFiltersCount = [category, condition, searchParams.get('search')].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <Container className="py-8">
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">
            {total} {total === 1 ? 'item' : 'items'}
          </p>
        </Container>
      </div>

      <Container className="py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-gold hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>

              {/* Category */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateParams({ category: cat.value || null })}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        category === cat.value || (!category && !cat.value)
                          ? 'bg-brand-charcoal text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Condition</h3>
                <div className="space-y-2">
                  {conditions.map((cond) => (
                    <button
                      key={cond.value}
                      onClick={() => updateParams({ condition: cond.value || null })}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        condition === cond.value || (!condition && !cond.value)
                          ? 'bg-brand-charcoal text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Bar */}
            <div className="lg:hidden flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex-1"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 w-5 h-5 bg-brand-gold text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <Select
                options={sortOptions}
                value={sortParam}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="flex-1"
              />
            </div>

            {/* Desktop Sort */}
            <div className="hidden lg:flex items-center justify-end mb-6">
              <Select
                options={sortOptions}
                value={sortParam}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-48"
              />
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    {categories.find((c) => c.value === category)?.label}
                    <button onClick={() => updateParams({ category: null })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {condition && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    {conditions.find((c) => c.value === condition)?.label}
                    <button onClick={() => updateParams({ condition: null })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchParams.get('search') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    &quot;{searchParams.get('search')}&quot;
                    <button onClick={() => { setSearch(''); updateParams({ search: null }); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            <ProductGridWithPagination
              products={products}
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              hasMore={hasMore}
              onPageChange={(newPage) => updateParams({ page: newPage.toString() })}
              columns={3}
            />
          </div>
        </div>
      </Container>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-gray-900">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { handleSearch(e); setShowFilters(false); }} className="mb-6">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Category */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      updateParams({ category: cat.value || null });
                      setShowFilters(false);
                    }}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      category === cat.value || (!category && !cat.value)
                        ? 'bg-brand-charcoal text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Condition</h3>
              <div className="space-y-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.value}
                    onClick={() => {
                      updateParams({ condition: cond.value || null });
                      setShowFilters(false);
                    }}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      condition === cond.value || (!condition && !cond.value)
                        ? 'bg-brand-charcoal text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowFilters(false)}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ShopPageContent />
    </Suspense>
  );
}
