import Link from 'next/link';

// Static product data
const products = [
  { id: '1', sku: 'hermes-birkin-25-noir', title: 'Hermès Birkin 25 Togo Noir', brand: 'Hermès', price: '$18,950', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop' },
  { id: '2', sku: 'chanel-classic-flap-medium', title: 'Chanel Classic Flap Medium', brand: 'Chanel', price: '$7,850', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop' },
  { id: '3', sku: 'rolex-datejust-36', title: 'Rolex Datejust 36', brand: 'Rolex', price: '$8,950', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop' },
  { id: '4', sku: 'cartier-love-bracelet', title: 'Cartier Love Bracelet', brand: 'Cartier', price: '$5,950', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop' },
  { id: '5', sku: 'louis-vuitton-neverfull-mm', title: 'Louis Vuitton Neverfull MM', brand: 'Louis Vuitton', price: '$1,450', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop' },
  { id: '6', sku: 'gucci-marmont-small', title: 'Gucci GG Marmont', brand: 'Gucci', price: '$1,650', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop' },
];

export default function HomePage() {
  return (
    <div className="bg-brand-offwhite">
      {/* Hero - Minimalist with upscale imagery */}
      <section className="border-b-2 border-brand-navy">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text Content */}
            <div className="flex flex-col justify-center px-6 lg:px-12 py-16 lg:py-24">
              <h1 className="font-heading text-4xl lg:text-6xl text-brand-navy mb-6 leading-tight">
                Authenticated<br />Luxury Consignment
              </h1>
              <p className="font-mono text-brand-muted text-sm lg:text-base mb-8 max-w-md leading-relaxed">
                Boston&apos;s premier destination for pre-owned luxury goods. Every piece authenticated by our expert team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="inline-block bg-brand-navy text-white font-mono text-sm uppercase tracking-wider px-8 py-4 hover:bg-opacity-80 transition-colors text-center"
                >
                  Shop Now
                </Link>
                <Link
                  href="/sell"
                  className="inline-block border-2 border-brand-navy text-brand-navy font-mono text-sm uppercase tracking-wider px-8 py-4 hover:bg-brand-navy hover:text-white transition-colors text-center"
                >
                  Consign With Us
                </Link>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative h-[400px] lg:h-auto lg:min-h-[600px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop"
                alt="Luxury handbag"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b-2 border-brand-navy py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <span className="font-mono text-2xl text-brand-navy">01</span>
              <div>
                <h3 className="font-heading text-brand-navy mb-1">Expert Authentication</h3>
                <p className="font-mono text-sm text-brand-muted">Every item verified by certified authenticators</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="font-mono text-2xl text-brand-navy">02</span>
              <div>
                <h3 className="font-heading text-brand-navy mb-1">Authenticity Guarantee</h3>
                <p className="font-mono text-sm text-brand-muted">100% money-back if not authentic</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="font-mono text-2xl text-brand-navy">03</span>
              <div>
                <h3 className="font-heading text-brand-navy mb-1">Complimentary Shipping</h3>
                <p className="font-mono text-sm text-brand-muted">Free insured shipping on all orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-brand-navy mb-2">New Arrivals</h2>
              <p className="font-mono text-sm text-brand-muted">Freshly authenticated pieces</p>
            </div>
            <Link href="/shop" className="font-mono text-sm uppercase tracking-wider text-brand-navy hover:opacity-60 transition-opacity hidden sm:block">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.sku}`}
                className="group"
              >
                <div className="aspect-square bg-brand-cream mb-4 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-1">{product.brand}</p>
                  <h3 className="font-heading text-brand-navy mb-1 group-hover:opacity-60 transition-opacity">{product.title}</h3>
                  <p className="font-mono text-sm text-brand-navy">{product.price}</p>
                </div>
              </Link>
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
      <section className="border-t-2 border-brand-navy py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="font-heading text-3xl lg:text-4xl text-brand-navy mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/shop?category=HANDBAGS" className="group relative aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop"
                alt="Handbags"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-navy bg-opacity-40 group-hover:bg-opacity-30 transition-all" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-heading text-2xl text-white">Handbags</h3>
              </div>
            </Link>
            <Link href="/shop?category=WATCHES" className="group relative aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=1000&fit=crop"
                alt="Watches"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-navy bg-opacity-40 group-hover:bg-opacity-30 transition-all" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-heading text-2xl text-white">Watches</h3>
              </div>
            </Link>
            <Link href="/shop?category=JEWELRY" className="group relative aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop"
                alt="Jewelry"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-navy bg-opacity-40 group-hover:bg-opacity-30 transition-all" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-heading text-2xl text-white">Jewelry</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-4">Consign With Us</h2>
          <p className="font-mono text-sm text-gray-400 mb-8 max-w-lg mx-auto">
            Turn your luxury pieces into cash. Competitive rates, expert handling, and a network of discerning buyers.
          </p>
          <Link
            href="/sell"
            className="inline-block border-2 border-white text-white font-mono text-sm uppercase tracking-wider px-8 py-4 hover:bg-white hover:text-brand-navy transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
