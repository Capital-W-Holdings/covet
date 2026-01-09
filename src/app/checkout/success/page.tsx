'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, AlertCircle } from 'lucide-react';
import { Container, Button, Card } from '@/components/ui';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const isDemo = searchParams.get('demo') === 'true';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <Container className="py-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Demo mode notice */}
          {isDemo && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm text-amber-800 font-medium">Demo Mode</p>
                <p className="text-xs text-amber-700 mt-1">
                  This is a simulated order. No payment was processed. 
                  Configure Stripe keys in production for real payments.
                </p>
              </div>
            </div>
          )}

          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>

          <p className="text-gray-600 mb-8">
            Your order has been confirmed and we&apos;re preparing it for shipment.
            You&apos;ll receive an email with tracking information once it ships.
          </p>

          {orderNumber && (
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-lg font-mono font-medium text-gray-900">
                    {orderNumber}
                  </p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </Card>
          )}

          <div className="space-y-4">
            <Link href="/account/orders">
              <Button variant="primary" className="w-full">
                View Order Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/shop">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-900 mb-4">What&apos;s Next?</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-brand-gold font-medium">1</span>
                </div>
                <p className="text-xs text-gray-600">Order Confirmed</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-500 font-medium">2</span>
                </div>
                <p className="text-xs text-gray-500">Processing</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-500 font-medium">3</span>
                </div>
                <p className="text-xs text-gray-500">Shipped</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
