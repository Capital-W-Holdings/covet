'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product, ProductCategory } from '@/types';

// =============================================================================
// Constants
// =============================================================================

const RECENT_SEARCHES_KEY = 'covet_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const trendingSearches = [
  'Hermès Birkin',
  'Chanel Classic Flap',
  'Rolex Submariner',
  'Louis Vuitton Neverfull',
  'Cartier Love Bracelet',
];

const categoryQuickLinks: { label: string; category: ProductCategory }[] = [
  { label: 'Handbags', category: 'HANDBAGS' as ProductCategory },
  { label: 'Watches', category: 'WATCHES' as ProductCategory },
  { label: 'Jewelry', category: 'JEWELRY' as ProductCategory },
];

// =============================================================================
// Types
// =============================================================================

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  products: Product[];
  total: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(s => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// =============================================================================
// Component
// =============================================================================

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&pageSize=5`);
        const data = await res.json();
        if (data.success) {
          setResults({
            products: data.data.items,
            total: data.data.total,
          });
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveRecentSearch(searchQuery);
    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    onClose();
  }, [router, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results?.products.length || 0;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results?.products[selectedIndex]) {
        router.push(`/products/${results.products[selectedIndex].sku}`);
        onClose();
      } else {
        handleSearch(query);
      }
    }
  };

  // Handle quick link click
  const handleQuickLink = (category: ProductCategory) => {
    router.push(`/shop?category=${category}`);
    onClose();
  };

  // Clear recent searches
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-auto mt-4 md:mt-20 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for brands, products, or styles..."
              className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            {query && !loading && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full md:hidden"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Results / Suggestions */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Search Results */}
            {query && results && results.products.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </p>
                {results.products.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      saveRecentSearch(query);
                      router.push(`/products/${product.sku}`);
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                      selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-gold uppercase tracking-wider">
                        {product.brand}
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(product.priceCents)}
                    </span>
                  </button>
                ))}

                {results.total > 5 && (
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm text-brand-gold hover:bg-gray-50 rounded-lg"
                  >
                    View all {results.total} results
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* No Results */}
            {query && results && results.products.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-2">No products found for "{query}"</p>
                <p className="text-sm text-gray-400">Try a different search term or browse categories</p>
              </div>
            )}

            {/* Empty State - Recent & Trending */}
            {!query && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recent
                      </p>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Trending Searches */}
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trending
                  </p>
                  {trendingSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-brand-gold" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>

                {/* Quick Category Links */}
                <div className="p-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Browse Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categoryQuickLinks.map((link) => (
                      <button
                        key={link.category}
                        onClick={() => handleQuickLink(link.category)}
                        className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="hidden md:flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↵</kbd> to search</span>
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↑↓</kbd> to navigate</span>
            </div>
            <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Search Trigger Component
// =============================================================================

interface SearchTriggerProps {
  className?: string;
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'p-2 text-gray-600 hover:text-brand-charcoal transition-colors',
          className
        )}
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
