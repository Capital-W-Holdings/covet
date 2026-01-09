'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, Truck, Check, MapPin, Star, AlertTriangle } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';

const statusSteps = [
  { status: OrderStatus.CONFIRMED, label: 'Confirmed', icon: Check },
  { status: OrderStatus.PROCESSING, label: 'Processing', icon: Package },
  { status: OrderStatus.SHIPPED, label: 'Shipped', icon: Truck },
  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: MapPin },
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReview, setHasReview] = useState(false);
  const [hasDispute, setHasDispute] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
          
          // Check for existing review
          const reviewRes = await fetch(`/api/reviews`);
          const reviewData = await reviewRes.json();
          if (reviewData.success) {
            const existingReview = reviewData.data.find((r: { orderId: string }) => r.orderId === orderId);
            setHasReview(!!existingReview);
          }
          
          // Check for existing dispute
          const disputeRes = await fetch(`/api/disputes`);
          const disputeData = await disputeRes.json();
          if (disputeData.success) {
            const existingDispute = disputeData.data.find((d: { orderId: string }) => d.orderId === orderId);
            setHasDispute(!!existingDispute);
          }
        } else {
          setError(data.error?.message || 'Order not found');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/account/orders');
    return null;
  }

  if (error || !order) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Order not found"
          description={error || 'The order you\'re looking for doesn\'t exist.'}
          action={
            <Link href="/account/orders">
              <Button>Back to Orders</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);
  const canReview = order.status === OrderStatus.DELIVERED && !hasReview;
  const canDispute = (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) && !hasDispute;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/account" className="text-gray-500 hover:text-gray-700">
            Account
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/account/orders" className="text-gray-500 hover:text-gray-700">
            Orders
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{order.orderNumber}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-medium text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
              </div>

              {/* Status Timeline */}
              {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REFUNDED && (
                <div className="mt-8">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
                    <div
                      className="absolute left-0 top-5 h-0.5 bg-green-500 transition-all"
                      style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />

                    {statusSteps.map((step, index) => {
                      const isComplete = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.status} className="relative flex flex-col items-center z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isComplete
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <step.icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`mt-2 text-xs ${
                              isCurrent ? 'text-green-600 font-medium' : 'text-gray-500'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Product */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Item</h2>
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

            {/* Shipping Info */}
            {order.shipping.trackingNumber && (
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tracking</h2>
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
              </Card>
            )}

            {/* Review/Dispute Actions */}
            {(canReview || canDispute || hasReview || hasDispute) && (
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {canReview && (
                    <Link href={`/account/orders/${orderId}/review`}>
                      <Button className="w-full">
                        <Star className="w-4 h-4 mr-2" />
                        Leave a Review
                      </Button>
                    </Link>
                  )}
                  {hasReview && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      You've already reviewed this order
                    </div>
                  )}
                  {canDispute && (
                    <Link href={`/account/orders/${orderId}/dispute`}>
                      <Button variant="outline" className="w-full">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report an Issue
                      </Button>
                    </Link>
                  )}
                  {hasDispute && (
                    <Link href={`/account/disputes`}>
                      <Button variant="outline" className="w-full">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        View Dispute
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">{formatPrice(order.taxCents)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
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

            {/* Support */}
            <Card className="p-6">
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
                <Link href="/account/orders" className="block">
                  <Button variant="ghost" className="w-full">
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
