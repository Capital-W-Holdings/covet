/**
 * Admin Analytics API
 * 
 * Provides comprehensive platform metrics for the admin dashboard.
 * Includes business, trust/safety, and product metrics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { database, isDatabasePrisma } from '@/lib/database';
import { verifySession } from '@/lib/auth';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface AnalyticsResponse {
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const session = await verifySession(request);
    if (!session) {
      throw new UnauthorizedError();
    }
    if (session.role !== 'COVET_ADMIN' && session.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Admin access required');
    }

    // Parse query params
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Previous period for comparison
    const prevEndDate = startDate;
    const prevStartDate = new Date(prevEndDate.getTime() - days * 24 * 60 * 60 * 1000);

    const analytics = await getAnalytics(startDate, endDate, prevStartDate, prevEndDate);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getAnalytics(
  startDate: Date,
  endDate: Date,
  prevStartDate: Date,
  prevEndDate: Date
): Promise<AnalyticsResponse> {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

  if (isDatabasePrisma) {
    return getPrismaAnalytics(startDate, endDate, prevStartDate, prevEndDate, days);
  }

  return getInMemoryAnalytics(startDate, endDate, days);
}

async function getPrismaAnalytics(
  startDate: Date,
  endDate: Date,
  prevStartDate: Date,
  prevEndDate: Date,
  days: number
): Promise<AnalyticsResponse> {
  // Placeholder for Prisma queries
  // In production, these would be actual database aggregations
  
  logger.info('Generating analytics with Prisma', { startDate, endDate });

  // This would be replaced with actual Prisma queries like:
  // const orderStats = await prisma.order.aggregate({...})
  // const productStats = await prisma.product.groupBy({...})
  
  return getInMemoryAnalytics(startDate, endDate, days);
}

async function getInMemoryAnalytics(
  startDate: Date,
  endDate: Date,
  days: number
): Promise<AnalyticsResponse> {
  const db = database as {
    getOrders?: () => Array<{
      status: string;
      totalCents: number;
      platformFeeCents: number;
      createdAt: Date;
    }>;
    getProducts?: () => Array<{
      status: string;
      category: string;
      priceCents: number;
    }>;
    getStores?: () => Array<{
      status: string;
      trustScore: number;
      name: string;
    }>;
    getReviews?: () => Array<{
      rating: number;
    }>;
    getDisputes?: () => Array<{
      status: string;
      createdAt: Date;
      resolvedAt?: Date;
    }>;
  };

  // Get data
  const orders = db.getOrders?.() || [];
  const products = db.getProducts?.() || [];
  const stores = db.getStores?.() || [];
  const reviews = db.getReviews?.() || [];
  const disputes = db.getDisputes?.() || [];

  // Filter orders in period
  const periodOrders = orders.filter(o => {
    const created = new Date(o.createdAt);
    return created >= startDate && created <= endDate;
  });

  // Calculate metrics
  const gmv = periodOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100;
  const platformRevenue = periodOrders.reduce((sum, o) => sum + o.platformFeeCents, 0) / 100;
  const orderCount = periodOrders.length;
  const aov = orderCount > 0 ? gmv / orderCount : 0;
  const takeRate = gmv > 0 ? (platformRevenue / gmv) * 100 : 0;

  // Order status breakdown
  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Product stats
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  const soldProducts = products.filter(p => p.status === 'SOLD').length;
  const reservedProducts = products.filter(p => p.status === 'RESERVED').length;

  // Category breakdown
  const categoryStats = products.reduce((acc, p) => {
    if (!acc[p.category]) {
      acc[p.category] = { count: 0, gmv: 0 };
    }
    acc[p.category].count++;
    if (p.status === 'SOLD') {
      acc[p.category].gmv += p.priceCents / 100;
    }
    return acc;
  }, {} as Record<string, { count: number; gmv: number }>);

  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 5);

  // Store stats
  const activeStores = stores.filter(s => s.status === 'ACTIVE');
  const avgTrustScore = activeStores.length > 0
    ? activeStores.reduce((sum, s) => sum + s.trustScore, 0) / activeStores.length
    : 0;

  // Review stats
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  
  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Dispute stats
  const openDisputes = disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
  const resolvedDisputes = disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED');
  
  const avgResolutionHours = resolvedDisputes.length > 0
    ? resolvedDisputes.reduce((sum, d) => {
        if (d.resolvedAt) {
          return sum + (new Date(d.resolvedAt).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0) / resolvedDisputes.length
    : 0;

  // Generate time series (mock data for demo)
  const timeSeries = {
    gmv: generateTimeSeries(startDate, days, gmv / days),
    orders: generateTimeSeries(startDate, days, orderCount / days),
  };

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days,
    },
    summary: {
      gmv,
      gmvChange: 12.5, // Mock change percentage
      orders: orderCount,
      ordersChange: 8.3,
      aov,
      aovChange: 3.2,
      takeRate,
      platformRevenue,
    },
    orders: {
      total: orders.length,
      pending: ordersByStatus['PENDING'] || 0,
      processing: ordersByStatus['PROCESSING'] || 0,
      shipped: ordersByStatus['SHIPPED'] || 0,
      delivered: ordersByStatus['DELIVERED'] || 0,
      cancelled: ordersByStatus['CANCELLED'] || 0,
      refunded: ordersByStatus['REFUNDED'] || 0,
    },
    products: {
      total: products.length,
      active: activeProducts,
      sold: soldProducts,
      reserved: reservedProducts,
      avgDaysToSell: 14.5, // Mock average
      topCategories,
    },
    stores: {
      total: stores.length,
      active: activeStores.length,
      pending: stores.filter(s => s.status === 'PENDING').length,
      avgTrustScore: Math.round(avgTrustScore),
      topStores: activeStores
        .slice(0, 5)
        .map(s => ({ name: s.name, gmv: 0, orders: 0 })),
    },
    trustSafety: {
      disputes: {
        total: disputes.length,
        open: openDisputes.length,
        resolved: resolvedDisputes.length,
        avgResolutionHours: Math.round(avgResolutionHours),
      },
      reviews: {
        total: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10,
        distribution: ratingDistribution,
      },
      authenticationRate: 98.5, // Mock rate
    },
    timeSeries,
  };
}

function generateTimeSeries(startDate: Date, days: number, avgValue: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    // Add some variance
    const variance = (Math.random() - 0.5) * avgValue * 0.4;
    const value = Math.max(0, Math.round((avgValue + variance) * 100) / 100);
    
    points.push({
      date: date.toISOString().split('T')[0],
      value,
    });
  }
  
  return points;
}
