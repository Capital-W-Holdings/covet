import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { productRepository, orderRepository, storeRepository } from '@/lib/repositories';
import { createOrderSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, NotFoundError, ConflictError } from '@/lib/errors';
import { PaymentStatus, OrderStatus } from '@/types';
import { createCheckoutSession, isStripeDemo, calculatePlatformFee } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError('Please sign in to checkout');
    }

    const body = await request.json();

    // Validate input
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Get product (just to verify it exists)
    const product = await productRepository.findById(parsed.data.productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    // ATOMIC RESERVE - prevents double-sell race condition
    // This must happen BEFORE creating the order
    const reserveResult = await productRepository.reserveAtomic(
      parsed.data.productId,
      session.userId,
      15 // 15 minute reservation for checkout completion
    );

    if (!reserveResult.success) {
      throw new ConflictError(reserveResult.error || 'Unable to reserve product');
    }

    // Re-fetch product after reservation to get latest state
    const reservedProduct = await productRepository.findById(parsed.data.productId);
    if (!reservedProduct) {
      throw new NotFoundError('Product');
    }

    // Get store for fee calculation
    const store = await storeRepository.findById(reservedProduct.storeId);
    const storeType = store?.type || 'PARTNER';
    const platformFeeCents = calculatePlatformFee(reservedProduct.priceCents, storeType);

    // Create order with PENDING payment status
    const result = await orderRepository.create(
      session.userId,
      parsed.data,
      reservedProduct,
      undefined // Payment intent will be set after Stripe session
    );

    if (!result.success) {
      // Release reservation on order creation failure
      await productRepository.releaseReservation(parsed.data.productId);
      throw new ValidationError(result.error.message);
    }

    const order = result.data;

    // Create Stripe checkout session
    const checkoutResult = await createCheckoutSession({
      productId: reservedProduct.id,
      productTitle: `${reservedProduct.brand} - ${reservedProduct.title}`,
      productDescription: reservedProduct.description.substring(0, 500),
      productImageUrl: reservedProduct.images[0]?.url,
      priceCents: reservedProduct.priceCents,
      orderId: order.id,
      orderNumber: order.orderNumber,
      buyerEmail: session.email,
      buyerId: session.userId,
      storeId: reservedProduct.storeId,
      metadata: {
        sku: reservedProduct.sku,
        platformFeeCents: platformFeeCents.toString(),
      },
    });

    if (!checkoutResult.success) {
      // Release reservation and cancel order on Stripe failure
      await productRepository.releaseReservation(parsed.data.productId);
      await orderRepository.update(order.id, { status: OrderStatus.CANCELLED });
      throw new ValidationError(checkoutResult.error || 'Failed to create payment session');
    }

    // Update order with Stripe session info
    await orderRepository.update(order.id, {
      paymentIntentId: checkoutResult.sessionId,
      platformFeeCents,
    });

    // In demo mode, simulate immediate payment success
    if (isStripeDemo()) {
      await orderRepository.updatePaymentStatus(order.id, PaymentStatus.CAPTURED);
      await productRepository.markSold(reservedProduct.id);
    }

    return createSuccessResponse({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
      sessionId: checkoutResult.sessionId,
      checkoutUrl: checkoutResult.checkoutUrl,
      isDemo: isStripeDemo(),
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
