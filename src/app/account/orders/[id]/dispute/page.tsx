'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Package, AlertTriangle } from 'lucide-react';
import { Container, Card, Spinner, EmptyState, Button, Select, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks';
import type { Order } from '@/types';
import { DisputeReason } from '@/types/review';

const reasonOptions = [
  { value: DisputeReason.NOT_AS_DESCRIBED, label: 'Item Not as Described' },
  { value: DisputeReason.AUTHENTICATION_CONCERN, label: 'Authentication Concern' },
  { value: DisputeReason.DAMAGED_IN_SHIPPING, label: 'Damaged in Shipping' },
  { value: DisputeReason.NOT_RECEIVED, label: 'Item Not Received' },
  { value: DisputeReason.WRONG_ITEM, label: 'Wrong Item Received' },
  { value: DisputeReason.OTHER, label: 'Other' },
];

export default function OpenDisputePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reason, setReason] = useState<DisputeReason>(DisputeReason.NOT_AS_DESCRIBED);
  const [description, setDescription] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 20) {
      setError('Please provide at least 20 characters of description');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason,
          description,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/account/disputes/${data.data.id}`);
      } else {
        setError(data.error?.message || 'Failed to open dispute');
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

  if (!user) {
    router.push(`/login?redirect=/account/orders/${orderId}/dispute`);
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

  const canDispute = order.status === 'SHIPPED' || order.status === 'DELIVERED';

  if (!canDispute) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Cannot open dispute"
          description="You can only dispute orders that have been shipped or delivered."
          action={
            <Link href={`/account/orders/${orderId}`}>
              <Button>View Order</Button>
            </Link>
          }
        />
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

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-gray-900">Open a Dispute</h1>
            <p className="text-gray-500">Order #{order.orderNumber}</p>
          </div>
        </div>

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
              <p className="text-sm text-gray-500">SKU: {order.item.productSku}</p>
            </div>
          </div>
        </Card>

        {/* Dispute Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">Before You Open a Dispute</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Make sure you've tried contacting the seller first</li>
                <li>• Provide as much detail as possible about the issue</li>
                <li>• Include photos or evidence if relevant</li>
                <li>• Disputes are typically resolved within 72 hours</li>
              </ul>
            </div>

            <Select
              label="Reason for Dispute"
              options={reasonOptions}
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
            />

            <Textarea
              label="Describe the Issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Please provide a detailed description of the problem. Include any relevant details like condition issues, discrepancies from the listing, or shipping damage..."
              helperText={`${description.length}/2000 characters (minimum 20)`}
              required
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Link href={`/account/orders/${orderId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                loading={submitting}
                disabled={description.length < 20}
                className="flex-1"
              >
                Submit Dispute
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  );
}
