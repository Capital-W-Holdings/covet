'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Star, Shield, ArrowRight } from 'lucide-react';
import { Container, Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Store, Product } from '@/types';
import { StoreType } from '@/types';

interface StoreWithProducts extends Store {
  productCount: number;
}

export default function StoreProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [store, setStore] = useState<StoreWithProducts | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/stores/${slug}`);
        const data = await res.json();

        if (data.success) {
          setStore(data.data.store);
          setProducts(data.data.products);
        } else {
          setError('Store not found');
        }
      } catch {
        setError('Failed to load store');
      } finally {
        setLoading(false);
      }
    }

    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Store not found"
          description="The store you're looking for doesn't exist."
          action={
            <Link href="/stores">
              <Button>Browse All Stores</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="relative h-48 lg:h-64 bg-gradient-to-br from-gray-200 to-gray-300">
        {store.branding?.coverUrl && (
          <Image
            src={store.branding.coverUrl}
            alt={store.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Store Header */}
      <Container className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-16 lg:-mt-20 pb-8 border-b border-gray-200">
          {/* Logo */}
          <div className="relative w-32 h-32 bg-white rounded-xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
            {store.branding?.logoUrl ? (
              <Image
                src={store.branding.logoUrl}
                alt={store.name}
                fill
                className="object-contain p-4"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl font-medium text-gray-400">
                {store.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-light text-gray-900">
                {store.name}
              </h1>
              {store.type === StoreType.COVET_FLAGSHIP && (
                <Badge variant="gold">
                  <Shield className="w-3 h-3 mr-1" />
                  Covet Flagship
                </Badge>
              )}
            </div>

            {store.branding?.tagline && (
              <p className="text-gray-600 mb-3">{store.branding.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {store.trustScore && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{store.trustScore}% Trust Score</span>
                </div>
              )}
              <span>{store.productCount} items</span>
              {store.contact?.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {store.contact.address.city}, {store.contact.address.state}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex gap-3">
            {store.contact?.email && (
              <a href={`mailto:${store.contact.email}`}>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </a>
            )}
          </div>
        </div>
      </Container>

      {/* Content */}
      <Container className="py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">About</h2>
              {store.branding?.description && (
                <p className="text-sm text-gray-600 mb-6">
                  {store.branding.description}
                </p>
              )}

              {store.contact && (
                <div className="space-y-3 text-sm">
                  {store.contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p>{store.contact.address.street1}</p>
                        {store.contact.address.street2 && (
                          <p>{store.contact.address.street2}</p>
                        )}
                        <p>
                          {store.contact.address.city}, {store.contact.address.state}{' '}
                          {store.contact.address.postalCode}
                        </p>
                      </div>
                    </div>
                  )}
                  {store.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${store.contact.phone}`}
                        className="text-brand-gold hover:underline"
                      >
                        {store.contact.phone}
                      </a>
                    </div>
                  )}
                  {store.contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${store.contact.email}`}
                        className="text-brand-gold hover:underline"
                      >
                        {store.contact.email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </aside>

          {/* Products */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-gray-900">Products</h2>
              <Link href={`/shop?store=${store.slug}`}>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <ProductGrid
              products={products}
              columns={3}
              emptyMessage="No products available yet"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
