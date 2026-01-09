'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Button, Input, Card, Skeleton } from '@/components/ui';
import { useCart, useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import type { Address } from '@/types';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { item, clearCart, loading: cartLoading, error: cartError, refreshCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [address, setAddress] = useState<Address>({
    id: '',
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });

  // Initialize address with user data once available
  useEffect(() => {
    if (user?.profile?.name && !initialized) {
      setAddress((prev) => ({ ...prev, name: user.profile.name }));
      setInitialized(true);
    }
  }, [user, initialized]);

  // Refresh cart on mount to verify availability
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Show loading skeleton while cart or auth is loading
  if (cartLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8 lg:py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-6" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-12 w-full" />
              </Card>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login?redirect=/checkout');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Redirect if cart is empty
  if (!item) {
    router.push('/cart');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show cart error if item became unavailable
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-medium text-gray-900 mb-2">
              Unable to Complete Checkout
            </h1>
            <p className="text-gray-600 mb-6">{cartError}</p>
            <Button onClick={() => router.push('/shop')}>
              Continue Shopping
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.id,
          shippingAddress: address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Clear cart before redirecting to payment
        clearCart();
        
        // In demo mode, redirect directly to success page
        // In production, redirect to Stripe Checkout
        if (data.data.checkoutUrl) {
          // External Stripe URL - use window.location for full redirect
          if (data.data.checkoutUrl.startsWith('https://checkout.stripe.com')) {
            window.location.href = data.data.checkoutUrl;
          } else {
            // Internal URL (demo mode or success page)
            router.push(data.data.checkoutUrl);
          }
        } else {
          // Fallback to order success page
          router.push(`/checkout/success?order=${data.data.order.orderNumber}`);
        }
      } else {
        // Handle specific error types
        if (data.error?.code === 'CONFLICT') {
          setError('This item is no longer available. Someone may have purchased it.');
        } else {
          setError(data.error?.message || 'Checkout failed. Please try again.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = item.priceCents;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Address</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={address.name}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Street Address"
                  name="street1"
                  value={address.street1}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Apt, Suite, etc. (optional)"
                  name="street2"
                  value={address.street2 || ''}
                  onChange={handleInputChange}
                  disabled={submitting}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    title="Enter a valid ZIP code (e.g., 12345 or 12345-6789)"
                  />
                  <Input
                    label="Phone (optional)"
                    name="phone"
                    type="tel"
                    value={address.phone || ''}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  loading={submitting}
                  className="w-full mt-6"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Complete Purchase'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this purchase, you agree to our{' '}
                  <a href="/terms" className="underline">Terms of Service</a> and{' '}
                  <a href="/privacy" className="underline">Privacy Policy</a>.
                </p>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

              {/* Item */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.images[0].alt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-brand-gold uppercase mb-1">
                    {item.brand}
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
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

              {/* Trust badges */}
              <div className="space-y-2 text-xs text-gray-500">
                <p>✓ 100% Authenticity Guaranteed</p>
                <p>✓ Free Insured Shipping</p>
                <p>✓ 14-Day Return Policy</p>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
