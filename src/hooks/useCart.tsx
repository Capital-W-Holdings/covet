'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Product } from '@/types';

interface CartContextType {
  item: Product | null;
  itemCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: () => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'covet_cart_id'; // Now stores only product ID

export function CartProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product by ID from server
  const fetchProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null; // Product no longer exists
        }
        throw new Error('Failed to fetch product');
      }
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  }, []);

  // Refresh cart - re-fetch product from server
  const refreshCart = useCallback(async () => {
    const savedId = localStorage.getItem(CART_KEY);
    if (!savedId) {
      setItem(null);
      setError(null);
      return;
    }

    const product = await fetchProduct(savedId);
    if (!product) {
      // Product no longer exists or unavailable
      localStorage.removeItem(CART_KEY);
      setItem(null);
      setError('The item in your cart is no longer available');
      return;
    }

    // Check if product is still available
    if (product.status !== 'ACTIVE') {
      localStorage.removeItem(CART_KEY);
      setItem(null);
      setError(
        product.status === 'SOLD' 
          ? 'The item in your cart has been sold' 
          : 'The item in your cart is no longer available'
      );
      return;
    }

    setItem(product);
    setError(null);
  }, [fetchProduct]);

  // Load cart from localStorage on mount - fetch fresh product data
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      await refreshCart();
      setLoading(false);
    };
    loadCart();
  }, [refreshCart]);

  const addToCart = useCallback((product: Product) => {
    // Store only the product ID - prevents price manipulation
    localStorage.setItem(CART_KEY, product.id);
    setItem(product);
    setError(null);
  }, []);

  const removeFromCart = useCallback(() => {
    localStorage.removeItem(CART_KEY);
    setItem(null);
    setError(null);
  }, []);

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_KEY);
    setItem(null);
    setError(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        item,
        itemCount: item ? 1 : 0,
        loading,
        error,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
