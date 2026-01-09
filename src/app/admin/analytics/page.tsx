'use client';

import { useState, useEffect } from 'react';
import { Container, Card, Button } from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Store, 
  Star,
  AlertTriangle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

// Types
interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface AnalyticsData {
  period: {
    start: string;
    end: string;
    days: number;
  };
  summary: {
    gmv: number;
    gmvChange: number;
    orders: number;
    ordersChange: number;
    aov: number;
    aovChange: number;
    takeRate: number;
    platformRevenue: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
  };
  products: {
    total: number;
    active: number;
    sold: number;
    reserved: number;
    avgDaysToSell: number;
    topCategories: Array<{ category: string; count: number; gmv: number }>;
  };
  stores: {
    total: number;
    active: number;
    pending: number;
    avgTrustScore: number;
    topStores: Array<{ name: string; gmv: number; orders: number }>;
  };
  trustSafety: {
    disputes: {
      total: number;
      open: number;
      resolved: number;
      avgResolutionHours: number;
    };
    reviews: {
      total: number;
      avgRating: number;
      distribution: Record<number, number>;
    };
    authenticationRate: number;
  };
  timeSeries: {
    gmv: TimeSeriesPoint[];
    orders: TimeSeriesPoint[];
  };
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number',
  className 
}: { 
  title: string;
  value: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}) {
  const formattedValue = format === 'currency' 
    ? formatPrice(value * 100)
    : format === 'percent'
    ? `${value.toFixed(1)}%`
    : value.toLocaleString();

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{formattedValue}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change).toFixed(1)}% vs prev period</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </Card>
  );
}

// Simple Bar Chart Component (no external dependencies)
function SimpleBarChart({ 
  data, 
  height = 200 
}: { 
  data: TimeSeriesPoint[];
  height?: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end gap-1 h-full" style={{ height }}>
      {data.map((point, i) => (
        <div
          key={i}
          className="flex-1 bg-brand-gold/80 hover:bg-brand-gold transition-colors rounded-t cursor-pointer group relative"
          style={{ height: `${(point.value / maxValue) * 100}%`, minHeight: 4 }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {point.date}: {point.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Status Badge
function StatusBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', color)}>
        {count}
      </span>
    </div>
  );
}

// Loading Skeleton
function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border h-80">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Error State
function AnalyticsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load analytics</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}

// Main Analytics Page
export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/analytics?days=${days}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch analytics');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <Container className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1">Platform performance and metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md transition-colors',
                      days === d 
                        ? 'bg-white shadow text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        {loading && !data ? (
          <AnalyticsSkeleton />
        ) : error ? (
          <AnalyticsError error={error} onRetry={fetchAnalytics} />
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Gross Merchandise Value"
                value={data.summary.gmv}
                change={data.summary.gmvChange}
                icon={DollarSign}
                format="currency"
              />
              <MetricCard
                title="Orders"
                value={data.summary.orders}
                change={data.summary.ordersChange}
                icon={ShoppingCart}
              />
              <MetricCard
                title="Average Order Value"
                value={data.summary.aov}
                change={data.summary.aovChange}
                icon={TrendingUp}
                format="currency"
              />
              <MetricCard
                title="Platform Revenue"
                value={data.summary.platformRevenue}
                icon={DollarSign}
                format="currency"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* GMV Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">GMV Trend</h3>
                  <span className="text-sm text-gray-500">Last {days} days</span>
                </div>
                <SimpleBarChart data={data.timeSeries.gmv} height={200} />
              </Card>

              {/* Orders Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Orders Trend</h3>
                  <span className="text-sm text-gray-500">Last {days} days</span>
                </div>
                <SimpleBarChart data={data.timeSeries.orders} height={200} />
              </Card>
            </div>

            {/* Details Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Order Status */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Status
                </h3>
                <div className="space-y-1">
                  <StatusBadge count={data.orders.pending} label="Pending" color="bg-yellow-100 text-yellow-800" />
                  <StatusBadge count={data.orders.processing} label="Processing" color="bg-blue-100 text-blue-800" />
                  <StatusBadge count={data.orders.shipped} label="Shipped" color="bg-purple-100 text-purple-800" />
                  <StatusBadge count={data.orders.delivered} label="Delivered" color="bg-green-100 text-green-800" />
                  <StatusBadge count={data.orders.cancelled} label="Cancelled" color="bg-gray-100 text-gray-800" />
                  <StatusBadge count={data.orders.refunded} label="Refunded" color="bg-red-100 text-red-800" />
                </div>
              </Card>

              {/* Product Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Products
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">{data.products.active}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">{data.products.sold}</p>
                    <p className="text-xs text-gray-500">Sold</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Avg. days to sell: <span className="font-medium">{data.products.avgDaysToSell}</span>
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Top Categories</p>
                  {data.products.topCategories.slice(0, 3).map(cat => (
                    <div key={cat.category} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{cat.category}</span>
                      <span className="font-medium">{formatPrice(cat.gmv * 100)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trust & Safety */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Trust & Safety
                </h3>
                <div className="space-y-4">
                  {/* Reviews */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{data.trustSafety.reviews.avgRating}</span>
                      <span className="text-gray-400 text-sm">({data.trustSafety.reviews.total})</span>
                    </div>
                  </div>
                  
                  {/* Authentication */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auth Rate</span>
                    <span className="font-medium text-green-600">{data.trustSafety.authenticationRate}%</span>
                  </div>
                  
                  {/* Disputes */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Open Disputes</span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        data.trustSafety.disputes.open > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      )}>
                        {data.trustSafety.disputes.open}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Avg resolution: {data.trustSafety.disputes.avgResolutionHours}h
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Store Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Overview
                </h3>
                <span className="text-sm text-gray-500">
                  {data.stores.active} active of {data.stores.total} total
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-semibold text-gray-900">{data.stores.total}</p>
                  <p className="text-sm text-gray-500">Total Stores</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold text-green-600">{data.stores.active}</p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold text-yellow-600">{data.stores.pending}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold text-gray-900">{data.stores.avgTrustScore}</p>
                  <p className="text-sm text-gray-500">Avg Trust Score</p>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </Container>
    </div>
  );
}
