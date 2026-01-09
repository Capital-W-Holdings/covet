'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Package, Truck, Check, MapPin } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button, Input, Select } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';

const carrierOptions = [
  { value: 'USPS', label: 'USPS' },
  { value: 'UPS', label: 'UPS' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'DHL', label: 'DHL' },
  { value: 'Other', label: 'Other' },
];

const statusColors: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.CONFIRMED]: 'default',
  [OrderStatus.PROCESSING]: 'default',
  [OrderStatus.SHIPPED]: 'success',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
  [OrderStatus.REFUNDED]: 'danger',
};

export default function StoreOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('UPS');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/store/orders/${orderId}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
          if (data.data.shipping.trackingNumber) {
            setTrackingNumber(data.data.shipping.trackingNumber);
          }
          if (data.data.shipping.carrier) {
            setCarrier(data.data.shipping.carrier);
          }
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const handleShip = async () => {
    if (!trackingNumber) {
      setError('Please enter a tracking number');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/store/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: OrderStatus.SHIPPED,
          trackingNumber,
          carrier,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error?.message || 'Failed to update order');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDelivered = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/store/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: OrderStatus.DELIVERED,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error?.message || 'Failed to update order');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'STORE_ADMIN' && user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/store/orders');
    return null;
  }

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Order not found"
          description="The order you're looking for doesn't exist."
          action={
            <Link href="/store/orders">
              <Button>Back to Orders</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const canShip = order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PROCESSING;
  const canMarkDelivered = order.status === OrderStatus.SHIPPED;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/store/orders"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-light text-gray-900">Order #{order.orderNumber}</h1>
            <Badge variant={statusColors[order.status]}>{order.status}</Badge>
          </div>
          <p className="text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Item</h2>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {order.item.imageUrl ? (
                    <Image
                      src={order.item.imageUrl}
                      alt={order.item.productTitle}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{order.item.productTitle}</h3>
                  <p className="text-sm text-gray-500">SKU: {order.item.productSku}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatPrice(order.item.priceCents)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Shipping Form */}
            {canShip && (
              <Card className="p-6">
                <h2 className="font-medium text-gray-900 mb-4">
                  <Truck className="w-5 h-5 inline-block mr-2" />
                  Ship Order
                </h2>

                <div className="space-y-4">
                  <Select
                    label="Carrier"
                    options={carrierOptions}
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                  />
                  <Input
                    label="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    required
                  />

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleShip}
                    loading={submitting}
                    disabled={!trackingNumber}
                    className="w-full"
                  >
                    Mark as Shipped
                  </Button>
                </div>
              </Card>
            )}

            {/* Tracking Info */}
            {order.shipping.trackingNumber && (
              <Card className="p-6">
                <h2 className="font-medium text-gray-900 mb-4">Tracking Information</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Carrier:</span>{' '}
                    <span className="text-gray-900">{order.shipping.carrier || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Tracking Number:</span>{' '}
                    <span className="text-gray-900 font-mono">{order.shipping.trackingNumber}</span>
                  </p>
                </div>

                {canMarkDelivered && (
                  <Button
                    onClick={handleMarkDelivered}
                    loading={submitting}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900">{formatPrice(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Fee</span>
                  <span className="text-gray-900">-{formatPrice(order.platformFeeCents)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Your Earnings</span>
                  <span className="text-green-600">
                    {formatPrice(order.subtotalCents - order.platformFeeCents)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">
                <MapPin className="w-4 h-4 inline-block mr-2" />
                Ship To
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shipping.address.name}</p>
                <p>{order.shipping.address.street1}</p>
                {order.shipping.address.street2 && <p>{order.shipping.address.street2}</p>}
                <p>
                  {order.shipping.address.city}, {order.shipping.address.state}{' '}
                  {order.shipping.address.postalCode}
                </p>
                <p>{order.shipping.address.country}</p>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Status:</span>{' '}
                  <Badge variant={order.paymentStatus === 'CAPTURED' ? 'success' : 'warning'}>
                    {order.paymentStatus}
                  </Badge>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
