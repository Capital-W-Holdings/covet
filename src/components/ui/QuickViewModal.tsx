'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Shield, Check, ExternalLink } from 'lucide-react';
import { Button, Badge, Spinner } from '@/components/ui';
import { ShareButton } from '@/components/ui/ShareButton';
import { PriceAlertButton } from '@/components/ui/PriceAlert';
import { WishlistButton } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import type { Product } from '@/types';
import { AuthenticationStatus, ProductCondition, ProductStatus } from '@/types';

// =============================================================================
// Types
// =============================================================================

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// Condition Labels
// =============================================================================

const conditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.NEW_WITH_TAGS]: 'New with Tags',
  [ProductCondition.NEW_WITHOUT_TAGS]: 'New',
  [ProductCondition.EXCELLENT]: 'Excellent',
  [ProductCondition.VERY_GOOD]: 'Very Good',
  [ProductCondition.GOOD]: 'Good',
  [ProductCondition.FAIR]: 'Fair',
};

// =============================================================================
// Component
// =============================================================================

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { addToCart, item: cartItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && product && product.images.length > 1) {
        setSelectedImageIndex(prev => 
          prev === 0 ? product.images.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight' && product && product.images.length > 1) {
        setSelectedImageIndex(prev => 
          prev === product.images.length - 1 ? 0 : prev + 1
        );
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
  }, [isOpen, onClose, product]);

  // Swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !product) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && product.images.length > 1) {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else if (isRightSwipe && product.images.length > 1) {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  }, [touchStart, touchEnd, product]);

  if (!isOpen || !product) return null;

  const isInCart = cartItem?.id === product.id;
  const isAvailable = product.status === ProductStatus.ACTIVE;
  const discount = product.originalPriceCents
    ? calculateDiscount(product.originalPriceCents, product.priceCents)
    : 0;

  const handleAddToCart = async () => {
    if (!isAvailable || isInCart) return;
    setIsAddingToCart(true);
    addToCart(product);
    setIsAddingToCart(false);
  };

  const handleViewDetails = () => {
    router.push(`/products/${product.sku}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Image Section */}
            <div 
              className="relative w-full md:w-1/2 bg-gray-50 flex-shrink-0"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Main Image */}
              <div className="relative aspect-square">
                {product.images[selectedImageIndex] ? (
                  <Image
                    src={product.images[selectedImageIndex].url}
                    alt={product.images[selectedImageIndex].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {/* Status overlay */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/90 rounded-lg font-medium text-gray-900">
                      {product.status === ProductStatus.SOLD ? 'Sold' : 'Unavailable'}
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.authenticationStatus === AuthenticationStatus.COVET_CERTIFIED && (
                    <Badge variant="gold" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Covet Certified
                    </Badge>
                  )}
                  {discount > 0 && isAvailable && (
                    <Badge variant="danger" className="text-xs">{discount}% Off</Badge>
                  )}
                </div>

                {/* Image Dots */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          selectedImageIndex === index
                            ? 'bg-white w-4'
                            : 'bg-white/50 hover:bg-white/70'
                        )}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails (hidden on mobile) */}
              {product.images.length > 1 && (
                <div className="hidden md:flex gap-2 p-3 overflow-x-auto bg-white border-t border-gray-100">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                        selectedImageIndex === index
                          ? 'border-brand-charcoal'
                          : 'border-transparent hover:border-gray-300'
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Brand */}
              <p className="text-xs font-medium text-brand-gold uppercase tracking-wider mb-1">
                {product.brand}
              </p>

              {/* Title */}
              <h2 className="text-xl lg:text-2xl font-medium text-gray-900 mb-3">
                {product.title}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-semibold text-gray-900">
                  {formatPrice(product.priceCents)}
                </span>
                {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.originalPriceCents)}
                  </span>
                )}
              </div>

              {/* Condition */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Condition</span>
                  <Badge>{conditionLabels[product.condition]}</Badge>
                </div>
              </div>

              {/* Description (truncated) */}
              <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                {product.description}
              </p>

              {/* Actions */}
              <div className="space-y-3">
                {isAvailable ? (
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={handleAddToCart}
                    loading={isAddingToCart}
                    disabled={isInCart}
                    className="w-full"
                  >
                    {isInCart ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        In Cart
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" disabled className="w-full">
                    {product.status === ProductStatus.SOLD ? 'Sold' : 'Unavailable'}
                  </Button>
                )}

                <div className="flex gap-3">
                  <WishlistButton product={product} variant="button" className="flex-1 justify-center" />
                  <PriceAlertButton product={product} variant="button" />
                  <ShareButton
                    url={`https://covet.com/products/${product.sku}`}
                    title={`${product.brand} - ${product.title}`}
                    description={product.description}
                    image={product.images[0]?.url}
                    variant="button"
                  />
                </div>

                <button
                  onClick={handleViewDetails}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-brand-gold hover:underline"
                >
                  View Full Details
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Hook for managing quick view state
// =============================================================================

import { createContext, useContext, ReactNode } from 'react';

interface QuickViewContextValue {
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
      {children}
      <QuickViewModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={closeQuickView} 
      />
    </QuickViewContext.Provider>
  );
}

export function useQuickView(): QuickViewContextValue {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
