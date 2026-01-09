'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, ShoppingCart } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice, formatDateTime } from '@/lib/utils';
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

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();

        if (data.success) {
          setOrders(data.data);
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'STORE_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/orders');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Orders</h1>
          <p className="text-gray-500">{orders.length} orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-16 h-16" />}
            title="No orders yet"
            description="Orders will appear here when customers make purchases."
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}>
                <Card hover className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {order.item.imageUrl ? (
                        <Image
                          src={order.item.imageUrl}
                          alt={order.item.productTitle}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">#{order.orderNumber}</h3>
                        <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{order.item.productTitle}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                    </div>

                    {/* Price & Arrow */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(order.totalCents)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.paymentStatus}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
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
