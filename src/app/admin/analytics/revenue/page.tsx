'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Container, Card, Spinner, Select } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueStats {
  totalRevenue: number;
  averageOrderValue: number;
  revenueGrowth: number;
  topSellingDay: string;
  dailyData: RevenueData[];
}

// Generate mock data for demonstration
function generateMockData(period: string): RevenueStats {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const dailyData: RevenueData[] = [];
  let totalRevenue = 0;
  let totalOrders = 0;
  let topDay = { date: '', revenue: 0 };

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Generate realistic-looking data with some variance
    const baseRevenue = Math.random() * 500 + 100;
    const weekendBoost = [0, 6].includes(date.getDay()) ? 1.5 : 1;
    const revenue = Math.round(baseRevenue * weekendBoost * 100) / 100;
    const orders = Math.floor(revenue / 75) + Math.floor(Math.random() * 3);

    dailyData.push({ date: dateStr, revenue, orders });
    totalRevenue += revenue;
    totalOrders += orders;

    if (revenue > topDay.revenue) {
      topDay = { date: dateStr, revenue };
    }
  }

  // Calculate growth (compare first half to second half)
  const midpoint = Math.floor(dailyData.length / 2);
  const firstHalf = dailyData.slice(0, midpoint).reduce((sum, d) => sum + d.revenue, 0);
  const secondHalf = dailyData.slice(midpoint).reduce((sum, d) => sum + d.revenue, 0);
  const revenueGrowth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

  return {
    totalRevenue,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    topSellingDay: topDay.date,
    dailyData,
  };
}

// Simple SVG line chart component
function LineChart({ data, height = 200 }: { data: RevenueData[]; height?: number }) {
  if (data.length === 0) return null;

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const range = maxRevenue - minRevenue || 1;

  const width = 100;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.revenue - minRevenue) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(percent => (
        <line
          key={percent}
          x1={padding}
          y1={padding + (chartHeight * percent) / 100}
          x2={padding + chartWidth}
          y2={padding + (chartHeight * percent) / 100}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}

      {/* Area fill */}
      <polygon points={areaPoints} fill="url(#gradient)" opacity="0.3" />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Bar chart component
function BarChart({ data, height = 200 }: { data: RevenueData[]; height?: number }) {
  if (data.length === 0) return null;

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="flex items-end justify-between gap-1 h-full" style={{ height }}>
      {data.map((d, i) => {
        const barHeight = (d.revenue / maxRevenue) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
              style={{ height: `${barHeight}%`, minHeight: '4px' }}
              title={`${d.date}: ${formatPrice(d.revenue)}`}
            />
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

const periodOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

export default function RevenueAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Simulate API call
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
    router.push('/login?redirect=/admin/analytics/revenue');
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
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-500">Track your earnings and sales performance</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {formatPrice(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Order Value</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {formatPrice(stats.averageOrderValue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Growth Rate</p>
                    <p className={`text-2xl font-semibold mt-1 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stats.revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Best Day</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats.topSellingDay}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h2>
                <div className="h-64">
                  <LineChart data={stats.dailyData} height={256} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{stats.dailyData[0]?.date}</span>
                  <span>{stats.dailyData[stats.dailyData.length - 1]?.date}</span>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Revenue</h2>
                <div className="h-64">
                  <BarChart data={stats.dailyData.slice(-14)} height={256} />
                </div>
              </Card>
            </div>

            {/* Daily Breakdown Table */}
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Orders</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dailyData.slice(-10).reverse().map((day, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{day.date}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatPrice(day.revenue)}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{day.orders}</td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {day.orders > 0 ? formatPrice(day.revenue / day.orders) : '--'}
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
