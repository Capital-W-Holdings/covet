'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Static product data
const allProducts = [
  { id: '1', sku: 'hermes-birkin-25-noir', title: 'Hermès Birkin 25 Togo Noir', brand: 'Hermès', category: 'HANDBAGS', condition: 'Excellent', priceCents: 1895000, originalPriceCents: 2200000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware.' },
  { id: '2', sku: 'chanel-classic-flap-medium', title: 'Chanel Classic Flap Medium', brand: 'Chanel', category: 'HANDBAGS', condition: 'Very Good', priceCents: 785000, originalPriceCents: 1050000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', description: 'Timeless Chanel Classic Medium Flap in black caviar leather.' },
  { id: '3', sku: 'rolex-datejust-36', title: 'Rolex Datejust 36', brand: 'Rolex', category: 'WATCHES', condition: 'Excellent', priceCents: 895000, originalPriceCents: 1200000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop', description: 'Classic Rolex Datejust 36mm in steel and 18k yellow gold.' },
  { id: '4', sku: 'cartier-love-bracelet', title: 'Cartier Love Bracelet', brand: 'Cartier', category: 'JEWELRY', condition: 'Excellent', priceCents: 595000, originalPriceCents: 750000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17.' },
  { id: '5', sku: 'louis-vuitton-neverfull-mm', title: 'Louis Vuitton Neverfull MM', brand: 'Louis Vuitton', category: 'HANDBAGS', condition: 'Very Good', priceCents: 145000, originalPriceCents: 200000, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop', description: 'Versatile Louis Vuitton Neverfull MM in Damier Ebene canvas.' },
  { id: '6', sku: 'gucci-marmont-small', title: 'Gucci GG Marmont', brand: 'Gucci', category: 'HANDBAGS', condition: 'Excellent', priceCents: 165000, originalPriceCents: 250000, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop', description: 'Elegant Gucci GG Marmont small shoulder bag in dusty pink.' },
  { id: '7', sku: 'omega-speedmaster', title: 'Omega Speedmaster Moonwatch', brand: 'Omega', category: 'WATCHES', condition: 'Excellent', priceCents: 495000, originalPriceCents: 650000, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=600&fit=crop', description: 'The legendary Omega Speedmaster Professional Moonwatch.' },
  { id: '8', sku: 'van-cleef-alhambra', title: 'VCA Vintage Alhambra Pendant', brand: 'Van Cleef & Arpels', category: 'JEWELRY', condition: 'Excellent', priceCents: 325000, originalPriceCents: 420000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop', description: 'Signature Van Cleef & Arpels Vintage Alhambra pendant.' },
  { id: '9', sku: 'dior-lady-dior', title: 'Dior Lady Dior Medium', brand: 'Dior', category: 'HANDBAGS', condition: 'Excellent', priceCents: 425000, originalPriceCents: 550000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Classic Lady Dior medium in black lambskin with silver hardware.' },
  { id: '10', sku: 'patek-nautilus', title: 'Patek Philippe Nautilus 5711', brand: 'Patek Philippe', category: 'WATCHES', condition: 'Excellent', priceCents: 12500000, originalPriceCents: 15000000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop', description: 'Iconic Patek Philippe Nautilus 5711/1A in stainless steel.' },
  { id: '11', sku: 'tiffany-pendant', title: 'Tiffany Diamond Pendant', brand: 'Tiffany & Co.', category: 'JEWELRY', condition: 'New', priceCents: 285000, originalPriceCents: 350000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop', description: 'Elegant Tiffany diamond solitaire pendant in platinum.' },
  { id: '12', sku: 'prada-galleria', title: 'Prada Galleria Saffiano', brand: 'Prada', category: 'HANDBAGS', condition: 'Very Good', priceCents: 195000, originalPriceCents: 295000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', description: 'Timeless Prada Galleria in black saffiano leather.' },
];

type Product = typeof allProducts[0];

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// Product Modal
function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
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
              <button className="w-full py-4 bg-brand-navy text-white font-mono text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors">
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
  const categoryParam = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<'price-high' | 'price-low'>('price-high');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    { value: '', label: 'All' },
    { value: 'HANDBAGS', label: 'Handbags' },
    { value: 'WATCHES', label: 'Watches' },
    { value: 'JEWELRY', label: 'Jewelry' },
  ];

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

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
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <div className="sticky top-0 lg:top-0 z-30 bg-brand-offwhite border-b border-gray-200">
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
                  <div className="aspect-square bg-brand-cream mb-3 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-brand-navy">
                        Quick View
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-brand-navy text-white font-mono text-xs px-2 py-1">
                        {discount}% OFF
                      </span>
                    )}
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
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
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
