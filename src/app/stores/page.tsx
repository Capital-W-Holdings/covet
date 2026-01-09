'use client';

import { useState } from 'react';
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
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

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
        {/* Interactive Map Section */}
        <div className="mb-12">
          <h2 className="font-heading text-2xl text-gray-900 mb-6">Find a Store Near You</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Map with markers - OpenStreetMap with calculated marker positions */}
            {/* Map bounds: lng -75.5 to -69.5 (6° range), lat 39.5 to 43.5 (4° range) */}
            <div className="relative h-[450px] bg-gray-100">
              {/* OpenStreetMap base layer */}
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-75.5%2C39.5%2C-69.5%2C43.5&layer=mapnik"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Store locations map"
              />

              {/* Markers overlay - positions calculated from lat/lng */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Boston Back Bay: 42.351, -71.076 → left: 73.7%, top: 28.7% */}
                <button
                  onClick={() => setSelectedStore(selectedStore === '1' ? null : '1')}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                  style={{ top: '28.7%', left: '73.7%' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedStore === '1' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-brand-navy'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* Boston South End: 42.342, -71.070 → left: 73.8%, top: 29.0% */}
                <button
                  onClick={() => setSelectedStore(selectedStore === '2' ? null : '2')}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                  style={{ top: '29.0%', left: '73.8%' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedStore === '2' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-brand-navy'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* Boston Beacon Hill: 42.358, -71.070 → left: 73.8%, top: 28.6% */}
                <button
                  onClick={() => setSelectedStore(selectedStore === '3' ? null : '3')}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                  style={{ top: '28.6%', left: '73.8%' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedStore === '3' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-brand-navy'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* NYC: 40.758, -73.986 → left: 25.2%, top: 68.6% */}
                <button
                  onClick={() => setSelectedStore(selectedStore === '4' ? null : '4')}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                  style={{ top: '68.6%', left: '25.2%' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedStore === '4' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-gray-500'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* Hamptons: 40.963, -72.185 → left: 55.3%, top: 63.4% */}
                <button
                  onClick={() => setSelectedStore(selectedStore === '5' ? null : '5')}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                  style={{ top: '63.4%', left: '55.3%' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedStore === '5' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-gray-500'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* Newport: 41.490, -71.313 → left: 69.8%, top: 50.3% */}
                <button
                  onClick={() => setSelectedStore(selectedStore === '6' ? null : '6')}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                  style={{ top: '50.3%', left: '69.8%' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedStore === '6' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-gray-500'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 pointer-events-auto z-20">
                  <p className="font-mono text-xs text-gray-600 mb-2 font-medium">Partner Locations</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-brand-navy rounded-full border border-white shadow"></div>
                      <span className="text-xs text-gray-700">Covet Flagship</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-500 rounded-full border border-white shadow"></div>
                      <span className="text-xs text-gray-700">Partner Store</span>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-gray-400 mt-3">Click markers for details</p>
                </div>

                {/* Selected store info overlay */}
                {selectedStore && (
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 w-64 pointer-events-auto z-20">
                    <button
                      onClick={() => setSelectedStore(null)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {partnerStores.filter(s => s.id === selectedStore).map(store => (
                      <div key={store.id}>
                        <div className="flex items-center gap-2 mb-2">
                          {store.isFlagship && (
                            <span className="px-2 py-0.5 bg-brand-navy text-white text-xs rounded">Flagship</span>
                          )}
                        </div>
                        <p className="font-heading text-lg text-gray-900">{store.name}</p>
                        <p className="font-mono text-sm text-gray-500">{store.location.city}, {store.location.state}</p>
                        <p className="font-mono text-sm text-green-600 mt-2">{store.productCount} items available</p>
                        <Link href={`/stores/${store.slug}`} className="block mt-3">
                          <Button size="sm" className="w-full">View Store</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Store quick list */}
            <div className="p-4 border-t border-gray-200 overflow-x-auto">
              <div className="flex gap-3">
                {partnerStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      selectedStore === store.id
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono text-sm whitespace-nowrap">{store.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

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
