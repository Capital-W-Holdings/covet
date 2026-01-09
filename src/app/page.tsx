'use client';

import { useState } from 'react';
import Link from 'next/link';

// Static product data
const products = [
  { id: '1', sku: 'hermes-birkin-25-noir', title: 'Hermès Birkin 25 Togo Noir', brand: 'Hermès', price: '$18,950', originalPrice: '$22,000', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware. Includes original box, dustbag, lock, keys, and clochette.' },
  { id: '2', sku: 'chanel-classic-flap-medium', title: 'Chanel Classic Flap Medium', brand: 'Chanel', price: '$7,850', originalPrice: '$10,500', condition: 'Very Good', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', description: 'Timeless Chanel Classic Medium Flap in black caviar leather with silver hardware. Excellent condition.' },
  { id: '3', sku: 'rolex-datejust-36', title: 'Rolex Datejust 36', brand: 'Rolex', price: '$8,950', originalPrice: '$12,000', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop', description: 'Classic Rolex Datejust 36mm in steel and 18k yellow gold with champagne dial. Includes box and papers.' },
  { id: '4', sku: 'cartier-love-bracelet', title: 'Cartier Love Bracelet', brand: 'Cartier', price: '$5,950', originalPrice: '$7,500', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17. Includes screwdriver, box, and certificate.' },
  { id: '5', sku: 'louis-vuitton-neverfull-mm', title: 'Louis Vuitton Neverfull MM', brand: 'Louis Vuitton', price: '$1,450', originalPrice: '$2,000', condition: 'Very Good', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop', description: 'Versatile Louis Vuitton Neverfull MM in Damier Ebene canvas with red interior. Includes pochette.' },
  { id: '6', sku: 'gucci-marmont-small', title: 'Gucci GG Marmont', brand: 'Gucci', price: '$1,650', originalPrice: '$2,500', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop', description: 'Elegant Gucci GG Marmont small shoulder bag in dusty pink matelassé leather with gold hardware.' },
];

// Product Modal Component
function ProductModal({ product, onClose }: { product: typeof products[0] | null; onClose: () => void }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-brand-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-2">{product.brand}</p>
            <h2 className="font-heading text-2xl md:text-3xl text-brand-navy mb-4">{product.title}</h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-2xl text-brand-navy">{product.price}</span>
              <span className="font-mono text-sm text-brand-muted line-through">{product.originalPrice}</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-brand-cream font-mono text-xs text-brand-navy">
                {product.condition}
              </span>
              <span className="px-3 py-1 bg-green-50 font-mono text-xs text-green-700">
                Authenticated
              </span>
            </div>

            <p className="font-mono text-sm text-brand-muted leading-relaxed mb-8">
              {product.description}
            </p>

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

// Product Card Component
function ProductCard({ product, onClick }: { product: typeof products[0]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group text-left w-full">
      <div className="aspect-square bg-brand-cream mb-4 overflow-hidden relative">
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
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-1">{product.brand}</p>
        <h3 className="font-heading text-brand-navy mb-1 group-hover:opacity-60 transition-opacity">{product.title}</h3>
        <p className="font-mono text-sm text-brand-navy">{product.price}</p>
      </div>
    </button>
  );
}

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  return (
    <div className="bg-brand-offwhite">
      {/* Hero - Luxury clothing rack */}
      <section className="relative h-[60vh] lg:h-[80vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop"
          alt="Luxury consignment store"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="px-6 lg:px-12 max-w-xl">
            <h1 className="font-heading text-4xl lg:text-6xl text-white mb-4 leading-tight">
              Authenticated Luxury Consignment
            </h1>
            <p className="font-mono text-sm lg:text-base text-gray-300 mb-8 leading-relaxed">
              Boston&apos;s premier destination for pre-owned luxury. Every piece authenticated by experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="inline-block bg-white text-brand-navy font-mono text-sm uppercase tracking-wider px-8 py-4 hover:bg-gray-100 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/sell"
                className="inline-block border-2 border-white text-white font-mono text-sm uppercase tracking-wider px-8 py-4 hover:bg-white hover:text-brand-navy transition-colors text-center"
              >
                Sell With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-brand-navy py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-heading text-2xl lg:text-3xl text-white">10k+</p>
              <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">Items Sold</p>
            </div>
            <div>
              <p className="font-heading text-2xl lg:text-3xl text-white">100%</p>
              <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">Authenticated</p>
            </div>
            <div>
              <p className="font-heading text-2xl lg:text-3xl text-white">4.9★</p>
              <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 lg:py-16">
        <div className="px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl lg:text-3xl text-brand-navy mb-1">New Arrivals</h2>
              <p className="font-mono text-sm text-brand-muted">Freshly authenticated pieces</p>
            </div>
            <Link href="/shop" className="font-mono text-sm uppercase tracking-wider text-brand-navy hover:opacity-60 transition-opacity hidden sm:block">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop" className="font-mono text-sm uppercase tracking-wider text-brand-navy hover:opacity-60 transition-opacity">
              View All →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16 bg-brand-cream">
        <div className="px-6 lg:px-12">
          <h2 className="font-heading text-2xl lg:text-3xl text-brand-navy mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Handbags', category: 'HANDBAGS', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop' },
              { name: 'Watches', category: 'WATCHES', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop' },
              { name: 'Jewelry', category: 'JEWELRY', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop' },
              { name: 'Accessories', category: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=500&fit=crop' },
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/shop?category=${cat.category}`}
                className="group relative aspect-[4/5] overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-end p-4">
                  <h3 className="font-heading text-xl text-white">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16">
        <div className="px-6 lg:px-12">
          <div className="bg-brand-navy p-8 lg:p-12 text-center">
            <h2 className="font-heading text-2xl lg:text-3xl text-white mb-3">Ready to Consign?</h2>
            <p className="font-mono text-sm text-gray-400 mb-6 max-w-md mx-auto">
              Turn your luxury pieces into cash. Competitive rates and expert handling.
            </p>
            <Link
              href="/sell"
              className="inline-block border-2 border-white text-white font-mono text-sm uppercase tracking-wider px-8 py-4 hover:bg-white hover:text-brand-navy transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
