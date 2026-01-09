'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Package, Star, ArrowRight } from 'lucide-react';
import { Container, Card, Button, Spinner, EmptyState, Badge } from '@/components/ui';
import type { Store } from '@/types';
import { StoreType } from '@/types';

interface StoreWithCount extends Store {
  productCount: number;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/stores');
        const data = await res.json();
        if (data.success) {
          setStores(data.data.items);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-charcoal text-white py-16">
        <Container>
          <h1 className="text-3xl lg:text-4xl font-light mb-4">Our Sellers</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Discover authenticated luxury from our network of trusted partner stores.
            Each seller is vetted and verified by the Covet team.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            title="No stores yet"
            description="Partner stores will appear here soon."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link key={store.id} href={`/stores/${store.slug}`}>
                <Card hover className="h-full">
                  {/* Cover Image */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                    {store.branding?.coverUrl && (
                      <Image
                        src={store.branding.coverUrl}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    
                    {/* Type Badge */}
                    {store.type === StoreType.COVET_FLAGSHIP && (
                      <Badge variant="gold" className="absolute top-3 left-3">
                        Covet Flagship
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="relative w-16 h-16 -mt-10 bg-white rounded-lg border-2 border-white shadow-md overflow-hidden flex-shrink-0">
                        {store.branding?.logoUrl ? (
                          <Image
                            src={store.branding.logoUrl}
                            alt={store.name}
                            fill
                            className="object-contain p-2"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-medium">
                            {store.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-medium text-gray-900 truncate">{store.name}</h3>
                        
                        {/* Trust Score */}
                        {store.trustScore && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{store.trustScore}% Trust Score</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {store.branding?.description && (
                      <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                        {store.branding.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Package className="w-4 h-4" />
                        <span>{store.productCount} items</span>
                      </div>

                      {store.contact?.address && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{store.contact.address.city}, {store.contact.address.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* CTA for sellers */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-brand-charcoal text-white">
            <h2 className="text-2xl font-light mb-4">Want to sell on Covet?</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Join our network of trusted luxury sellers. Get access to thousands
              of qualified buyers and the Covet authentication backing.
            </p>
            <Link href="/sell">
              <Button variant="secondary">
                Become a Seller
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </Container>
    </div>
  );
}
