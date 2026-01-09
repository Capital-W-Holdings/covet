import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Shield, Award, Truck } from 'lucide-react';
import { Container, Button } from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { productRepository } from '@/lib/repositories';

const categories = [
  {
    name: 'Handbags',
    href: '/shop?category=HANDBAGS',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    description: 'Iconic designs from Hermès, Chanel & more',
  },
  {
    name: 'Watches',
    href: '/shop?category=WATCHES',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600',
    description: 'Rolex, Patek Philippe, Omega & more',
  },
  {
    name: 'Jewelry',
    href: '/shop?category=JEWELRY',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    description: 'Cartier, Van Cleef & Arpels & more',
  },
];

const trustFeatures = [
  {
    icon: Shield,
    title: 'Covet Certified',
    description: 'Every item authenticated by our expert team',
  },
  {
    icon: Award,
    title: '100% Authentic',
    description: 'Guaranteed authenticity or your money back',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary shipping on all orders',
  },
];

// Revalidate every 60 seconds for consistent data
export const revalidate = 60;

export default async function HomePage() {
  // Fetch products server-side for consistency
  const products = await productRepository.getFeatured(8);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-brand-charcoal text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920)',
          }}
        />
        <Container className="relative z-20 py-24 lg:py-40">
          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
              Luxury,
              <br />
              <span className="font-semibold">Authenticated.</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 mb-8">
              Boston&apos;s premier destination for authenticated luxury consignment.
              Shop with confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" variant="secondary">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/consign">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-charcoal">
                  Consign With Us
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Features */}
      <section className="bg-brand-cream py-8 border-b border-gray-200">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full">
                  <feature.icon className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover authenticated luxury from the world&apos;s most coveted brands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-medium mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-300">{category.description}</p>
                  <span className="inline-flex items-center mt-4 text-sm font-medium text-brand-gold group-hover:underline">
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <Container>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-2">
                Featured Pieces
              </h2>
              <p className="text-gray-600">
                Hand-selected by our experts
              </p>
            </div>
            <Link href="/shop" className="hidden sm:block">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop">
              <Button variant="outline">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* About / Trust Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                The Covet Difference
              </h2>
              <div className="space-y-6 text-gray-600">
                <p>
                  Since 2015, Covet has been Boston&apos;s trusted destination for authenticated
                  luxury consignment. Every piece in our collection passes through our rigorous
                  authentication process, ensuring you shop with complete confidence.
                </p>
                <p>
                  Our team of experts has over 50 years of combined experience authenticating
                  luxury goods from the world&apos;s most coveted brands. When you see the
                  <span className="text-brand-gold font-medium"> Covet Certified </span>
                  badge, you know it&apos;s real.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/authentication">
                  <Button variant="primary">
                    Our Authentication Process
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800"
                alt="Covet Store"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-brand-charcoal text-white py-16 lg:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6">
              Ready to Consign?
            </h2>
            <p className="text-gray-400 mb-8">
              Turn your luxury items into cash. We offer competitive commission rates
              and handle everything from authentication to shipping.
            </p>
            <Link href="/consign">
              <Button size="lg" variant="secondary">
                Start Consigning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
