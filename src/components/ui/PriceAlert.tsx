'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Loader2, Users, TrendingDown } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';

// =============================================================================
// Price Alert Button - Triggers the modal
// =============================================================================

interface PriceAlertButtonProps {
  product: Product;
  variant?: 'icon' | 'button';
  className?: string;
}

export function PriceAlertButton({
  product,
  variant = 'icon',
  className,
}: PriceAlertButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasAlertForProduct, deleteAlert } = usePriceAlerts();
  const { user } = useAuth();
  const hasAlert = hasAlertForProduct(product.id);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (hasAlert) {
      // Remove existing alert
      await deleteAlert(product.id);
    } else {
      // Open modal to set target price
      setIsModalOpen(true);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'p-2 rounded-full transition-all',
            hasAlert
              ? 'bg-brand-gold text-white hover:bg-brand-gold/90'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-brand-gold',
            className
          )}
          aria-label={hasAlert ? 'Remove price alert' : 'Set price alert'}
          title={hasAlert ? 'Remove price alert' : 'Set price alert'}
        >
          {hasAlert ? (
            <Bell className="w-5 h-5 fill-current" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </button>

        <PriceAlertModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          hasAlert
            ? 'bg-brand-gold text-white hover:bg-brand-gold/90'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          className
        )}
      >
        {hasAlert ? (
          <>
            <BellOff className="w-4 h-4" />
            Remove Alert
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Price Alert
          </>
        )}
      </button>

      <PriceAlertModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// =============================================================================
// Price Alert Modal
// =============================================================================

interface PriceAlertModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceAlertModal({ product, isOpen, onClose }: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { createAlert } = usePriceAlerts();

  // Suggested price drops
  const suggestions = [
    { label: '10% off', value: Math.round(product.priceCents * 0.9) },
    { label: '20% off', value: Math.round(product.priceCents * 0.8) },
    { label: '30% off', value: Math.round(product.priceCents * 0.7) },
  ];

  // Initialize with 10% off suggestion
  useEffect(() => {
    if (isOpen && !targetPrice) {
      setTargetPrice((suggestions[0].value / 100).toFixed(2));
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceCents = Math.round(parseFloat(targetPrice) * 100);

    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (priceCents >= product.priceCents) {
      setError('Target price must be less than current price');
      return;
    }

    setLoading(true);

    const result = await createAlert(product.id, priceCents);

    if (result.success) {
      onClose();
      setTargetPrice('');
    } else {
      setError(result.error || 'Failed to create alert');
    }

    setLoading(false);
  };

  const handleSuggestionClick = (value: number) => {
    setTargetPrice((value / 100).toFixed(2));
    setError(null);
  };

  if (!isOpen) return null;

  // Mock watcher count
  const watcherCount = Math.floor(Math.random() * 20) + 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-gold" />
            <h2 className="text-lg font-medium text-gray-900">Set Price Alert</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            {product.images[0] && (
              <img
                src={product.images[0].url}
                alt={product.images[0].alt}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brand-gold font-medium uppercase">
                {product.brand}
              </p>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {product.title}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(product.priceCents)}
              </p>
            </div>
          </div>

          {/* Watcher Count */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{watcherCount} people watching this item</span>
          </div>

          {/* Target Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notify me when price drops to
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={targetPrice}
                onChange={(e) => {
                  setTargetPrice(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className={cn(
                  'w-full pl-7 pr-4 py-3 border rounded-lg text-lg font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold',
                  error ? 'border-red-300' : 'border-gray-300'
                )}
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick select:</p>
            <div className="flex gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors',
                    parseFloat(targetPrice) === suggestion.value / 100
                      ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {suggestion.label}
                  </div>
                  <div className="text-xs opacity-70">
                    {formatPrice(suggestion.value)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500">
            We'll send you an email notification when the price drops to your target or below.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !targetPrice}
            className={cn(
              'w-full py-3 rounded-lg font-medium text-white transition-colors',
              'bg-brand-gold hover:bg-brand-gold/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Alert...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                Set Price Alert
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Price Alert Badge - Shows on product cards when user has alert
// =============================================================================

interface PriceAlertBadgeProps {
  productId: string;
  className?: string;
}

export function PriceAlertBadge({ productId, className }: PriceAlertBadgeProps) {
  const { hasAlertForProduct, getAlertForProduct } = usePriceAlerts();
  
  if (!hasAlertForProduct(productId)) return null;

  const alert = getAlertForProduct(productId);
  if (!alert) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 bg-brand-gold text-white text-xs font-medium rounded',
        className
      )}
    >
      <Bell className="w-3 h-3" />
      <span>Alert: {formatPrice(alert.targetPriceCents)}</span>
    </div>
  );
}
