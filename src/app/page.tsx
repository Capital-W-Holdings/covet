import Link from 'next/link';

// Static product data - hardcoded for consistency
const products = [
  { id: '1', sku: 'hermes-birkin-25-noir', title: 'Hermès Birkin 25', brand: 'Hermès', price: '$18,950', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
  { id: '2', sku: 'chanel-classic-flap-medium', title: 'Chanel Classic Flap', brand: 'Chanel', price: '$7,850', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' },
  { id: '3', sku: 'rolex-datejust-36', title: 'Rolex Datejust 36', brand: 'Rolex', price: '$8,950', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop' },
  { id: '4', sku: 'cartier-love-bracelet', title: 'Cartier Love Bracelet', brand: 'Cartier', price: '$5,950', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop' },
  { id: '5', sku: 'louis-vuitton-neverfull-mm', title: 'LV Neverfull MM', brand: 'Louis Vuitton', price: '$1,450', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop' },
  { id: '6', sku: 'gucci-marmont-small', title: 'Gucci GG Marmont', brand: 'Gucci', price: '$1,650', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop' },
  { id: '7', sku: 'omega-speedmaster-moonwatch', title: 'Omega Speedmaster', brand: 'Omega', price: '$4,950', image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=400&fit=crop' },
  { id: '8', sku: 'van-cleef-alhambra-vintage', title: 'VCA Alhambra Pendant', brand: 'Van Cleef & Arpels', price: '$3,250', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[500px] flex items-center"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent), url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl text-white">
            <h1 className="text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Luxury,<br /><span className="font-semibold">Authenticated.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Boston&apos;s premier destination for authenticated luxury consignment.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-amber-50 py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">C</span>
              <div>
                <p className="font-medium text-gray-900">Covet Certified</p>
                <p className="text-sm text-gray-600">Expert authentication</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</span>
              <div>
                <p className="font-medium text-gray-900">100% Authentic</p>
                <p className="text-sm text-gray-600">Money-back guarantee</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">S</span>
              <div>
                <p className="font-medium text-gray-900">Free Shipping</p>
                <p className="text-sm text-gray-600">On all orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-light text-gray-900">Featured Pieces</h2>
              <p className="text-gray-600 mt-1">Hand-selected by our experts</p>
            </div>
            <Link href="/shop" className="text-gray-900 font-medium hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.sku}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                    Certified
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">{product.brand}</p>
                  <h3 className="font-medium text-gray-900 mt-1 line-clamp-1">{product.title}</h3>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">Ready to Consign?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Turn your luxury items into cash with competitive commission rates.
          </p>
          <Link
            href="/sell"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Start Consigning
          </Link>
        </div>
      </section>
    </div>
  );
}
