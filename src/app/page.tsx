'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

// Store locations
const stores = {
  backBay: { name: 'Back Bay', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  southEnd: { name: 'South End', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  beaconHill: { name: 'Beacon Hill', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  southie: { name: 'Southie', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  nyc: { name: 'NYC', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  hamptons: { name: 'Hamptons', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
};

// Featured products - mix of clothing and accessories
const products = [
  { id: '1', sku: 'chanel-tweed-dress-black', title: 'Chanel Tweed Sheath Dress', brand: 'Chanel', price: '$3,850', originalPrice: '$5,500', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop', description: 'Classic Chanel black tweed sheath dress with gold button details. Size 38.', store: stores.backBay },
  { id: '2', sku: 'hermes-birkin-25-noir', title: 'Hermès Birkin 25 Togo Noir', brand: 'Hermès', price: '$18,950', originalPrice: '$22,000', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware.', store: stores.hamptons },
  { id: '3', sku: 'burberry-trench-heritage', title: 'Burberry Heritage Trench Coat', brand: 'Burberry', price: '$1,450', originalPrice: '$2,200', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop', description: 'Iconic Burberry trench in honey color with signature check lining.', store: stores.nyc },
  { id: '4', sku: 'christian-louboutin-so-kate', title: 'Christian Louboutin So Kate 120', brand: 'Christian Louboutin', price: '$450', originalPrice: '$725', condition: 'Very Good', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop', description: 'Iconic red-soled stilettos in black patent leather. Size 38.', store: stores.southEnd },
  { id: '5', sku: 'cartier-love-bracelet', title: 'Cartier Love Bracelet', brand: 'Cartier', price: '$5,950', originalPrice: '$7,500', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17.', store: stores.beaconHill },
  { id: '6', sku: 'loro-piana-cashmere', title: 'Loro Piana Baby Cashmere Sweater', brand: 'Loro Piana', price: '$1,850', originalPrice: '$2,800', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', description: 'Ultimate luxury baby cashmere turtleneck in oatmeal.', store: stores.southie },
];

// Product Modal Component
function ProductModal({ product, onClose, onAddToCart }: { product: typeof products[0] | null; onClose: () => void; onAddToCart: () => void }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">{product.brand}</p>
            <h2 className="font-heading text-2xl md:text-3xl text-gray-900 mb-4">{product.title}</h2>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-2xl text-gray-900">{product.price}</span>
              <span className="font-mono text-sm text-gray-400 line-through">{product.originalPrice}</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-gray-100 rounded-full font-mono text-xs text-gray-700">{product.condition}</span>
              <span className="px-3 py-1 bg-green-50 rounded-full font-mono text-xs text-green-700">Authenticated</span>
            </div>
            <p className="font-mono text-sm text-gray-500 leading-relaxed mb-8">{product.description}</p>
            <div className="mt-auto space-y-3">
              <button onClick={onAddToCart} className="w-full py-4 bg-gray-900 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors">
                Add to Cart
              </button>
              <Link
                href={`/products/${product.sku}`}
                className="block w-full py-4 border border-gray-300 text-gray-700 font-mono text-sm uppercase tracking-wider text-center rounded-lg hover:bg-gray-50 transition-colors"
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
      <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-xl relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider text-gray-700 shadow-lg">
            Quick View
          </span>
        </div>
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
        <p className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-1">{product.brand}</p>
        <h3 className="font-heading text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">{product.title}</h3>
        <p className="font-mono text-sm text-gray-900">{product.price}</p>
      </div>
    </button>
  );
}

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login?redirect=/');
      return;
    }
    alert('Added to cart!');
  };

  return (
    <div className="bg-white">
      {/* Hero - Covet Boston store image */}
      <section className="relative h-[50vh] lg:h-[70vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://covetboston.com/cdn/shop/files/image6_cb186b33-00f5-4be5-a0be-e2ad49c621b4.jpg?v=1737513804&width=3000"
          alt="Covet Boston curated secondhand and vintage"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '1% 62%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="max-w-xl">
            <h1 className="font-heading text-3xl lg:text-5xl text-white mb-3 leading-tight drop-shadow-lg">
              Curated Secondhand & Vintage
            </h1>
            <p className="font-mono text-sm text-white/90 mb-6 drop-shadow-md">
              The world&apos;s premier destination for designer consignment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-block bg-white text-gray-900 font-mono text-sm uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                href="/sell"
                className="inline-block bg-white/20 backdrop-blur-sm border border-white/50 text-white font-mono text-sm uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
              >
                Sell With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 border-b border-gray-100">
        <div className="px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-heading text-2xl text-gray-900">10k+</p>
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">Items Sold</p>
            </div>
            <div>
              <p className="font-heading text-2xl text-gray-900">100%</p>
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">Authenticated</p>
            </div>
            <div>
              <p className="font-heading text-2xl text-gray-900">4.9★</p>
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 lg:py-16">
        <div className="px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl lg:text-3xl text-gray-900 mb-1">New Arrivals</h2>
              <p className="font-mono text-sm text-gray-500">Freshly authenticated pieces</p>
            </div>
            <Link href="/shop" className="font-mono text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
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
            <Link href="/shop" className="font-mono text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors">
              View All →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="px-6 lg:px-12">
          <h2 className="font-heading text-2xl lg:text-3xl text-gray-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Dresses', category: 'DRESSES', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop' },
              { name: 'Tops & Blouses', category: 'TOPS', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop' },
              { name: 'Coats & Jackets', category: 'OUTERWEAR', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop' },
              { name: 'Handbags', category: 'HANDBAGS', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop' },
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/shop?category=${cat.category}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <h3 className="font-heading text-xl text-white">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          {/* Second row of categories */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { name: 'Skirts', category: 'SKIRTS', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj49?w=400&h=500&fit=crop' },
              { name: 'Pants & Jeans', category: 'PANTS', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop' },
              { name: 'Jewelry', category: 'JEWELRY', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop' },
              { name: 'Shoes', category: 'SHOES', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop' },
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/shop?category=${cat.category}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
          <div className="bg-gray-100 p-8 lg:p-12 rounded-2xl text-center">
            <h2 className="font-heading text-2xl lg:text-3xl text-gray-900 mb-3">Ready to Consign?</h2>
            <p className="font-mono text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Turn your luxury pieces into cash. Competitive rates and expert handling.
            </p>
            <Link
              href="/sell"
              className="inline-block bg-gray-900 text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors"
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
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
