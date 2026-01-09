'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { Container, Card, Spinner, Select, Badge } from '@/components/ui';
import { useAuth } from '@/hooks';

interface OrderData {
  date: string;
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  avgFulfillmentTime: number;
  dailyData: OrderData[];
}

// Generate mock data for demonstration
function generateMockData(period: string): OrderStats {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const dailyData: OrderData[] = [];
  let totalOrders = 0;
  let pendingOrders = 0;
  let processingOrders = 0;
  let shippedOrders = 0;
  let deliveredOrders = 0;
  let cancelledOrders = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const total = Math.floor(Math.random() * 8) + 2;
    const pending = i < 3 ? Math.floor(Math.random() * 2) : 0;
    const processing = i < 5 ? Math.floor(Math.random() * 2) : 0;
    const cancelled = Math.random() > 0.85 ? 1 : 0;
    const remaining = total - pending - processing - cancelled;
    const shipped = i < 7 ? Math.floor(remaining * 0.3) : 0;
    const delivered = remaining - shipped;

    dailyData.push({ date: dateStr, total, pending, processing, shipped, delivered, cancelled });
    totalOrders += total;
    pendingOrders += pending;
    processingOrders += processing;
    shippedOrders += shipped;
    deliveredOrders += delivered;
    cancelledOrders += cancelled;
  }

  const fulfillmentRate = totalOrders > 0
    ? ((deliveredOrders + shippedOrders) / (totalOrders - cancelledOrders)) * 100
    : 0;

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    fulfillmentRate: Math.round(fulfillmentRate * 10) / 10,
    avgFulfillmentTime: Math.round((Math.random() * 2 + 1.5) * 10) / 10,
    dailyData,
  };
}

// Stacked bar chart component
function StackedBarChart({ data, height = 200 }: { data: OrderData[]; height?: number }) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <div className="flex items-end justify-between gap-1 h-full" style={{ height }}>
      {data.map((d, i) => {
        const totalHeight = (d.total / maxTotal) * 100;
        const deliveredHeight = (d.delivered / d.total) * totalHeight;
        const shippedHeight = (d.shipped / d.total) * totalHeight;
        const processingHeight = (d.processing / d.total) * totalHeight;
        const pendingHeight = (d.pending / d.total) * totalHeight;
        const cancelledHeight = (d.cancelled / d.total) * totalHeight;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full flex flex-col-reverse rounded-t overflow-hidden"
              style={{ height: `${totalHeight}%`, minHeight: '4px' }}
              title={`${d.date}: ${d.total} orders`}
            >
              {d.delivered > 0 && (
                <div className="w-full bg-green-500" style={{ height: `${deliveredHeight}%` }} />
              )}
              {d.shipped > 0 && (
                <div className="w-full bg-blue-500" style={{ height: `${shippedHeight}%` }} />
              )}
              {d.processing > 0 && (
                <div className="w-full bg-purple-500" style={{ height: `${processingHeight}%` }} />
              )}
              {d.pending > 0 && (
                <div className="w-full bg-amber-500" style={{ height: `${pendingHeight}%` }} />
              )}
              {d.cancelled > 0 && (
                <div className="w-full bg-red-400" style={{ height: `${cancelledHeight}%` }} />
              )}
            </div>
            {data.length <= 14 && (
              <span className="text-[10px] text-gray-400 truncate w-full text-center">
                {d.date.split(' ')[1]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Donut chart component
function DonutChart({ stats }: { stats: OrderStats }) {
  const total = stats.totalOrders;
  if (total === 0) return null;

  const segments = [
    { label: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
    { label: 'Shipped', value: stats.shippedOrders, color: '#3b82f6' },
    { label: 'Processing', value: stats.processingOrders, color: '#a855f7' },
    { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
    { label: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' },
  ].filter(s => s.value > 0);

  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="flex items-center justify-center gap-8">
      <svg width="120" height="120" viewBox="0 0 100 100">
        {segments.map((segment, i) => {
          const percentage = segment.value / total;
          const dashLength = percentage * circumference;
          const dashOffset = -currentOffset;
          currentOffset += dashLength;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
            />
          );
        })}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-lg font-semibold fill-gray-900">
          {total}
        </text>
        <text x="50" y="62" textAnchor="middle" className="text-[8px] fill-gray-500">
          orders
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-gray-600">{segment.label}</span>
            <span className="font-medium text-gray-900">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const periodOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

const statusColors = {
  pending: 'warning',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'danger',
} as const;

function OrdersAnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  const filterParam = searchParams.get('filter');

  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => {
        setStats(generateMockData(period));
        setLoading(false);
      }, 500);
    }
  }, [user, period]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/analytics/orders');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">
              {filterParam === 'pending' ? 'Pending Orders' : 'Orders Analytics'}
            </h1>
            <p className="text-gray-500">
              {filterParam === 'pending'
                ? 'Orders awaiting processing'
                : 'Track order volume and fulfillment metrics'}
            </p>
          </div>
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className={`p-4 ${filterParam === 'pending' ? 'ring-2 ring-amber-500' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Processing</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.processingOrders}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipped</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.shippedOrders}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivered</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.deliveredOrders}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cancelled</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.cancelledOrders}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Metrics */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-green-600">{stats.fulfillmentRate}%</p>
                <p className="text-gray-500 mt-1">Fulfillment Rate</p>
              </Card>
              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.avgFulfillmentTime}</p>
                <p className="text-gray-500 mt-1">Avg Days to Ship</p>
              </Card>
              <Card className="p-6 text-center">
                <p className="text-4xl font-bold text-purple-600">
                  {Math.round((stats.totalOrders / stats.dailyData.length) * 10) / 10}
                </p>
                <p className="text-gray-500 mt-1">Orders per Day</p>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h2>
                <div className="h-48 flex items-center justify-center">
                  <DonutChart stats={stats} />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Orders by Status</h2>
                <div className="h-48">
                  <StackedBarChart data={stats.dailyData.slice(-14)} height={192} />
                </div>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span>Shipped</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded bg-purple-500" />
                    <span>Processing</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span>Pending</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Daily Breakdown Table */}
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Pending</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Processing</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Shipped</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Delivered</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Cancelled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dailyData.slice(-10).reverse().map((day, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{day.date}</td>
                        <td className="py-3 px-4 text-center font-medium text-gray-900">{day.total}</td>
                        <td className="py-3 px-4 text-center">
                          {day.pending > 0 ? (
                            <Badge variant="warning">{day.pending}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {day.processing > 0 ? (
                            <Badge variant="default">{day.processing}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {day.shipped > 0 ? (
                            <Badge variant="default">{day.shipped}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {day.delivered > 0 ? (
                            <Badge variant="success">{day.delivered}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {day.cancelled > 0 ? (
                            <Badge variant="danger">{day.cancelled}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : null}
      </Container>
    </div>
  );
}

export default function OrdersAnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <OrdersAnalyticsContent />
    </Suspense>
  );
}
