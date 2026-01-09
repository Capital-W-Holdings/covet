import Link from 'next/link';
import { MapPin, Package, Star, ArrowRight, Shield, Users, TrendingUp, Check, Phone, Clock, ExternalLink } from 'lucide-react';
import { Container, Card, Button, Badge } from '@/components/ui';

// Covet's actual store locations
const covetStores = [
  {
    id: 'beacon-hill',
    name: 'Covet Beacon Hill',
    slug: 'covet-beacon-hill',
    description: 'Our original location on historic Charles Street. Beacon Hill charm meets curated luxury.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800',
    address: '109 Charles Street',
    city: 'Boston',
    state: 'MA',
    zip: '02114',
    phone: '617.530.1111',
    hours: 'Mon-Sat 10am-7pm, Sun 10am-6pm',
    location: { lat: 42.3584, lng: -71.0711 },
    productCount: 245,
    trustScore: 100,
    isFlagship: true,
    externalUrl: 'https://covetboston.com/pages/stores',
  },
  {
    id: 'back-bay',
    name: 'Covet Back Bay',
    slug: 'covet-back-bay',
    description: 'Our flagship location on iconic Newbury Street in Boston\'s premier shopping district.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    address: '176 Newbury Street',
    city: 'Boston',
    state: 'MA',
    zip: '02116',
    phone: '617.356.0070',
    hours: 'Daily 10am-7pm',
    location: { lat: 42.3510, lng: -71.0760 },
    productCount: 312,
    trustScore: 100,
    isFlagship: true,
    externalUrl: 'https://covetboston.com/pages/stores',
  },
  {
    id: 'south-end',
    name: 'Covet South End',
    slug: 'covet-south-end',
    description: 'Our newest location in the heart of the South End. Contemporary luxury in a trendy neighborhood.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
    address: '575 Tremont Street',
    city: 'Boston',
    state: 'MA',
    zip: '02118',
    phone: '617.356.0040',
    hours: 'Daily 10am-6pm',
    location: { lat: 42.3420, lng: -71.0700 },
    productCount: 189,
    trustScore: 100,
    isFlagship: true,
    isNew: true,
    externalUrl: 'https://covetboston.com/pages/stores',
  },
  {
    id: 'southie',
    name: 'Covet Southie',
    slug: 'covet-southie',
    description: 'South Boston\'s destination for authenticated luxury consignment. Local vibes, world-class finds.',
    logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp',
    coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    address: '391 W Broadway',
    city: 'Boston',
    state: 'MA',
    zip: '02127',
    phone: '617.268.1100',
    hours: 'Mon-Sat 10am-7pm, Sun 10am-6pm',
    location: { lat: 42.3380, lng: -71.0460 },
    productCount: 156,
    trustScore: 100,
    isFlagship: true,
    externalUrl: 'https://covetboston.com/pages/stores',
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
          <h1 className="font-heading text-3xl lg:text-4xl mb-4">Our Stores</h1>
          <p className="text-lg text-gray-200 max-w-2xl font-mono">
            Visit any of our four Boston locations for authenticated luxury consignment.
            Every item is vetted by our expert team.
          </p>
          <a
            href="https://covetboston.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit covetboston.com
          </a>
        </Container>
      </div>

      <Container className="py-12">
        {/* Store Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {covetStores.map((store) => (
            <a
              key={store.id}
              href={store.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card hover className="h-full">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={store.coverImage}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="gold">Covet Location</Badge>
                    {store.isNew && (
                      <Badge variant="success">Now Open!</Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="relative w-16 h-16 -mt-12 bg-white rounded-lg border-2 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-full h-auto"
                      />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-medium text-gray-900 text-lg">{store.name}</h3>

                      {/* Trust Score */}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{store.trustScore}% Trust Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mt-4">
                    {store.description}
                  </p>

                  {/* Store Details */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{store.address}, {store.city}, {store.state} {store.zip}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                  </div>

                  {/* View Link */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{store.productCount}+ items in store</span>
                    </div>
                    <span className="text-sm text-brand-navy font-medium flex items-center gap-1">
                      Visit Store <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </a>
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
