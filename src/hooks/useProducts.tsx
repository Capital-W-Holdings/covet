'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductQuery, PaginatedResponse } from '@/types';

interface UseProductsOptions extends ProductQuery {}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(options.page || 1);
  const [pageSize, setPageSize] = useState(options.pageSize || 12);
  const [hasMore, setHasMore] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (options.filters?.category) params.set('category', options.filters.category);
      if (options.filters?.brand) params.set('brand', options.filters.brand);
      if (options.filters?.condition) params.set('condition', options.filters.condition);
      if (options.filters?.minPrice) params.set('minPrice', options.filters.minPrice.toString());
      if (options.filters?.maxPrice) params.set('maxPrice', options.filters.maxPrice.toString());
      if (options.filters?.search) params.set('search', options.filters.search);
      if (options.filters?.storeId) params.set('storeId', options.filters.storeId);
      if (options.sort?.field) params.set('sortField', options.sort.field);
      if (options.sort?.order) params.set('sortOrder', options.sort.order);
      if (options.page) params.set('page', options.page.toString());
      if (options.pageSize) params.set('pageSize', options.pageSize.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        const response: PaginatedResponse<Product> = data.data;
        setProducts(response.items);
        setTotal(response.total);
        setPage(response.page);
        setPageSize(response.pageSize);
        setHasMore(response.hasMore);
      } else {
        setError(data.error?.message || 'Failed to fetch products');
      }
    } catch {
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    page,
    pageSize,
    hasMore,
    refetch: fetchProducts,
  };
}

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error?.message || 'Product not found');
      }
    } catch {
      setError('An error occurred while fetching the product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

export function useProductBySku(sku: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!sku) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/sku/${sku}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error?.message || 'Product not found');
      }
    } catch {
      setError('An error occurred while fetching the product');
    } finally {
      setLoading(false);
    }
  }, [sku]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(`/api/products/featured?limit=${limit}`);
        const data = await res.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch featured products');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, [limit]);

  return { products, loading, error };
}

export function useRelatedProducts(productId: string, limit = 4) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    async function fetchRelated() {
      try {
        const res = await fetch(`/api/products/${productId}/related?limit=${limit}`);
        const data = await res.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch related products');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [productId, limit]);

  return { products, loading, error };
}
