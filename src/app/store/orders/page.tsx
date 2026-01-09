'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, ShoppingCart, Truck } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button, Select, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: OrderStatus.PENDING, label: 'Pending' },
  { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
  { value: OrderStatus.PROCESSING, label: 'Processing' },
  { value: OrderStatus.SHIPPED, label: 'Shipped' },
  { value: OrderStatus.DELIVERED, label: 'Delivered' },
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

export default function StoreOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set('status', status);

        const res = await fetch(`/api/store/orders?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user, status]);

  if (authLoading) {
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

  const needsAction = orders.filter(
    (o) => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PROCESSING
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/store" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Orders</h1>
              <p className="text-gray-500">{orders.length} orders</p>
            </div>
            {needsAction > 0 && (
              <Badge variant="warning">{needsAction} need action</Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-48"
          />
        </Card>

        {/* Orders List */}
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
              <Card key={order.id} className="p-4">
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

                  {/* Price & Action */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(order.totalCents)}
                      </p>
                    </div>

                    {(order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PROCESSING) && (
                      <Link href={`/store/orders/${order.id}`}>
                        <Button size="sm">
                          <Truck className="w-4 h-4 mr-1" />
                          Ship
                        </Button>
                      </Link>
                    )}

                    <Link href={`/store/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
