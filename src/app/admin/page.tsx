'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Store, AlertCircle, MessageCircle, BookOpen } from 'lucide-react';
import { Container, Card, Button, Badge, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  totalProducts: number;
  pendingApplications?: number;
  openDisputes?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    router.push('/login?redirect=/admin');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Logged in but not admin - show access denied
  if (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access the admin dashboard.
            Your role: {user.role}
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatPrice(stats.totalRevenue) : '--',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? '--',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders ?? '--',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? '--',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user.profile.name}</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? <Spinner size="sm" /> : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/applications" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Store className="w-4 h-4 mr-3" />
                  Seller Applications
                  {stats?.pendingApplications && stats.pendingApplications > 0 && (
                    <Badge variant="warning" className="ml-auto">
                      {stats.pendingApplications} pending
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/disputes" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-3" />
                  Disputes
                  {stats?.openDisputes && stats.openDisputes > 0 && (
                    <Badge variant="danger" className="ml-auto">
                      {stats.openDisputes} open
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/products" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-3" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/admin/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  View Orders
                </Button>
              </Link>
              <Link href="/admin/products/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  Add New Product
                </Button>
              </Link>
              <Link href="/admin/support" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Support Tickets
                </Button>
              </Link>
              <Link href="/admin/handbook" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-3" />
                  Owner Handbook
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-sm text-gray-500">
              <p className="py-3 border-b border-gray-100">
                Activity feed will appear here
              </p>
              <p className="py-3 border-b border-gray-100">
                Track orders, products, and more
              </p>
              <p className="py-3">
                Real-time updates coming soon
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
