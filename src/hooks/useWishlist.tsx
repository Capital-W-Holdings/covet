'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Product } from '@/types';

// =============================================================================
// Types
// =============================================================================

interface WishlistItem {
  productId: string;
  addedAt: Date;
}

interface WishlistContextValue {
  items: WishlistItem[];
  products: Product[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  refreshWishlist: () => Promise<void>;
}

// =============================================================================
// Constants
// =============================================================================

const WISHLIST_STORAGE_KEY = 'covet_wishlist';
const MAX_WISHLIST_ITEMS = 50;

// =============================================================================
// Context
// =============================================================================

const WishlistContext = createContext<WishlistContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WishlistItem[];
        // Convert date strings back to Date objects
        const itemsWithDates = parsed.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setItems(itemsWithDates);
      }
    } catch (err) {
      console.error('Failed to load wishlist from storage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error('Failed to save wishlist to storage:', err);
      }
    }
  }, [items, loading]);

  // Fetch product details for wishlist items
  const fetchProducts = useCallback(async () => {
    if (items.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch each product - in production, you'd want a batch endpoint
      const productPromises = items.map(async (item) => {
        const res = await fetch(`/api/products/${item.productId}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      });

      const fetchedProducts = await Promise.all(productPromises);
      const validProducts = fetchedProducts.filter((p): p is Product => p !== null);
      
      // Remove items from wishlist if product no longer exists
      const validProductIds = new Set(validProducts.map(p => p.id));
      const invalidItems = items.filter(item => !validProductIds.has(item.productId));
      
      if (invalidItems.length > 0) {
        setItems(prev => prev.filter(item => validProductIds.has(item.productId)));
      }

      setProducts(validProducts);
    } catch (err) {
      console.error('Failed to fetch wishlist products:', err);
      setError('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Refresh wishlist products
  const refreshWishlist = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // Add product to wishlist
  const addToWishlist = useCallback((product: Product) => {
    if (isInWishlist(product.id)) return;

    if (items.length >= MAX_WISHLIST_ITEMS) {
      setError(`Wishlist is full (max ${MAX_WISHLIST_ITEMS} items)`);
      return;
    }

    const newItem: WishlistItem = {
      productId: product.id,
      addedAt: new Date(),
    };

    setItems(prev => [newItem, ...prev]);
    setProducts(prev => [product, ...prev]);
    setError(null);
  }, [items.length, isInWishlist]);

  // Remove product from wishlist
  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
    setProducts(prev => prev.filter(product => product.id !== productId));
    setError(null);
  }, []);

  // Toggle product in wishlist
  const toggleWishlist = useCallback((product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setItems([]);
    setProducts([]);
    setError(null);
  }, []);

  const value: WishlistContextValue = {
    items,
    products,
    loading,
    error,
    itemCount: items.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

// =============================================================================
// Wishlist Button Component
// =============================================================================

interface WishlistButtonProps {
  product: Product;
  variant?: 'icon' | 'button';
  className?: string;
  showCount?: boolean;
}

export function WishlistButton({ 
  product, 
  variant = 'icon',
  className = '',
  showCount = false 
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, itemCount } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
          inWishlist 
            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${className}`}
      >
        <svg 
          className={`w-5 h-5 transition-transform ${isAnimating ? 'scale-125' : 'scale-100'}`}
          viewBox="0 0 24 24" 
          fill={inWishlist ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>{inWishlist ? 'Saved' : 'Save'}</span>
        {showCount && itemCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
            {itemCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all ${
        inWishlist 
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
      } ${className}`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg 
        className={`w-5 h-5 transition-transform ${isAnimating ? 'scale-125' : 'scale-100'}`}
        viewBox="0 0 24 24" 
        fill={inWishlist ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
