'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Eye, ArrowRight, Settings, AlertCircle } from 'lucide-react';
import { Container, Card, Button, Badge, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import type { Store } from '@/types';
import type { StoreStats, StorePayout } from '@/types/store';

interface DashboardData {
  store: Store;
  stats: StoreStats;
  payouts: StorePayout[];
}

export default function StoreDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputeCount, setDisputeCount] = useState(0);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/store/dashboard');
        const result = await res.json();

        if (result.success) {
          setData(result.data);
          
          // Fetch dispute count
          const disputeRes = await fetch('/api/disputes');
          const disputeData = await disputeRes.json();
          if (disputeData.success) {
            const openDisputes = disputeData.data.filter(
              (d: { status: string }) => d.status === 'OPEN' || d.status === 'SELLER_RESPONSE'
            );
            setDisputeCount(openDisputes.length);
          }
        } else {
          setError(result.error?.message || 'Failed to load dashboard');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'STORE_ADMIN' && user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/store');
    return null;
  }

  if (error || !data) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">No Store Found</h1>
          <p className="text-gray-600 mb-8">{error || 'You don\'t have a store yet.'}</p>
          <Link href="/sell">
            <Button>Apply to Sell</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const { store, stats, payouts } = data;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">{store.name}</h1>
            <p className="text-gray-500">Store Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link href="/store/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link href="/store/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Alert for disputes */}
        {disputeCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">
                You have {disputeCount} open dispute{disputeCount !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
            <Link href="/store/disputes">
              <Button size="sm" variant="outline">View Disputes</Button>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/store/products" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-3" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/store/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  View Orders
                  {stats.pendingOrders > 0 && (
                    <Badge variant="warning" className="ml-auto">
                      {stats.pendingOrders} pending
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/store/products/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  Add New Product
                </Button>
              </Link>
              <Link href={`/stores/${store.slug}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-3" />
                  View Public Store Page
                </Button>
              </Link>
            </div>
          </Card>

          {/* Performance */}
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Products Listed</span>
                <span className="font-medium text-gray-900">{stats.totalProducts}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Products Sold</span>
                <span className="font-medium text-gray-900">{stats.soldProducts}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="font-medium text-gray-900">{formatPrice(stats.averageOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-medium text-gray-900">{stats.conversionRate}%</span>
              </div>
            </div>
          </Card>

          {/* Recent Payouts */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Payouts</h2>
              <Link href="/store/payouts">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {payouts.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No payouts yet. Payouts are processed weekly.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Period</th>
                      <th className="pb-3 font-medium">Orders</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b border-gray-50">
                        <td className="py-3">
                          {new Date(payout.periodStart).toLocaleDateString()} -{' '}
                          {new Date(payout.periodEnd).toLocaleDateString()}
                        </td>
                        <td className="py-3">{payout.orderCount}</td>
                        <td className="py-3 font-medium">{formatPrice(payout.amount)}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                              payout.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : payout.status === 'PROCESSING'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </Container>
    </div>
  );
}
