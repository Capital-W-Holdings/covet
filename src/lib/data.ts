/**
 * Optimized Data Fetching Utilities
 * 
 * Provides data fetching patterns optimized for Next.js App Router:
 * - ISR (Incremental Static Regeneration)
 * - SWR-like stale-while-revalidate
 * - Request deduplication
 * - Parallel fetching
 */

import { cache as reactCache } from 'react';
import { cache as memCache, CacheKeys, CacheTTL, CacheTags } from './cache';
import { dbPerformance } from './performance';
import { db } from './db';

/**
 * Revalidation intervals (in seconds) for ISR
 */
export const RevalidateInterval = {
  /** 1 minute - for dynamic data */
  FAST: 60,
  /** 5 minutes - default for most pages */
  STANDARD: 300,
  /** 1 hour - for stable content */
  SLOW: 3600,
  /** 24 hours - for static content */
  DAILY: 86400,
  /** Never revalidate (truly static) */
  STATIC: false as const,
};

/**
 * Fetch options for Next.js
 */
export interface FetchOptions {
  /** Revalidation interval in seconds, or false for static */
  revalidate?: number | false;
  /** Tags for on-demand revalidation */
  tags?: string[];
  /** Force cache bypass */
  noCache?: boolean;
}

/**
 * React cache wrapper - deduplicates requests within a single render
 * This is automatically deduplicated by React for the same arguments
 */
export const getProduct = reactCache(async (productId: string) => {
  return dbPerformance.trackQuery('getProduct', async () => {
    // Check memory cache first
    const cached = memCache.get(CacheKeys.product(productId));
    if (cached) return cached;

    await db.seed();
    const product = db.products.findOne(p => p.id === productId);
    
    if (product) {
      memCache.set(CacheKeys.product(productId), product, {
        ttl: CacheTTL.MEDIUM,
        tags: [CacheTags.PRODUCTS],
      });
    }

    return product;
  });
});

/**
 * Get product by SKU with caching
 */
export const getProductBySku = reactCache(async (sku: string) => {
  return dbPerformance.trackQuery('getProductBySku', async () => {
    const cacheKey = `product:sku:${sku}`;
    const cached = memCache.get(cacheKey);
    if (cached) return cached;

    await db.seed();
    const product = db.products.findOne(p => p.sku === sku);
    
    if (product) {
      memCache.set(cacheKey, product, {
        ttl: CacheTTL.MEDIUM,
        tags: [CacheTags.PRODUCTS],
      });
    }

    return product;
  });
});

/**
 * Get store with caching
 */
export const getStore = reactCache(async (storeId: string) => {
  return dbPerformance.trackQuery('getStore', async () => {
    const cached = memCache.get(CacheKeys.store(storeId));
    if (cached) return cached;

    await db.seed();
    const store = db.stores.findOne(s => s.id === storeId);
    
    if (store) {
      memCache.set(CacheKeys.store(storeId), store, {
        ttl: CacheTTL.LONG,
        tags: [CacheTags.STORES],
      });
    }

    return store;
  });
});

/**
 * Get products list with pagination and filtering
 */
