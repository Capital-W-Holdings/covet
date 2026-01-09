'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Eye, ShoppingCart, TrendingUp, Star, Tag } from 'lucide-react';
import { Container, Card, Spinner, Select, Badge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';

interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  views: number;
  sales: number;
  revenue: number;
  category: string;
  stock: number;
  rating: number;
}

interface CategoryData {
  name: string;
  count: number;
  revenue: number;
  color: string;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalViews: number;
  conversionRate: number;
  avgPrice: number;
  topProducts: ProductData[];
  categoryBreakdown: CategoryData[];
}

// Generate mock data for demonstration
function generateMockData(): ProductStats {
  const categories = [
    { name: 'Handbags', color: '#ec4899' },
    { name: 'Jewelry', color: '#f59e0b' },
    { name: 'Watches', color: '#3b82f6' },
    { name: 'Shoes', color: '#22c55e' },
    { name: 'Accessories', color: '#8b5cf6' },
  ];

  const products: ProductData[] = [
    { id: '1', name: 'Chanel Classic Flap', sku: 'CHN-001', price: 4500, views: 1250, sales: 12, revenue: 54000, category: 'Handbags', stock: 3, rating: 4.9 },
    { id: '2', name: 'Hermès Birkin 25', sku: 'HRM-001', price: 12000, views: 890, sales: 4, revenue: 48000, category: 'Handbags', stock: 1, rating: 5.0 },
    { id: '3', name: 'Cartier Love Bracelet', sku: 'CRT-001', price: 6750, views: 750, sales: 6, revenue: 40500, category: 'Jewelry', stock: 5, rating: 4.8 },
    { id: '4', name: 'Rolex Submariner', sku: 'RLX-001', price: 14500, views: 620, sales: 2, revenue: 29000, category: 'Watches', stock: 2, rating: 4.9 },
    { id: '5', name: 'Louis Vuitton Neverfull', sku: 'LV-001', price: 1850, views: 1800, sales: 15, revenue: 27750, category: 'Handbags', stock: 8, rating: 4.7 },
    { id: '6', name: 'Christian Louboutin Heels', sku: 'CLB-001', price: 895, views: 980, sales: 22, revenue: 19690, category: 'Shoes', stock: 6, rating: 4.6 },
    { id: '7', name: 'Van Cleef Alhambra', sku: 'VCA-001', price: 4250, views: 420, sales: 4, revenue: 17000, category: 'Jewelry', stock: 3, rating: 4.9 },
    { id: '8', name: 'Gucci Belt', sku: 'GUC-001', price: 450, views: 1500, sales: 35, revenue: 15750, category: 'Accessories', stock: 12, rating: 4.5 },
  ];

  const categoryBreakdown = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat.name);
    return {
      name: cat.name,
      count: catProducts.length,
      revenue: catProducts.reduce((sum, p) => sum + p.revenue, 0),
      color: cat.color,
    };
  }).filter(c => c.count > 0);

  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);

  return {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalViews,
    conversionRate: totalViews > 0 ? (totalSales / totalViews) * 100 : 0,
    avgPrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
    topProducts: products.sort((a, b) => b.revenue - a.revenue),
    categoryBreakdown: categoryBreakdown.sort((a, b) => b.revenue - a.revenue),
  };
}

// Horizontal bar chart component
function HorizontalBarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{item.label}</span>
            <span className="font-medium text-gray-900">{formatPrice(item.value)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#3b82f6',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Pie chart component
function PieChart({ data }: { data: CategoryData[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return null;

  const radius = 40;
  let currentAngle = -90;

  return (
    <div className="flex items-center justify-center gap-6">
      <svg width="120" height="120" viewBox="0 0 100 100">
        {data.map((segment, i) => {
          const percentage = segment.count / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + radius * Math.cos(startRad);
          const y1 = 50 + radius * Math.sin(startRad);
          const x2 = 50 + radius * Math.cos(endRad);
          const y2 = 50 + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          const pathData = `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={i}
              d={pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((segment, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-gray-600">{segment.name}</span>
            <span className="font-medium text-gray-900">{segment.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const sortOptions = [
  { value: 'revenue', label: 'By Revenue' },
  { value: 'views', label: 'By Views' },
  { value: 'sales', label: 'By Sales' },
  { value: 'rating', label: 'By Rating' },
];

export default function ProductsAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sortBy, setSortBy] = useState('revenue');
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => {
        setStats(generateMockData());
        setLoading(false);
      }, 500);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/analytics/products');
    return null;
  }

  const sortedProducts = stats?.topProducts?.slice().sort((a, b) => {
    switch (sortBy) {
      case 'views': return b.views - a.views;
      case 'sales': return b.sales - a.sales;
      case 'rating': return b.rating - a.rating;
      default: return b.revenue - a.revenue;
    }
  });

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
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Product Analytics</h1>
            <p className="text-gray-500">Track product performance and inventory</p>
          </div>
          <Link href="/admin/products/new">
            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
              + Add Product
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Products</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.activeProducts}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Package className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Out of Stock</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.outOfStock}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Views</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversion</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Tag className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Price</p>
                    <p className="text-xl font-semibold text-gray-900">{formatPrice(stats.avgPrice)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h2>
                <HorizontalBarChart
                  data={stats.categoryBreakdown.map(c => ({
                    label: c.name,
                    value: c.revenue,
                    color: c.color,
                  }))}
                  maxValue={Math.max(...stats.categoryBreakdown.map(c => c.revenue))}
                />
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Products by Category</h2>
                <div className="h-48 flex items-center justify-center">
                  <PieChart data={stats.categoryBreakdown} />
                </div>
              </Card>
            </div>

            {/* Top Products Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Product Performance</h2>
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Views</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Sales</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Stock</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts?.map((product) => (
                      <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.sku}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {product.views.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {product.sales}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatPrice(product.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {product.stock === 0 ? (
                            <Badge variant="danger">Out</Badge>
                          ) : product.stock < 3 ? (
                            <Badge variant="warning">{product.stock}</Badge>
                          ) : (
                            <span className="text-gray-600">{product.stock}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-gray-900">{product.rating}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <Link href="/admin/products">
                <Card hover className="p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Manage All Products</span>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/products/new">
                <Card hover className="p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Add New Product</span>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/analytics/revenue">
                <Card hover className="p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">View Revenue Analytics</span>
                  </div>
                </Card>
              </Link>
            </div>
          </>
        ) : null}
      </Container>
    </div>
  );
}
