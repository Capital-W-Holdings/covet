'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReviewStats } from '@/types/review';

interface UseReviewStatsOptions {
  enabled?: boolean;
}

interface UseReviewStatsResult {
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache for review stats to avoid redundant fetches
const statsCache = new Map<string, { stats: ReviewStats; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useReviewStats(
  productId: string | undefined,
  options: UseReviewStatsOptions = {}
): UseReviewStatsResult {
  const { enabled = true } = options;
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!productId || !enabled) return;

    // Check cache first
    const cached = statsCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setStats(cached.stats);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/reviews/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        statsCache.set(productId, { stats: data.data, timestamp: Date.now() });
      } else {
        setError(data.error?.message || 'Failed to fetch review stats');
      }
    } catch (err) {
      console.error('Error fetching review stats:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, enabled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// Batch fetch for multiple products (for product grids)
export function useReviewStatsBatch(productIds: string[]): Map<string, ReviewStats> {
  const [statsMap, setStatsMap] = useState<Map<string, ReviewStats>>(new Map());

  useEffect(() => {
    if (productIds.length === 0) return;

    const fetchAll = async () => {
      const results = new Map<string, ReviewStats>();
      
      // Check cache and identify missing
      const missing: string[] = [];
      for (const id of productIds) {
        const cached = statsCache.get(id);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          results.set(id, cached.stats);
        } else {
          missing.push(id);
        }
      }

      // Fetch missing (in parallel, limited batch)
      const batchSize = 5;
      for (let i = 0; i < missing.length; i += batchSize) {
        const batch = missing.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (id) => {
            try {
              const response = await fetch(`/api/products/${id}/reviews/stats`);
              const data = await response.json();
              if (data.success) {
                results.set(id, data.data);
                statsCache.set(id, { stats: data.data, timestamp: Date.now() });
              }
            } catch {
              // Ignore individual failures
            }
          })
        );
      }

      setStatsMap(results);
    };

    fetchAll();
  }, [productIds.join(',')]);

  return statsMap;
}
