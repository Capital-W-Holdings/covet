/**
 * Stripe Payment Integration
 * 
 * This module provides server-side Stripe functionality for:
 * - Creating checkout sessions
 * - Processing webhooks
 * - Managing payment intents
 * - Connect payouts (future)
 * 
 * Required environment variables:
 * - STRIPE_SECRET_KEY: Your Stripe secret key (sk_test_... or sk_live_...)
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret (whsec_...)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Publishable key for client
 * - NEXT_PUBLIC_APP_URL: Your app URL for redirects
 */

import Stripe from 'stripe';

// Validate required environment variables
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    // In development, allow demo mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ STRIPE_SECRET_KEY not set - running in demo mode');
      return 'sk_test_demo_mode';
    }
    throw new Error('STRIPE_SECRET_KEY is required in production');
  }
  
  return key;
}

// Create Stripe instance (lazy initialization)
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = getStripeSecretKey();
    
    // In demo mode, return a mock-like instance
    if (secretKey === 'sk_test_demo_mode') {
      // We'll handle demo mode in the individual functions
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
        typescript: true,
      });
    } else {
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
        typescript: true,
      });
    }
  }
  
  return stripeInstance;
}

// Check if we're in demo mode
export function isStripeDemo(): boolean {
  return !process.env.STRIPE_SECRET_KEY || 
         process.env.STRIPE_SECRET_KEY === 'sk_test_demo_mode';
}

// Get the app URL for redirects
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// Types for checkout
export interface CreateCheckoutParams {
  productId: string;
  productTitle: string;
  productDescription: string;
  productImageUrl?: string;
  priceCents: number;
  orderId: string;
  orderNumber: string;
  buyerEmail: string;
  buyerId: string;
  storeId: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  // Demo mode - return fake success
  if (isStripeDemo()) {
    console.log('📦 Demo mode: Simulating Stripe checkout for order', params.orderNumber);
    return {
      success: true,
      sessionId: `demo_session_${params.orderId}`,
      checkoutUrl: `${getAppUrl()}/checkout/success?order=${params.orderNumber}&demo=true`,
    };
  }

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: params.buyerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: params.priceCents,
            product_data: {
              name: params.productTitle,
              description: params.productDescription,
              images: params.productImageUrl ? [params.productImageUrl] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        productId: params.productId,
        buyerId: params.buyerId,
        storeId: params.storeId,
        ...params.metadata,
      },
      success_url: `${appUrl}/checkout/success?order=${params.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel?order=${params.orderNumber}`,
      // Enable shipping address collection
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      // Expire session after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return {
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url || undefined,
    };
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  if (isStripeDemo()) {
    return null;
  }

  try {
    const stripe = getStripe();
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return null;
  }

  try {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Create a refund
 */
export async function createRefund(
  paymentIntentId: string,
  amountCents?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  if (isStripeDemo()) {
    return {
      success: true,
      refundId: `demo_refund_${Date.now()}`,
    };
  }

  try {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
      reason,
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    console.error('Refund error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create refund',
    };
  }
}

/**
 * Calculate platform fee
 * Platform takes 6% for flagship store, 10% for partner stores
 */
export function calculatePlatformFee(
  amountCents: number,
  storeType: 'COVET_FLAGSHIP' | 'PARTNER'
): number {
  const rate = storeType === 'COVET_FLAGSHIP' ? 0.06 : 0.10;
  return Math.round(amountCents * rate);
}

/**
 * Format amount for display
 */
export function formatStripeAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
