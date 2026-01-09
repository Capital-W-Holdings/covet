'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { staticProducts, type StaticProduct } from '@/lib/staticProducts';

type Product = StaticProduct;

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// Product Modal
function ProductModal({ product, onClose, onAddToCart }: { product: Product | null; onClose: () => void; onAddToCart: () => void }) {
  if (!product) return null;

  const discount = Math.round(((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-brand-cream relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-brand-navy text-white font-mono text-xs px-3 py-1">
                {discount}% OFF
              </span>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-2">{product.brand}</p>
            <h2 className="font-heading text-2xl md:text-3xl text-brand-navy mb-4">{product.title}</h2>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-2xl text-brand-navy">{formatPrice(product.priceCents)}</span>
              <span className="font-mono text-sm text-brand-muted line-through">{formatPrice(product.originalPriceCents)}</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-brand-cream font-mono text-xs text-brand-navy">{product.condition}</span>
              <span className="px-3 py-1 bg-green-50 font-mono text-xs text-green-700">Authenticated</span>
            </div>
            <p className="font-mono text-sm text-brand-muted leading-relaxed mb-8">{product.description}</p>
            <div className="mt-auto space-y-3">
              <button
                onClick={onAddToCart}
                className="w-full py-4 bg-brand-navy text-white font-mono text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors"
              >
                Add to Cart
              </button>
              <Link
                href={`/products/${product.sku}`}
                className="block w-full py-4 border-2 border-brand-navy text-brand-navy font-mono text-sm uppercase tracking-wider text-center hover:bg-brand-navy hover:text-white transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Chip
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-mono text-sm transition-colors ${
        active
          ? 'bg-brand-navy text-white'
          : 'bg-white border border-gray-200 text-brand-navy hover:border-brand-navy'
      }`}
    >
      {label}
    </button>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const categoryParam = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<'price-high' | 'price-low'>('price-high');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login?redirect=/shop');
      return;
    }
    // TODO: Add to cart logic
    alert('Added to cart!');
  };

  const categories = [
    { value: '', label: 'All' },
    { value: 'DRESSES', label: 'Dresses' },
    { value: 'TOPS', label: 'Tops' },
    { value: 'OUTERWEAR', label: 'Coats & Jackets' },
    { value: 'PANTS', label: 'Pants & Jeans' },
    { value: 'SKIRTS', label: 'Skirts' },
    { value: 'SWEATERS', label: 'Sweaters' },
    { value: 'HANDBAGS', label: 'Handbags' },
    { value: 'SHOES', label: 'Shoes' },
    { value: 'JEWELRY', label: 'Jewelry' },
    { value: 'WATCHES', label: 'Watches' },
    { value: 'ACCESSORIES', label: 'Accessories' },
  ];

  const filteredProducts = useMemo(() => {
    let products = [...staticProducts];

    if (selectedCategory) {
      products = products.filter(p => p.category === selectedCategory);
    }

    products.sort((a, b) => {
      return sortBy === 'price-high'
        ? b.priceCents - a.priceCents
        : a.priceCents - b.priceCents;
    });

    return products;
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 lg:top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-6 lg:px-12 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl lg:text-3xl text-brand-navy">Shop</h1>
              <p className="font-mono text-sm text-brand-muted">{filteredProducts.length} items</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <FilterChip
                  key={cat.value}
                  label={cat.label}
                  active={selectedCategory === cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                />
              ))}
              <div className="w-px h-6 bg-gray-300 mx-2 hidden lg:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price-high' | 'price-low')}
                className="px-4 py-2 bg-white border border-gray-200 font-mono text-sm text-brand-navy focus:outline-none focus:border-brand-navy"
              >
                <option value="price-high">Price: High → Low</option>
                <option value="price-low">Price: Low → High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 lg:px-12 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-mono text-brand-muted mb-4">No products found</p>
            <button
              onClick={() => setSelectedCategory('')}
              className="font-mono text-sm text-brand-navy hover:opacity-60"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => {
              const discount = Math.round(
                ((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100
              );

              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group text-left"
                >
                  <div className="aspect-square bg-brand-cream mb-3 overflow-hidden relative rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-brand-navy shadow-lg">
                        Quick View
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-brand-navy text-white font-mono text-xs px-2 py-1 rounded">
                        {discount}% OFF
                      </span>
                    )}
                    {/* Store logo and authenticity badge */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.store.logo} alt={product.store.name} className="h-4 w-auto" />
                      <span className="font-mono text-[10px] text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Guaranteed Authentic
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-heading text-sm lg:text-base text-brand-navy mb-1 line-clamp-2 group-hover:opacity-60 transition-opacity">
                      {product.title}
                    </h3>
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
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite" />}>
      <ShopPageContent />
    </Suspense>
  );
}
