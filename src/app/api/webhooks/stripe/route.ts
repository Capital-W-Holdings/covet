import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { orderRepository, productRepository, userRepository, storeRepository } from '@/lib/repositories';
import { PaymentStatus, OrderStatus } from '@/types';
import { sendOrderConfirmation, sendSellerOrderNotification } from '@/lib/email/notifications';

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Webhook: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);
    
    if (!event) {
      console.error('Webhook: Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Webhook: Received ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        await handleCheckoutExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        // Payment confirmation is handled in checkout.session.completed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        await handleRefund({
          id: charge.id,
          payment_intent: typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : charge.payment_intent?.id || null,
          refunded: charge.refunded,
          amount_refunded: charge.amount_refunded,
          metadata: charge.metadata as { orderId?: string } | null,
        });
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        console.log(`Dispute created for charge: ${dispute.charge}`);
        // TODO: Create internal dispute record, notify admin
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutComplete(session: {
  id: string;
  metadata?: { orderId?: string; productId?: string } | null;
  payment_intent?: string | { id: string } | null;
  payment_status?: string;
  customer_email?: string | null;
}) {
  const orderId = session.metadata?.orderId;
  const productId = session.metadata?.productId;
  
  if (!orderId) {
    console.error('Checkout complete: Missing orderId in metadata');
    return;
  }

  console.log(`Checkout complete for order: ${orderId}`);

  // Update order payment status
  const order = await orderRepository.findById(orderId);
  if (!order) {
    console.error(`Checkout complete: Order not found: ${orderId}`);
    return;
  }

  // Get payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id;

  // Update order to confirmed
  await orderRepository.update(order.id, {
    status: OrderStatus.CONFIRMED,
    paymentIntentId: paymentIntentId || session.id,
  });

  await orderRepository.updatePaymentStatus(order.id, PaymentStatus.CAPTURED);

  // Mark product as sold
  let product;
  if (productId) {
    product = await productRepository.findById(productId);
    await productRepository.markSold(productId);
    console.log(`Product marked as sold: ${productId}`);
  }

  // Send confirmation emails
  try {
    // Get buyer info
    const buyer = await userRepository.findById(order.buyerId);
    const buyerEmail = session.customer_email || buyer?.email;
    
    if (buyerEmail && product) {
      // Send buyer confirmation
      await sendOrderConfirmation(buyerEmail, order, {
        title: product.title,
        brand: product.brand,
        imageUrl: product.images[0]?.url,
        sku: product.sku,
      });
      console.log(`Order confirmation email sent to: ${buyerEmail}`);
    }

    // Send seller notification
    const store = await storeRepository.findById(order.storeId);
    if (store && product) {
      const seller = await userRepository.findById(store.ownerId);
      if (seller?.email) {
        await sendSellerOrderNotification(
          seller.email,
          order,
          {
            title: product.title,
            brand: product.brand,
            imageUrl: product.images[0]?.url,
            sku: product.sku,
          },
          buyer?.profile.name || 'Customer'
        );
        console.log(`Seller notification email sent to: ${seller.email}`);
      }
    }
  } catch (emailError) {
    // Don't fail the webhook if email fails
    console.error('Failed to send confirmation emails:', emailError);
  }

  console.log(`Order ${order.orderNumber} confirmed with payment`);
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutExpired(session: {
  id: string;
  metadata?: { orderId?: string; productId?: string } | null;
}) {
  const orderId = session.metadata?.orderId;
  const productId = session.metadata?.productId;

  if (!orderId) {
    console.error('Checkout expired: Missing orderId in metadata');
    return;
  }

  console.log(`Checkout expired for order: ${orderId}`);

  // Cancel the order
  const order = await orderRepository.findById(orderId);
  if (order && order.status === OrderStatus.PENDING) {
    await orderRepository.update(order.id, {
      status: OrderStatus.CANCELLED,
    });
    await orderRepository.updatePaymentStatus(order.id, PaymentStatus.FAILED);
  }

  // Release the product reservation
  if (productId) {
    await productRepository.releaseReservation(productId);
    console.log(`Product reservation released: ${productId}`);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: {
  id: string;
  metadata?: { orderId?: string; productId?: string } | null;
  last_payment_error?: { message?: string } | null;
}) {
  const orderId = paymentIntent.metadata?.orderId;
  const productId = paymentIntent.metadata?.productId;

  console.log(`Payment failed: ${paymentIntent.id}`);
  console.log(`Error: ${paymentIntent.last_payment_error?.message}`);

  if (orderId) {
    const order = await orderRepository.findById(orderId);
    if (order) {
      await orderRepository.updatePaymentStatus(order.id, PaymentStatus.FAILED);
    }
  }

  // Release reservation on payment failure
  if (productId) {
    await productRepository.releaseReservation(productId);
  }
}

/**
 * Handle refund
 */
async function handleRefund(charge: {
  id: string;
  payment_intent?: string | null;
  refunded: boolean;
  amount_refunded: number;
  metadata?: { orderId?: string } | null;
}) {
  console.log(`Refund processed for charge: ${charge.id}`);

  // Find order by payment intent
  // In a real app, you'd look up the order by payment_intent
  const orderId = charge.metadata?.orderId;
  
  if (orderId) {
    const order = await orderRepository.findById(orderId);
    if (order) {
      await orderRepository.update(order.id, {
        status: OrderStatus.REFUNDED,
      });
      await orderRepository.updatePaymentStatus(order.id, PaymentStatus.REFUNDED);
      console.log(`Order ${order.orderNumber} marked as refunded`);
    }
  }
}
