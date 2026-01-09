'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PriceAlert, PriceAlertWithProduct } from '@/types/priceAlert';

interface UsePriceAlertsResult {
  alerts: PriceAlertWithProduct[];
  loading: boolean;
  error: string | null;
  createAlert: (productId: string, targetPriceCents: number) => Promise<{ success: boolean; error?: string }>;
  deleteAlert: (productId: string) => Promise<{ success: boolean; error?: string }>;
  hasAlertForProduct: (productId: string) => boolean;
  getAlertForProduct: (productId: string) => PriceAlertWithProduct | undefined;
  refetch: () => Promise<void>;
}

export function usePriceAlerts(): UsePriceAlertsResult {
  const [alerts, setAlerts] = useState<PriceAlertWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/alerts/price');
      const data = await response.json();

      if (data.success) {
        setAlerts(data.data);
      } else if (response.status !== 401) {
        // Don't show error for unauthenticated users
        setError(data.error?.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Error fetching price alerts:', err);
      setError('Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = async (
    productId: string,
    targetPriceCents: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/alerts/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, targetPriceCents }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAlerts(); // Refresh list
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Failed to create alert' };
      }
    } catch (err) {
      console.error('Error creating price alert:', err);
      return { success: false, error: 'Failed to create alert' };
    }
  };

  const deleteAlert = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/alerts/price?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setAlerts((prev) => prev.filter((alert) => alert.productId !== productId));
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Failed to delete alert' };
      }
    } catch (err) {
      console.error('Error deleting price alert:', err);
      return { success: false, error: 'Failed to delete alert' };
    }
  };

  const hasAlertForProduct = useCallback(
    (productId: string): boolean => {
      return alerts.some((alert) => alert.productId === productId);
    },
    [alerts]
  );

  const getAlertForProduct = useCallback(
    (productId: string): PriceAlertWithProduct | undefined => {
      return alerts.find((alert) => alert.productId === productId);
    },
    [alerts]
  );

  return {
    alerts,
    loading,
    error,
    createAlert,
    deleteAlert,
    hasAlertForProduct,
    getAlertForProduct,
    refetch: fetchAlerts,
  };
}
