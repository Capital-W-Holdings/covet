'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Container, Button, Card, EmptyState } from '@/components/ui';
import { useCart, useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { item, removeFromCart, loading, error, refreshCart } = useCart();
  const { user } = useAuth();

  // Refresh cart on page load to check availability
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </Container>
      </div>
    );
  }

  // Show error if item was in cart but no longer available
  if (error && !item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <EmptyState
            icon={<AlertCircle className="w-16 h-16 text-amber-500" />}
            title="Item No Longer Available"
            description={error}
            action={
              <Link href="/shop">
                <Button>
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            }
          />
        </Container>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <EmptyState
            icon={<ShoppingBag className="w-16 h-16" />}
            title="Your cart is empty"
            description="Discover our collection of authenticated luxury pieces"
            action={
              <Link href="/shop">
                <Button>
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            }
          />
        </Container>
      </div>
    );
  }

  const subtotal = item.priceCents;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Check if item might be stale (added more than 1 hour ago)
  const isStale = item.reservedUntil && new Date(item.reservedUntil) < new Date();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    
    // Refresh cart to verify item is still available before checkout
    await refreshCart();
    
    // If still have item after refresh, proceed to checkout
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Availability Warning */}
            {isStale && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 font-medium">
                    This item may no longer be available
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    This item has been in your cart for a while. We recommend completing your purchase soon.
                  </p>
                </div>
                <button
                  onClick={() => refreshCart()}
                  className="text-amber-600 hover:text-amber-800 transition-colors"
                  title="Check availability"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <Card className="p-6">
              <div className="flex gap-4">
                {/* Image */}
                <Link href={`/products/${item.sku}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
                    {item.images[0] ? (
                      <Image
                        src={item.images[0].url}
                        alt={item.images[0].alt}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-brand-gold uppercase tracking-wider mb-1">
                    {item.brand}
                  </p>
                  <Link href={`/products/${item.sku}`}>
                    <h3 className="font-medium text-gray-900 hover:text-brand-gold transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.condition.replace(/_/g, ' ')}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(item.priceCents)}
                    </span>
                    <button
                      onClick={removeFromCart}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={handleCheckout}
                className="w-full mb-4"
              >
                {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>

              <hr className="my-6 border-gray-200" />

              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Free insured shipping
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  14-day return policy
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  100% authenticity guaranteed
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8">
          <Link href="/shop" className="inline-flex items-center text-brand-gold hover:underline">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Continue Shopping
          </Link>
        </div>
      </Container>
    </div>
  );
}
