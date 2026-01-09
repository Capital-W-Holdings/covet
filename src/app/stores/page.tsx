import Link from 'next/link';
import { MapPin, Package, Star, ArrowRight, Shield, Users, TrendingUp, Check } from 'lucide-react';
import { Container, Card, Button, Badge } from '@/components/ui';

// Partner stores with locations
const partnerStores = [
  {
    id: '1',
    name: 'Covet Back Bay',
    slug: 'covet-back-bay',
    description: 'Our flagship location in the heart of Boston\'s premier shopping district.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    location: { city: 'Boston', state: 'MA', lat: 42.3510, lng: -71.0760 },
    productCount: 245,
    trustScore: 100,
    isFlagship: true,
  },
  {
    id: '2',
    name: 'Covet South End',
    slug: 'covet-south-end',
    description: 'Curated vintage and contemporary designer pieces in the trendy South End.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
    location: { city: 'Boston', state: 'MA', lat: 42.3420, lng: -71.0700 },
    productCount: 189,
    trustScore: 100,
    isFlagship: true,
  },
  {
    id: '3',
    name: 'Covet Beacon Hill',
    slug: 'covet-beacon-hill',
    description: 'Historic charm meets luxury consignment on Charles Street.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800',
    location: { city: 'Boston', state: 'MA', lat: 42.3580, lng: -71.0700 },
    productCount: 156,
    trustScore: 100,
    isFlagship: true,
  },
  {
    id: '4',
    name: 'Luxury Finds NYC',
    slug: 'luxury-finds-nyc',
    description: 'Manhattan\'s trusted source for pre-loved designer fashion.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    location: { city: 'New York', state: 'NY', lat: 40.7580, lng: -73.9855 },
    productCount: 312,
    trustScore: 98,
    isFlagship: false,
  },
  {
    id: '5',
    name: 'Hamptons Resale',
    slug: 'hamptons-resale',
    description: 'Summer estate consignments from the Hamptons elite.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    location: { city: 'East Hampton', state: 'NY', lat: 40.9634, lng: -72.1848 },
    productCount: 178,
    trustScore: 97,
    isFlagship: false,
  },
  {
    id: '6',
    name: 'Newport Consignment',
    slug: 'newport-consignment',
    description: 'Classic elegance from Rhode Island\'s historic mansions.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    location: { city: 'Newport', state: 'RI', lat: 41.4901, lng: -71.3128 },
    productCount: 134,
    trustScore: 96,
    isFlagship: false,
  },
];

const benefits = [
  {
    icon: Users,
    title: 'Reach Thousands of Buyers',
    description: 'Access our growing community of luxury shoppers actively looking for authenticated pieces.',
  },
  {
    icon: Shield,
    title: 'Covet Authentication',
    description: 'Every item you list gets the Covet seal of authenticity, building instant buyer trust.',
  },
  {
    icon: TrendingUp,
    title: 'Higher Margins',
    description: 'Our low commission rates mean you keep more of each sale. No hidden fees.',
  },
];

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <div className="bg-brand-navy text-white py-16">
        <Container>
          <h1 className="font-heading text-3xl lg:text-4xl mb-4">Partner Stores</h1>
          <p className="text-lg text-gray-200 max-w-2xl font-mono">
            Discover authenticated luxury from our network of trusted consignment partners.
            Each store is vetted and verified by the Covet team.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        {/* Store Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerStores.map((store) => (
            <Link key={store.id} href={`/stores/${store.slug}`}>
              <Card hover className="h-full">
                {/* Cover Image */}
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={store.coverImage}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Type Badge */}
                  {store.isFlagship && (
                    <Badge variant="gold" className="absolute top-3 left-3">
                      Covet Flagship
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="relative w-16 h-16 -mt-10 bg-white rounded-lg border-2 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-full h-auto"
                      />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-medium text-gray-900 truncate">{store.name}</h3>

                      {/* Trust Score */}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{store.trustScore}% Trust Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                    {store.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{store.productCount} items</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{store.location.city}, {store.location.state}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Why Partner Section */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl text-gray-900 mb-8 text-center">Why Partner with Covet?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-navy/10 rounded-xl mb-4">
                  <benefit.icon className="w-7 h-7 text-brand-navy" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA for sellers */}
        <div className="mt-16">
          <Card className="p-8 lg:p-12 bg-brand-navy text-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading text-2xl lg:text-3xl mb-4 text-center">Want to sell on Covet?</h2>
              <p className="text-gray-200 mb-8 text-center font-mono">
                Join our network of trusted luxury consignment partners and reach thousands of authenticated buyers.
              </p>

              {/* Benefits checklist */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  'No upfront costs or monthly fees',
                  'Professional product photography',
                  'Expert authentication services',
                  'Marketing & promotion included',
                  'Fast payouts within 48 hours',
                  'Dedicated partner support team',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/sell">
                  <Button variant="secondary" size="lg">
                    Become a Partner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
