/**
 * In-Memory Cache with TTL Support
 * 
 * Provides a simple caching layer for frequently accessed data.
 * Supports TTL, LRU eviction, and cache tags for invalidation.
 * 
 * For production, consider using Redis via rateLimit.redis.ts
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Tags for grouped invalidation */
  tags?: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

// Max cache size (entries)
const MAX_CACHE_SIZE = 1000;

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private accessOrder: string[] = [];
  private hits = 0;
  private misses = 0;

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    this.hits++;

    return entry.value;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? DEFAULT_TTL;
    const tags = options.tags ?? [];

    // Evict if at capacity
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
      tags,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    }
    return deleted;
  }

  /**
   * Invalidate all entries with a specific tag
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Check if key exists (without updating access order)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get or set with async factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  /**
   * Memoize an async function
   */
  memoize<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    keyGenerator: (...args: TArgs) => string,
    options: CacheOptions = {}
  ): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
      const key = keyGenerator(...args);
      return this.getOrSet(key, () => fn(...args), options);
    };
  }

  // Private methods

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private evictLRU(): void {
    // Remove oldest accessed entry
    const oldestKey = this.accessOrder.shift();
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Singleton instance
export const cache = new MemoryCache();

/**
 * Cache key generators for common patterns
 */
export const CacheKeys = {
  product: (id: string) => `product:${id}`,
  productList: (params: { category?: string; page?: number }) => 
    `products:${params.category || 'all'}:${params.page || 1}`,
  store: (id: string) => `store:${id}`,
  storeProducts: (storeId: string) => `store:${storeId}:products`,
  user: (id: string) => `user:${id}`,
  categories: () => 'categories:all',
  analytics: (period: string) => `analytics:${period}`,
};

/**
 * Cache TTL presets (in milliseconds)
 */
export const CacheTTL = {
  /** 1 minute - for rapidly changing data */
  SHORT: 60 * 1000,
  /** 5 minutes - default */
  MEDIUM: 5 * 60 * 1000,
  /** 30 minutes - for stable data */
  LONG: 30 * 60 * 1000,
  /** 1 hour - for static data */
  VERY_LONG: 60 * 60 * 1000,
  /** 24 hours - for configuration */
  DAY: 24 * 60 * 60 * 1000,
};

/**
 * Cache tags for invalidation
 */
export const CacheTags = {
  PRODUCTS: 'products',
  STORES: 'stores',
  USERS: 'users',
  ORDERS: 'orders',
  ANALYTICS: 'analytics',
};

export default cache;
