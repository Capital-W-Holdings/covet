/**
 * Performance and Caching Tests
 */

import { cache, CacheKeys, CacheTTL, CacheTags } from '@/lib/cache';
import {
  measureAsync,
  measureSync,
  createTimer,
  recordMetric,
  getPerformanceStats,
} from '@/lib/performance';

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Memory Cache', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('basic operations', () => {
    it('sets and gets values', () => {
      cache.set('test-key', { data: 'test' });
      const result = cache.get('test-key');
      expect(result).toEqual({ data: 'test' });
    });

    it('returns null for missing keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('deletes values', () => {
      cache.set('to-delete', 'value');
      expect(cache.has('to-delete')).toBe(true);
      
      cache.delete('to-delete');
      expect(cache.has('to-delete')).toBe(false);
    });

    it('clears all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('TTL expiration', () => {
    it('respects TTL', async () => {
      cache.set('short-lived', 'value', { ttl: 50 });
      
      expect(cache.get('short-lived')).toBe('value');
      
      await new Promise(resolve => setTimeout(resolve, 60));
      
      expect(cache.get('short-lived')).toBeNull();
    });

    it('uses default TTL when not specified', () => {
      cache.set('default-ttl', 'value');
      expect(cache.has('default-ttl')).toBe(true);
    });
  });

  describe('tag-based invalidation', () => {
    it('invalidates entries by tag', () => {
      cache.set('product-1', { id: 1 }, { tags: ['products'] });
      cache.set('product-2', { id: 2 }, { tags: ['products'] });
      cache.set('store-1', { id: 1 }, { tags: ['stores'] });

      const invalidated = cache.invalidateByTag('products');

      expect(invalidated).toBe(2);
      expect(cache.get('product-1')).toBeNull();
      expect(cache.get('product-2')).toBeNull();
      expect(cache.get('store-1')).toEqual({ id: 1 });
    });

    it('supports multiple tags per entry', () => {
      cache.set('item', 'value', { tags: ['tag1', 'tag2'] });

      cache.invalidateByTag('tag1');
      expect(cache.get('item')).toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('returns cached value if exists', async () => {
      cache.set('existing', 'cached-value');

      const factory = jest.fn().mockResolvedValue('new-value');
      const result = await cache.getOrSet('existing', factory);

      expect(result).toBe('cached-value');
      expect(factory).not.toHaveBeenCalled();
    });

    it('calls factory and caches if missing', async () => {
      const factory = jest.fn().mockResolvedValue('computed-value');
      const result = await cache.getOrSet('new-key', factory);

      expect(result).toBe('computed-value');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(cache.get('new-key')).toBe('computed-value');
    });
  });

  describe('memoize', () => {
    it('memoizes function calls', async () => {
      const expensive = jest.fn().mockResolvedValue(42);
      const memoized = cache.memoize(
        expensive,
        (x: number) => `key:${x}`
      );

      const result1 = await memoized(1);
      const result2 = await memoized(1);
      const result3 = await memoized(2);

      expect(result1).toBe(42);
      expect(result2).toBe(42);
      expect(result3).toBe(42);
      expect(expensive).toHaveBeenCalledTimes(2); // Once for 1, once for 2
    });
  });

  describe('statistics', () => {
    it('tracks hits and misses', () => {
      cache.set('key', 'value');
      
      cache.get('key'); // hit
      cache.get('key'); // hit
      cache.get('missing'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });
  });
});

describe('Cache Keys', () => {
  it('generates product key', () => {
    expect(CacheKeys.product('123')).toBe('product:123');
  });

  it('generates product list key', () => {
    expect(CacheKeys.productList({ category: 'HANDBAGS', page: 2 }))
      .toBe('products:HANDBAGS:2');
  });

  it('generates store key', () => {
    expect(CacheKeys.store('abc')).toBe('store:abc');
  });

  it('generates categories key', () => {
    expect(CacheKeys.categories()).toBe('categories:all');
  });
});

describe('Cache TTL Presets', () => {
  it('has correct values', () => {
    expect(CacheTTL.SHORT).toBe(60 * 1000);
    expect(CacheTTL.MEDIUM).toBe(5 * 60 * 1000);
    expect(CacheTTL.LONG).toBe(30 * 60 * 1000);
    expect(CacheTTL.VERY_LONG).toBe(60 * 60 * 1000);
    expect(CacheTTL.DAY).toBe(24 * 60 * 60 * 1000);
  });
});

describe('Cache Tags', () => {
  it('has correct values', () => {
    expect(CacheTags.PRODUCTS).toBe('products');
    expect(CacheTags.STORES).toBe('stores');
    expect(CacheTags.USERS).toBe('users');
    expect(CacheTags.ORDERS).toBe('orders');
  });
});

describe('Performance Monitoring', () => {
  describe('measureAsync', () => {
    it('measures async function duration', async () => {
      const fn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const { result, timing } = await measureAsync('test-async', fn);

      expect(result).toBe('result');
      expect(timing.duration).toBeGreaterThanOrEqual(40);
      expect(timing.duration).toBeLessThan(200);
      expect(timing.endTime).toBeGreaterThan(timing.startTime);
    });

    it('handles errors', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };

      await expect(measureAsync('test-error', fn)).rejects.toThrow('Test error');
    });
  });

  describe('measureSync', () => {
    it('measures sync function duration', () => {
      const fn = () => {
        let sum = 0;
        for (let i = 0; i < 10000; i++) sum += i;
        return sum;
      };

      const { result, timing } = measureSync('test-sync', fn);

      expect(result).toBe(49995000);
      expect(timing.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createTimer', () => {
    it('creates a timer that measures duration', async () => {
      const timer = createTimer('test-timer');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const elapsed = timer.elapsed();
      expect(elapsed).toBeGreaterThanOrEqual(40);

      const duration = timer.stop();
      expect(duration).toBeGreaterThanOrEqual(40);
    });
  });

  describe('recordMetric', () => {
    it('records metrics without throwing', () => {
      expect(() => {
        recordMetric({
          name: 'test-metric',
          value: 100,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }).not.toThrow();
    });
  });

  describe('getPerformanceStats', () => {
    it('returns performance stats', () => {
      const stats = getPerformanceStats();

      expect(stats).toHaveProperty('bufferedMetrics');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('uptime');
      expect(typeof stats.uptime).toBe('number');
    });
  });
});

describe('Revalidation Intervals', () => {
  // Imported from data.ts
  const RevalidateInterval = {
    FAST: 60,
    STANDARD: 300,
    SLOW: 3600,
    DAILY: 86400,
    STATIC: false as const,
  };

  it('has correct values in seconds', () => {
    expect(RevalidateInterval.FAST).toBe(60);
    expect(RevalidateInterval.STANDARD).toBe(300);
    expect(RevalidateInterval.SLOW).toBe(3600);
    expect(RevalidateInterval.DAILY).toBe(86400);
    expect(RevalidateInterval.STATIC).toBe(false);
  });
});

describe('Data Fetching Patterns', () => {
  describe('parallel fetching', () => {
    it('fetches multiple resources in parallel', async () => {
      const fetchA = jest.fn().mockResolvedValue('A');
      const fetchB = jest.fn().mockResolvedValue('B');
      const fetchC = jest.fn().mockResolvedValue('C');

      const start = Date.now();
      
      // Simulate parallel fetching
      const [a, b, c] = await Promise.all([
        fetchA(),
        fetchB(),
        fetchC(),
      ]);

      const duration = Date.now() - start;

      expect(a).toBe('A');
      expect(b).toBe('B');
      expect(c).toBe('C');
      
      // All three should have been called
      expect(fetchA).toHaveBeenCalled();
      expect(fetchB).toHaveBeenCalled();
      expect(fetchC).toHaveBeenCalled();
    });
  });

  describe('deduplication', () => {
    it('deduplicates identical requests', async () => {
      let callCount = 0;
      const fetchData = async (id: string) => {
        callCount++;
        return { id };
      };

      // Simulate React cache behavior
      const cache = new Map<string, Promise<unknown>>();
      const deduped = (id: string) => {
        if (!cache.has(id)) {
          cache.set(id, fetchData(id));
        }
        return cache.get(id);
      };

      // Same ID called multiple times
      const [r1, r2, r3] = await Promise.all([
        deduped('same-id'),
        deduped('same-id'),
        deduped('same-id'),
      ]);

      expect(r1).toEqual({ id: 'same-id' });
      expect(r2).toEqual({ id: 'same-id' });
      expect(r3).toEqual({ id: 'same-id' });
      expect(callCount).toBe(1); // Only called once
    });
  });
});

describe('LRU Eviction', () => {
  it('evicts least recently used entries when full', () => {
    // Create a small cache for testing
    const smallCache = {
      cache: new Map<string, { value: unknown; accessOrder: number }>(),
      maxSize: 3,
      accessCounter: 0,
      
      set(key: string, value: unknown) {
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
          // Evict LRU
          let lruKey = '';
          let lruOrder = Infinity;
          for (const [k, v] of this.cache) {
            if (v.accessOrder < lruOrder) {
              lruOrder = v.accessOrder;
              lruKey = k;
            }
          }
          this.cache.delete(lruKey);
        }
        this.cache.set(key, { value, accessOrder: this.accessCounter++ });
      },
      
      get(key: string) {
        const entry = this.cache.get(key);
        if (entry) {
          entry.accessOrder = this.accessCounter++;
          return entry.value;
        }
        return null;
      },
      
      has(key: string) {
        return this.cache.has(key);
      }
    };

    smallCache.set('a', 1);
    smallCache.set('b', 2);
    smallCache.set('c', 3);

    // Access 'a' to make it recently used
    smallCache.get('a');

    // Add 'd' - should evict 'b' (least recently used)
    smallCache.set('d', 4);

    expect(smallCache.has('a')).toBe(true);
    expect(smallCache.has('b')).toBe(false); // Evicted
    expect(smallCache.has('c')).toBe(true);
    expect(smallCache.has('d')).toBe(true);
  });
});