export async function getProducts(params: {
  category?: string;
  storeId?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  featured?: boolean;
}) {
  const { category, storeId, page = 1, limit = 24, sort = 'newest', featured } = params;
  const cacheKey = `products:${category || 'all'}:${storeId || 'all'}:${page}:${limit}:${sort}:${featured || 'any'}`;

  return dbPerformance.trackQuery('getProducts', async () => {
    // Check cache
    const cached = memCache.get<unknown[]>(cacheKey);
    if (cached) return cached;

    await db.seed();
    
    let products = db.products.findMany(p => {
      if (category && p.category !== category) return false;
      if (storeId && p.storeId !== storeId) return false;
      // Note: featured field may not exist in all products
      if (featured !== undefined && (p as { featured?: boolean }).featured !== featured) return false;
      return p.status === 'ACTIVE';
    });

    // Sort
    if (sort === 'price_asc') {
      products = products.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sort === 'price_desc') {
      products = products.sort((a, b) => b.priceCents - a.priceCents);
    } else {
      products = products.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const result = products.slice(start, start + limit);

    memCache.set(cacheKey, result, {
      ttl: CacheTTL.SHORT, // Short TTL for lists
      tags: [CacheTags.PRODUCTS],
    });

    return result;
  });
}

/**
 * Get featured products (highly cached)
 */
export const getFeaturedProducts = reactCache(async () => {
  return dbPerformance.trackQuery('getFeaturedProducts', async () => {
    const cacheKey = 'products:featured';
    const cached = memCache.get(cacheKey);
    if (cached) return cached;

    const products = await getProducts({ featured: true, limit: 12 });

    memCache.set(cacheKey, products, {
      ttl: CacheTTL.LONG,
      tags: [CacheTags.PRODUCTS],
    });

    return products;
  });
});

/**
 * Get categories (highly cached)
 */
export const getCategories = reactCache(async () => {
  return dbPerformance.trackQuery('getCategories', async () => {
    const cached = memCache.get(CacheKeys.categories());
    if (cached) return cached;

    // Categories are relatively static
    const categories = [
      { id: 'HANDBAGS', name: 'Handbags', slug: 'handbags' },
      { id: 'WATCHES', name: 'Watches', slug: 'watches' },
      { id: 'JEWELRY', name: 'Jewelry', slug: 'jewelry' },
      { id: 'ACCESSORIES', name: 'Accessories', slug: 'accessories' },
      { id: 'CLOTHING', name: 'Clothing', slug: 'clothing' },
      { id: 'SHOES', name: 'Shoes', slug: 'shoes' },
    ];

    memCache.set(CacheKeys.categories(), categories, {
      ttl: CacheTTL.DAY,
    });

    return categories;
  });
});

/**
 * Parallel data fetching helper
 */
export async function fetchParallel<T extends Record<string, () => Promise<unknown>>>(
  fetchers: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(fetchers) as (keyof T)[];
  const promises = keys.map(key => fetchers[key]());
  const results = await Promise.all(promises);

  return keys.reduce((acc, key, index) => {
    acc[key] = results[index] as Awaited<ReturnType<T[typeof key]>>;
    return acc;
  }, {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> });
}

/**
 * Invalidate cache for a specific entity
 */
export function invalidateProduct(productId: string): void {
  memCache.delete(CacheKeys.product(productId));
}

export function invalidateStore(storeId: string): void {
  memCache.delete(CacheKeys.store(storeId));
  memCache.delete(CacheKeys.storeProducts(storeId));
}

export function invalidateAllProducts(): void {
  memCache.invalidateByTag(CacheTags.PRODUCTS);
}

export function invalidateAllStores(): void {
  memCache.invalidateByTag(CacheTags.STORES);
}

/**
 * Prefetch data for anticipated navigation
 */
export async function prefetchProduct(productId: string): Promise<void> {
  // Fire and forget - preload into cache
  getProduct(productId).catch(() => {
    // Ignore prefetch errors
  });
}

export async function prefetchProducts(productIds: string[]): Promise<void> {
  // Prefetch multiple products in parallel
  await Promise.allSettled(productIds.map(id => getProduct(id)));
}

/**
 * Create Next.js generateStaticParams helper
 */
export async function getStaticProductIds(): Promise<{ id: string }[]> {
  // Get most popular products for static generation
  const products = await getProducts({ limit: 100, sort: 'newest' });
  return (products as Array<{ id: string }>).map(p => ({ id: p.id }));
}

export async function getStaticStoreIds(): Promise<{ id: string }[]> {
  await db.seed();
  const stores = db.stores.findMany(() => true).slice(0, 50);
  return stores.map((s: { id: string }) => ({ id: s.id }));
}

/**
 * Metadata for ISR pages
 */
export const productPageConfig = {
  revalidate: RevalidateInterval.STANDARD, // Revalidate every 5 minutes
  dynamicParams: true, // Allow dynamic params not returned by generateStaticParams
};

export const storePageConfig = {
  revalidate: RevalidateInterval.SLOW, // Revalidate every hour
  dynamicParams: true,
};

export const categoryPageConfig = {
  revalidate: RevalidateInterval.FAST, // Revalidate every minute (products change)
  dynamicParams: true,
};

export const homePageConfig = {
  revalidate: RevalidateInterval.STANDARD,
};
