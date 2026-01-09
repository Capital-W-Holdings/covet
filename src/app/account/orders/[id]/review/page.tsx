'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Package, Check } from 'lucide-react';
import { Container, Card, Spinner, EmptyState, Button } from '@/components/ui';
import { ReviewForm } from '@/components/review';
import { useAuth } from '@/hooks';
import type { Order } from '@/types';

export default function LeaveReviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push(`/login?redirect=/account/orders/${orderId}/review`);
    return null;
  }

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Order not found"
          description="The order you're looking for doesn't exist."
          action={
            <Link href="/account/orders">
              <Button>Back to Orders</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  if (order.status !== 'DELIVERED') {
    return (
      <Container className="py-16">
        <EmptyState
          title="Cannot review yet"
          description="You can only review orders after they've been delivered."
          action={
            <Link href={`/account/orders/${orderId}`}>
              <Button>View Order</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container className="py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-8">
            Your review has been submitted. It helps other buyers make informed decisions.
          </p>
          <Link href="/account/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 max-w-2xl">
        <Link
          href={`/account/orders/${orderId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Order
        </Link>

        <h1 className="text-2xl font-light text-gray-900 mb-8">Leave a Review</h1>

        {/* Product Card */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {order.item.imageUrl ? (
                <Image
                  src={order.item.imageUrl}
                  alt={order.item.productTitle}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{order.item.productTitle}</h3>
              <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
            </div>
          </div>
        </Card>

        {/* Review Form */}
        <ReviewForm
          orderId={orderId}
          productTitle={order.item.productTitle}
          onSuccess={() => setSubmitted(true)}
          onCancel={() => router.push(`/account/orders/${orderId}`)}
        />
      </Container>
    </div>
  );
}
