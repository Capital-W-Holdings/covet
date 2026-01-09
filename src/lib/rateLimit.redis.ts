/**
 * Production-Ready Rate Limiter with Redis Backend
 * 
 * Uses Redis for distributed rate limiting across multiple instances.
 * Falls back to in-memory if Redis is unavailable.
 * 
 * Required environment variables:
 * - REDIS_URL: Redis connection string (e.g., redis://localhost:6379 or Upstash URL)
 * - RATE_LIMIT_ENABLED: Set to 'false' to disable rate limiting (dev only)
 * 
 * Optional dependency:
 * - ioredis: npm install ioredis (only needed for Redis backend)
 */

import { checkRateLimit as inMemoryCheck, RateLimitPresets } from './rateLimit';

// Redis client interface (subset of ioredis)
interface RedisClient {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { EX?: number }) => Promise<string | null>;
  ping: () => Promise<string>;
  quit: () => Promise<string>;
}

let redisClient: RedisClient | null = null;
let redisAvailable = false;
let lastRedisCheck = 0;
const REDIS_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Initialize Redis client
 */
async function getRedisClient(): Promise<RedisClient | null> {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    return null;
  }

  // Check if we recently verified Redis is unavailable
  if (!redisAvailable && Date.now() - lastRedisCheck < REDIS_CHECK_INTERVAL) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    // Dynamic import to avoid bundling issues when ioredis isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require('ioredis');
    
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      commandTimeout: 2000,
      retryStrategy: (times: number) => {
        if (times > 3) return null;
        return Math.min(times * 100, 1000);
      },
    });

    // Test connection
    await client.ping();
    
    redisClient = client as unknown as RedisClient;
    redisAvailable = true;
    console.log('✅ Redis rate limiter connected');
    
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis unavailable, falling back to in-memory rate limiting:', error);
    redisAvailable = false;
    lastRedisCheck = Date.now();
    return null;
  }
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs: number;
  backend: 'redis' | 'memory';
}

/**
 * Check rate limit using Redis sliding window algorithm
 */
async function checkRedisRateLimit(
  redis: RedisClient,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const windowSeconds = Math.ceil(config.windowMs / 1000);
  const redisKey = `ratelimit:${key}`;

  try {
    // Increment counter
    const count = await redis.incr(redisKey);
    
    // Set expiry on first request in window
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    // Get TTL for reset time
    const ttl = await redis.ttl(redisKey);
    const resetAt = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : config.windowMs));

    if (count > config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterMs: ttl > 0 ? ttl * 1000 : config.windowMs,
        backend: 'redis',
      };
    }

    return {
      allowed: true,
      remaining: config.limit - count,
      resetAt,
      retryAfterMs: 0,
      backend: 'redis',
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fall back to in-memory
    const result = inMemoryCheck(key, config);
    return { ...result, backend: 'memory' };
  }
}

/**
 * Check if a request should be rate limited
 * Uses Redis if available, falls back to in-memory
 */
export async function checkRateLimitAsync(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Check if rate limiting is disabled
  if (process.env.RATE_LIMIT_ENABLED === 'false') {
    return {
      allowed: true,
      remaining: config.limit,
      resetAt: new Date(Date.now() + config.windowMs),
      retryAfterMs: 0,
      backend: 'memory',
    };
  }

  const redis = await getRedisClient();
  
  if (redis) {
    return checkRedisRateLimit(redis, key, config);
  }

  // Fall back to in-memory
  const result = inMemoryCheck(key, config);
  return { ...result, backend: 'memory' };
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt.getTime() / 1000)),
    'X-RateLimit-Backend': result.backend,
    ...(result.allowed ? {} : { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) }),
  };
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<{
  connected: boolean;
  latencyMs: number | null;
  error?: string;
}> {
  const redis = await getRedisClient();
  
  if (!redis) {
    return {
      connected: false,
      latencyMs: null,
      error: process.env.REDIS_URL ? 'Connection failed' : 'REDIS_URL not configured',
    };
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latencyMs = Date.now() - start;
    
    return {
      connected: true,
      latencyMs,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Re-export presets
export { RateLimitPresets } from './rateLimit';
