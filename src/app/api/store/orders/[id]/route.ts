import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeRepository, orderRepository, userRepository, productRepository } from '@/lib/repositories';
import { updateOrderSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { UserRole, OrderStatus } from '@/types';
import { sendShippingConfirmation, sendDeliveryConfirmation } from '@/lib/email/notifications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/store/orders/[id] - Get single order
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { id } = await params;
    const order = await orderRepository.findById(id);

    if (!order || order.storeId !== store.id) {
      throw new NotFoundError('Order');
    }

    return createSuccessResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/store/orders/[id] - Update order (ship, etc.)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { id } = await params;
    const order = await orderRepository.findById(id);

    if (!order || order.storeId !== store.id) {
      throw new NotFoundError('Order');
    }

    const body = await request.json();

    // Validate input
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Get buyer and product info for emails
    const buyer = await userRepository.findById(order.buyerId);
    const product = await productRepository.findById(order.item.productId);

    // Handle shipping
    if (parsed.data.status === OrderStatus.SHIPPED && parsed.data.trackingNumber) {
      const updated = await orderRepository.markShipped(
        id,
        parsed.data.trackingNumber,
        parsed.data.carrier || 'Other'
      );

      // Send shipping confirmation email
      if (buyer?.email && updated && product) {
        sendShippingConfirmation(buyer.email, updated, {
          title: product.title,
          brand: product.brand,
          imageUrl: product.images[0]?.url,
        })
          .then((result: { success: boolean }) => {
            if (result.success) {
              console.log(`Shipping confirmation sent to: ${buyer.email}`);
            }
          })
          .catch((err: unknown) => console.error('Shipping email error:', err));
      }

      return createSuccessResponse(updated);
    }

    // Handle delivery
    if (parsed.data.status === OrderStatus.DELIVERED) {
      const updated = await orderRepository.markDelivered(id);

      // Send delivery confirmation email
      if (buyer?.email && updated && product) {
        sendDeliveryConfirmation(buyer.email, updated, {
          title: product.title,
          brand: product.brand,
          imageUrl: product.images[0]?.url,
        })
          .then((result: { success: boolean }) => {
            if (result.success) {
              console.log(`Delivery confirmation sent to: ${buyer.email}`);
            }
          })
          .catch((err: unknown) => console.error('Delivery email error:', err));
      }

      return createSuccessResponse(updated);
    }

    // General update
    const updated = await orderRepository.update(id, parsed.data);
    return createSuccessResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
