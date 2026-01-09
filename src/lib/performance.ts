/**
 * Performance Monitoring Utilities
 * 
 * Provides tools for measuring and tracking performance metrics.
 * Integrates with Next.js and can report to external services.
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
  timestamp: number;
}

interface TimingResult {
  duration: number;
  startTime: number;
  endTime: number;
}

// Store metrics for batch reporting
const metricsBuffer: PerformanceMetric[] = [];
const BUFFER_FLUSH_INTERVAL = 30000; // 30 seconds
const MAX_BUFFER_SIZE = 100;

/**
 * Measure execution time of an async function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<{ result: T; timing: TimingResult }> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    recordMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
      timestamp: Date.now(),
    });

    return {
      result,
      timing: { duration, startTime, endTime },
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    recordMetric({
      name: `${name}_error`,
      value: duration,
      unit: 'ms',
      tags: { ...tags, error: 'true' },
      timestamp: Date.now(),
    });

    throw error;
  }
}

/**
 * Measure execution time of a sync function
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>
): { result: T; timing: TimingResult } {
  const startTime = performance.now();
  
  try {
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    recordMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
      timestamp: Date.now(),
    });

    return {
      result,
      timing: { duration, startTime, endTime },
    };
  } catch (error) {
    const endTime = performance.now();
    recordMetric({
      name: `${name}_error`,
      value: endTime - startTime,
      unit: 'ms',
      tags: { ...tags, error: 'true' },
      timestamp: Date.now(),
    });
    throw error;
  }
}

/**
 * Create a performance timer
 */
export function createTimer(name: string, tags?: Record<string, string>) {
  const startTime = performance.now();

  return {
    /**
     * Stop the timer and record the metric
     */
    stop(): number {
      const duration = performance.now() - startTime;
      recordMetric({
        name,
        value: duration,
        unit: 'ms',
        tags,
        timestamp: Date.now(),
      });
      return duration;
    },

    /**
     * Get elapsed time without stopping
     */
    elapsed(): number {
      return performance.now() - startTime;
    },
  };
}

/**
 * Record a custom metric
 */
export function recordMetric(metric: PerformanceMetric): void {
  metricsBuffer.push(metric);

  // Log slow operations
  if (metric.unit === 'ms' && metric.value > 1000) {
    logger.warn(`Slow operation: ${metric.name}`, {
      duration: metric.value,
      ...metric.tags,
    });
  }

  // Flush if buffer is full
  if (metricsBuffer.length >= MAX_BUFFER_SIZE) {
    flushMetrics();
  }
}

/**
 * Record a counter metric
 */
export function incrementCounter(
  name: string,
  value: number = 1,
  tags?: Record<string, string>
): void {
  recordMetric({
    name,
    value,
    unit: 'count',
    tags,
    timestamp: Date.now(),
  });
}

/**
 * Flush metrics to external service
 */
export function flushMetrics(): void {
  if (metricsBuffer.length === 0) return;

  const metrics = [...metricsBuffer];
  metricsBuffer.length = 0;

  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Could send to:
    // - Vercel Analytics
    // - Datadog
    // - New Relic
    // - Custom endpoint
    
    // For now, log summary
    const summary = summarizeMetrics(metrics);
    logger.info('Performance metrics batch', { summary });
  }
}

/**
 * Summarize metrics for logging
 */
function summarizeMetrics(metrics: PerformanceMetric[]): Record<string, unknown> {
  const byName = new Map<string, number[]>();

  for (const metric of metrics) {
    const values = byName.get(metric.name) || [];
    values.push(metric.value);
    byName.set(metric.name, values);
  }

  const summary: Record<string, unknown> = {
    totalMetrics: metrics.length,
    operations: {},
  };

  for (const [name, values] of byName) {
    const sorted = values.sort((a, b) => a - b);
    (summary.operations as Record<string, unknown>)[name] = {
      count: values.length,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1]),
      p50: Math.round(sorted[Math.floor(sorted.length * 0.5)]),
      p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      p99: Math.round(sorted[Math.floor(sorted.length * 0.99)]),
    };
  }

  return summary;
}

/**
 * Decorator for measuring method performance
 */
export function measured(name?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${(target as object).constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const timer = createTimer(metricName);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        timer.stop();
      }
    };

    return descriptor;
  };
}

/**
 * Database query performance tracker
 */
export const dbPerformance = {
  /**
   * Track a database query
   */
  async trackQuery<T>(
    queryName: string,
    query: () => Promise<T>
  ): Promise<T> {
    const { result, timing } = await measureAsync(`db.${queryName}`, query, {
      type: 'database',
    });

    // Alert on slow queries
    if (timing.duration > 500) {
      logger.warn(`Slow database query: ${queryName}`, {
        duration: timing.duration,
      });
    }

    return result;
  },
};

/**
 * API endpoint performance tracker
 */
export const apiPerformance = {
  /**
   * Track an API request
   */
  trackRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    recordMetric({
      name: 'api.request',
      value: duration,
      unit: 'ms',
      tags: {
        method,
        path,
        status: String(statusCode),
        success: String(statusCode < 400),
      },
      timestamp: Date.now(),
    });
  },
};

/**
 * Get current performance stats
 */
export function getPerformanceStats(): {
  bufferedMetrics: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
} {
  return {
    bufferedMetrics: metricsBuffer.length,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };
}

// Auto-flush metrics periodically
if (typeof setInterval !== 'undefined') {
  setInterval(flushMetrics, BUFFER_FLUSH_INTERVAL);
}

// Flush on process exit
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', flushMetrics);
}
