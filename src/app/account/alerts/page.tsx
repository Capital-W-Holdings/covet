'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, BellOff, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Container, Card, Button } from '@/components/ui';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, cn } from '@/lib/utils';

export default function PriceAlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const { alerts, loading, error, deleteAlert } = usePriceAlerts();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    await deleteAlert(productId);
    setDeletingId(null);
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <Container className="py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Sign in to view your price alerts
          </h1>
          <p className="text-gray-500 mb-6">
            Create an account to set price alerts and get notified when items drop in price.
          </p>
          <Link href="/login?redirect=/account/alerts">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  // Loading
  if (loading || authLoading) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      </Container>
    );
  }

  // Error
  if (error) {
    return (
      <Container className="py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Unable to load price alerts
          </h1>
          <p className="text-gray-500">{error}</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Price Alerts</h1>
          <p className="text-gray-500 mt-1">
            {alerts.length === 0
              ? "You haven't set any price alerts yet"
              : `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/browse">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            No price alerts yet
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Set price alerts on items you're interested in and we'll notify you
            when the price drops to your target.
          </p>
          <Link href="/browse">
            <Button variant="primary">Start Shopping</Button>
          </Link>
        </Card>
      )}

      {/* Alerts List */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const priceDrop = alert.product.priceCents - alert.targetPriceCents;
            const priceDropPercent = Math.round(
              (priceDrop / alert.product.priceCents) * 100
            );
            const isDeleting = deletingId === alert.productId;

            return (
              <Card
                key={alert.id}
                className={cn(
                  'p-4 transition-opacity',
                  isDeleting && 'opacity-50'
                )}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${alert.product.sku}`}
                    className="flex-shrink-0"
                  >
                    {alert.product.images[0] ? (
                      <Image
                        src={alert.product.images[0].url}
                        alt={alert.product.images[0].alt}
                        width={100}
                        height={100}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${alert.product.sku}`}>
                      <p className="text-xs text-brand-gold font-medium uppercase mb-1">
                        {alert.product.brand}
                      </p>
                      <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-brand-gold transition-colors">
                        {alert.product.title}
                      </h3>
                    </Link>

                    {/* Prices */}
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(alert.product.priceCents)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Current price
                      </span>
                    </div>

                    {/* Alert Target */}
                    <div className="flex items-center gap-2 mt-2">
                      <Bell className="w-4 h-4 text-brand-gold" />
                      <span className="text-sm font-medium text-brand-gold">
                        Alert at {formatPrice(alert.targetPriceCents)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({priceDropPercent}% off)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/products/${alert.product.sku}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(alert.productId)}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info */}
      <Card className="mt-8 p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How price alerts work</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>We check prices daily for all your watched items</li>
              <li>You'll receive an email when a price drops to your target</li>
              <li>Alerts are automatically removed after you're notified</li>
              <li>You can have up to 20 active price alerts</li>
            </ul>
          </div>
        </div>
      </Card>
    </Container>
  );
}
