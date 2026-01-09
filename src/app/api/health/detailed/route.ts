import { NextResponse } from 'next/server';
import { database, isDatabasePrisma } from '@/lib/database';
import { checkRedisHealth } from '@/lib/rateLimit.redis';
import { isStripeDemo } from '@/lib/stripe';

interface DependencyHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  dependencies: {
    database: DependencyHealth & { type: string };
    redis: DependencyHealth;
    stripe: DependencyHealth & { mode: string };
    storage: DependencyHealth;
  };
  checks: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// Track server start time
const startTime = Date.now();

/**
 * Comprehensive health check endpoint
 * 
 * Returns:
 * - 200: All systems healthy
 * - 503: One or more critical systems unhealthy
 * 
 * Use for:
 * - Load balancer health checks
 * - Kubernetes readiness/liveness probes
 * - Monitoring systems
 */
export async function GET(request: Request): Promise<NextResponse<HealthResponse>> {
  const url = new URL(request.url);
  const verbose = url.searchParams.get('verbose') === 'true';
  
  // Initialize response
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    dependencies: {
      database: { status: 'unhealthy', type: isDatabasePrisma ? 'postgresql' : 'in-memory' },
      redis: { status: 'unhealthy' },
      stripe: { status: 'unhealthy', mode: isStripeDemo() ? 'demo' : 'live' },
      storage: { status: 'unhealthy' },
    },
    checks: {
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    },
  };

  // Check database
  try {
    const dbStart = Date.now();
    const connected = await database.isConnected();
    const dbLatency = Date.now() - dbStart;
    
    if (connected) {
      health.dependencies.database = {
        status: dbLatency > 500 ? 'degraded' : 'healthy',
        type: isDatabasePrisma ? 'postgresql' : 'in-memory',
        latencyMs: dbLatency,
        message: dbLatency > 500 ? 'High latency detected' : undefined,
      };
    } else {
      health.dependencies.database = {
        status: 'unhealthy',
        type: isDatabasePrisma ? 'postgresql' : 'in-memory',
        message: 'Connection failed',
      };
    }
  } catch (error) {
    health.dependencies.database = {
      status: 'unhealthy',
      type: isDatabasePrisma ? 'postgresql' : 'in-memory',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check Redis
  try {
    const redisHealth = await checkRedisHealth();
    
    if (redisHealth.connected) {
      health.dependencies.redis = {
        status: (redisHealth.latencyMs || 0) > 100 ? 'degraded' : 'healthy',
        latencyMs: redisHealth.latencyMs || undefined,
        message: (redisHealth.latencyMs || 0) > 100 ? 'High latency detected' : undefined,
      };
    } else {
      // Redis is optional - degraded not unhealthy
      health.dependencies.redis = {
        status: 'degraded',
        message: redisHealth.error || 'Not connected (using in-memory fallback)',
      };
    }
  } catch (error) {
    health.dependencies.redis = {
      status: 'degraded',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check Stripe
  try {
    if (isStripeDemo()) {
      health.dependencies.stripe = {
        status: 'degraded',
        mode: 'demo',
        message: 'Running in demo mode - configure STRIPE_SECRET_KEY for production',
      };
    } else {
      // In production, we assume Stripe is healthy if configured
      // A real check would hit Stripe's API but that adds latency
      health.dependencies.stripe = {
        status: 'healthy',
        mode: 'live',
      };
    }
  } catch (error) {
    health.dependencies.stripe = {
      status: 'unhealthy',
      mode: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check storage (S3/local)
  try {
    const storageConfigured = !!process.env.AWS_S3_BUCKET || process.env.NODE_ENV === 'development';
    health.dependencies.storage = {
      status: storageConfigured ? 'healthy' : 'degraded',
      message: storageConfigured ? undefined : 'AWS_S3_BUCKET not configured',
    };
  } catch (error) {
    health.dependencies.storage = {
      status: 'degraded',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Memory usage (Node.js)
  if (verbose) {
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };
  }

  // Calculate overall status
  const statuses = Object.values(health.dependencies).map(d => d.status);
  
  if (statuses.includes('unhealthy')) {
    // Database is critical - if it's down, we're unhealthy
    if (health.dependencies.database.status === 'unhealthy') {
      health.status = 'unhealthy';
    } else {
      health.status = 'degraded';
    }
  } else if (statuses.includes('degraded')) {
    health.status = 'degraded';
  }

  // Return appropriate status code
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  
  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
