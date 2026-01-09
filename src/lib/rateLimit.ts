/**
 * Simple in-memory rate limiter for development/single-instance deployments.
 * 
 * ⚠️ PRODUCTION WARNING: This implementation stores rate limit data in-memory,
 * which means:
 * 1. Data is lost on server restart
 * 2. Rate limits are per-instance (not shared across multiple servers)
 * 
 * For production, replace with Redis-based implementation:
 * - Use @upstash/ratelimit for serverless
 * - Use ioredis with sliding window algorithm for traditional servers
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

// In-memory store (replace with Redis in production)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  
  // Allow Node to exit even if timer is running
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request should be rate limited
 * @param key Unique identifier (e.g., IP address, user ID)
 * @param config Rate limit configuration
 * @returns Object with allowed status and rate limit info
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs: number;
} {
  startCleanup();
  
  const now = Date.now();
  const entry = store.get(key);
  
  // No existing entry or entry has expired
  if (!entry || entry.resetAt < now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: new Date(now + config.windowMs),
      retryAfterMs: 0,
    };
  }
  
  // Entry exists and hasn't expired
  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfterMs: entry.resetAt - now,
    };
  }
  
  // Increment count
  entry.count++;
  store.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: new Date(entry.resetAt),
    retryAfterMs: 0,
  };
}

// Preset configurations for different endpoints
export const RateLimitPresets = {
  /** Login attempts: 5 per minute per IP */
  login: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  
  /** Registration: 3 per hour per IP */
  register: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  /** Password reset: 3 per hour per email */
  passwordReset: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  /** General API: 100 per minute per user */
  api: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  /** Checkout: 10 per hour per user (prevent spam orders) */
  checkout: {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Get client IP from request headers
 * Works with common proxies/load balancers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Vercel-specific
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    return vercelIp.split(',')[0].trim();
  }
  
  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }
  
  // Fallback - this won't work in production with proxies
  return 'unknown';
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: ReturnType<typeof checkRateLimit>): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt.getTime() / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) }),
  };
}
