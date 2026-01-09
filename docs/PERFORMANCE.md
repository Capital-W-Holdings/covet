# Covet Performance Optimization Guide

## Overview

This guide covers the performance optimizations implemented in Covet to ensure fast page loads, efficient data fetching, and smooth user experiences.

## Key Optimizations

### 1. Next.js Configuration

**Image Optimization** (`next.config.js`)
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 31536000, // 1 year
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
}
```

**Headers for Caching**
- Static assets: 1 year cache, immutable
- Optimized images: 1 week + stale-while-revalidate
- API responses: No cache by default

### 2. Data Fetching Patterns

#### ISR (Incremental Static Regeneration)

```typescript
import { RevalidateInterval } from '@/lib/data';

// Page-level configuration
export const revalidate = RevalidateInterval.STANDARD; // 5 minutes

// Or use specific configs
export const { revalidate } = productPageConfig;
```

| Interval | Seconds | Use Case |
|----------|---------|----------|
| FAST | 60 | Dynamic listings |
| STANDARD | 300 | Product pages |
| SLOW | 3600 | Store pages |
| DAILY | 86400 | Static content |

#### React Cache (Request Deduplication)

```typescript
import { getProduct, getStore } from '@/lib/data';

// These are automatically deduplicated within a single request
async function ProductPage({ params }) {
  // Even if called multiple times, only fetches once
  const product = await getProduct(params.id);
  const store = await getStore(product.storeId);
  
  return <ProductDetail product={product} store={store} />;
}
```

#### Memory Cache (Cross-Request)

```typescript
import { cache, CacheTTL, CacheTags } from '@/lib/cache';

// Manual caching
cache.set('key', data, {
  ttl: CacheTTL.MEDIUM,
  tags: [CacheTags.PRODUCTS],
});

// Automatic with getOrSet
const data = await cache.getOrSet(
  'expensive-query',
  () => expensiveQuery(),
  { ttl: CacheTTL.LONG }
);

// Memoization
const memoizedFn = cache.memoize(
  expensiveFn,
  (arg1, arg2) => `key:${arg1}:${arg2}`,
  { ttl: CacheTTL.MEDIUM }
);
```

### 3. Cache Invalidation

```typescript
import {
  invalidateProduct,
  invalidateStore,
  invalidateAllProducts,
} from '@/lib/data';

// After product update
invalidateProduct(productId);

// After store update
invalidateStore(storeId);

// After bulk operations
invalidateAllProducts();
```

### 4. Parallel Data Fetching

```typescript
import { fetchParallel } from '@/lib/data';

// Fetch multiple resources in parallel
const { product, store, reviews } = await fetchParallel({
  product: () => getProduct(id),
  store: () => getStore(storeId),
  reviews: () => getReviews(id),
});
```

### 5. Prefetching

```typescript
import { prefetchProduct, prefetchProducts } from '@/lib/data';

// Prefetch on hover
<Link 
  href={`/product/${id}`}
  onMouseEnter={() => prefetchProduct(id)}
>

// Prefetch related products
useEffect(() => {
  prefetchProducts(relatedIds);
}, [relatedIds]);
```

---

## Component Optimization

### Lazy Loading

```typescript
import { LazyLoad, createLazyComponent } from '@/components/LazyLoad';

// Viewport-based lazy loading
<LazyLoad
  skeleton={<ProductCardSkeleton />}
  rootMargin="200px"
>
  <ExpensiveComponent />
</LazyLoad>

// Code splitting
const HeavyChart = createLazyComponent(
  () => import('@/components/HeavyChart'),
  <ChartSkeleton />
);
```

### Deferred Rendering

```typescript
import { Defer, IdleLoad } from '@/components/LazyLoad';

// Render only on client
<Defer fallback={<Skeleton />}>
  <ClientOnlyComponent />
</Defer>

// Load on idle
<IdleLoad fallback={<Placeholder />}>
  <NonCriticalFeature />
</IdleLoad>

