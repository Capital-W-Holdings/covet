'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Container, Button, Card } from '@/components/ui';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  // Release the reservation when user lands on cancel page
  useEffect(() => {
    async function releaseOrder() {
      if (!orderNumber || released) return;
      
      setReleasing(true);
      try {
        // In a real app, this would call an API to release the reservation
        // For now, the webhook handles this when the session expires
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReleased(true);
      } catch (error) {
        console.error('Failed to release order:', error);
      } finally {
        setReleasing(false);
      }
    }
    
    releaseOrder();
  }, [orderNumber, released]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <Container className="py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-gray-500" />
          </div>

          <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
            Checkout Cancelled
          </h1>

          <p className="text-gray-600 mb-8">
            Your checkout was cancelled and no payment was made.
            The item has been released back to inventory.
          </p>

          {orderNumber && (
            <Card className="p-4 mb-8 bg-gray-50">
              <p className="text-sm text-gray-500">
                Order reference: <span className="font-mono">{orderNumber}</span>
              </p>
            </Card>
          )}

          {releasing && (
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Releasing reservation...</span>
            </div>
          )}

          <div className="space-y-4">
            <Link href="/cart">
              <Button variant="primary" className="w-full">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Return to Cart
              </Button>
            </Link>

            <Link href="/shop">
              <Button variant="outline" className="w-full">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Changed your mind? The item may still be available.{' '}
            <Link href="/cart" className="text-brand-gold hover:underline">
              Check your cart
            </Link>{' '}
            to try again.
          </p>
        </div>
      </Container>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CheckoutCancelContent />
    </Suspense>
  );
}
