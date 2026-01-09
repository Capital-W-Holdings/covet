'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';

const statusColors: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.CONFIRMED]: 'default',
  [OrderStatus.PROCESSING]: 'default',
  [OrderStatus.SHIPPED]: 'success',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
  [OrderStatus.REFUNDED]: 'danger',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();

        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch orders');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="text-gray-500 hover:text-gray-700">
            Account
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Orders</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16" />}
            title="No orders yet"
            description="When you make a purchase, your orders will appear here."
            action={
              <Link href="/shop">
                <Button>Start Shopping</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card hover className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Image */}
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

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-1">
                            {order.item.productTitle}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge variant={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(order.totalCents)}
                      </p>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mt-2 hidden sm:block" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