// Load on interaction
<IdleLoad loadOnInteraction>
  <DropdownContent />
</IdleLoad>
```

### Virtual Lists

```typescript
import { VirtualList } from '@/components/LazyLoad';

<VirtualList
  items={products}
  itemHeight={120}
  overscan={5}
  renderItem={(product, index) => (
    <ProductRow product={product} />
  )}
/>
```

---

## Performance Monitoring

### Measuring Operations

```typescript
import { measureAsync, createTimer, dbPerformance } from '@/lib/performance';

// Async measurement
const { result, timing } = await measureAsync('fetchProducts', async () => {
  return fetch('/api/products');
});
console.log(`Took ${timing.duration}ms`);

// Manual timer
const timer = createTimer('complexOperation');
// ... do work
const duration = timer.stop();

// Database query tracking
const data = await dbPerformance.trackQuery('getProducts', async () => {
  return db.products.findMany();
});
```

### Metrics Collection

```typescript
import { recordMetric, incrementCounter } from '@/lib/performance';

// Custom metric
recordMetric({
  name: 'checkout.step',
  value: 1,
  unit: 'count',
  tags: { step: 'payment' },
  timestamp: Date.now(),
});

// Counter
incrementCounter('api.requests', 1, { endpoint: '/api/products' });
```

### Performance Stats

```typescript
import { getPerformanceStats } from '@/lib/performance';

const stats = getPerformanceStats();
// { bufferedMetrics: 42, memoryUsage: {...}, uptime: 3600 }
```

---

## Best Practices

### Do's

✅ Use `getProduct()` and other data functions - they're deduplicated
✅ Add `revalidate` to pages that can be statically generated
✅ Prefetch data on hover/focus for anticipated navigation
✅ Use `LazyLoad` for below-the-fold content
✅ Track slow operations with performance utilities
✅ Use appropriate cache TTLs based on data volatility

### Don'ts

❌ Don't bypass the cache for repeated identical requests
❌ Don't use client-side fetching for initial page data
❌ Don't forget to invalidate cache after mutations
❌ Don't load heavy components eagerly
❌ Don't ignore slow query warnings in logs

---

## Monitoring Checklist

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| TTFB (Time to First Byte) | < 200ms | > 500ms |
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| FID (First Input Delay) | < 100ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| API Response Time (p95) | < 500ms | > 1s |
| Cache Hit Rate | > 80% | < 50% |
| Database Query Time (p95) | < 50ms | > 200ms |

---

## Debugging Performance Issues

### 1. Check Cache Stats

```typescript
import { cache } from '@/lib/cache';
console.log(cache.getStats());
// { hits: 450, misses: 50, size: 234, hitRate: 0.9 }
```

### 2. Enable Performance Logging

```env
LOG_LEVEL=debug
```

### 3. View Slow Operations

Slow operations (>1s) are automatically logged as warnings:
```
⚠️ [WARN] Slow operation: getProducts { duration: 1234 }
```

### 4. Check Memory Usage

```typescript
const stats = getPerformanceStats();
console.log('Heap used:', stats.memoryUsage.heapUsed / 1024 / 1024, 'MB');
```

---

## Configuration Reference

### Cache TTL Presets

| Preset | Duration | Use Case |
|--------|----------|----------|
| SHORT | 1 min | Fast-changing lists |
| MEDIUM | 5 min | Product details |
| LONG | 30 min | Store info |
| VERY_LONG | 1 hour | User profiles |
| DAY | 24 hours | Categories, config |

### Cache Tags

| Tag | Scope |
|-----|-------|
| PRODUCTS | All product data |
| STORES | All store data |
| USERS | All user data |
| ORDERS | All order data |
| ANALYTICS | Dashboard data |

### Revalidation Intervals

| Interval | Seconds | Pages |
|----------|---------|-------|
| FAST | 60 | Category listings |
| STANDARD | 300 | Product pages |
| SLOW | 3600 | Store pages |
| DAILY | 86400 | About, FAQ |
| STATIC | false | Terms, Privacy |
