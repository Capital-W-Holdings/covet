import { db } from '@/lib/db';
import type { Order, CreateOrderDTO, UpdateOrderDTO, Product, Result } from '@/types';
import { OrderStatus, PaymentStatus, ProductStatus } from '@/types';
import { v4 as uuid } from 'uuid';
import { generateOrderNumber, calculatePlatformFee } from '@/lib/utils';
import { productRepository } from './product';
import { storeRepository } from './store';

const SHIPPING_CENTS = 0; // Free shipping
const TAX_RATE = 0; // Simplified - no tax calculation

export const orderRepository = {
  async findById(id: string): Promise<Order | undefined> {
    await db.seed();
    return db.orders.findById(id);
  },

  async findByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    await db.seed();
    return db.orders.findOne((o) => o.orderNumber === orderNumber);
  },

  async findByBuyerId(buyerId: string): Promise<Order[]> {
    await db.seed();
    return db.orders
      .findMany((o) => o.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findByStoreId(storeId: string): Promise<Order[]> {
    await db.seed();
    return db.orders
      .findMany((o) => o.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(
    buyerId: string,
    dto: CreateOrderDTO,
    product: Product,
    paymentIntentId?: string
  ): Promise<Result<Order>> {
    await db.seed();

    const store = await storeRepository.findById(product.storeId);
    if (!store) {
      return { success: false, error: new Error('Store not found') };
    }

    const subtotalCents = product.priceCents;
    const shippingCents = SHIPPING_CENTS;
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + shippingCents + taxCents;
    const platformFeeCents = calculatePlatformFee(subtotalCents, store.takeRate);

    const order: Order = {
      id: uuid(),
      orderNumber: generateOrderNumber(),
      buyerId,
      storeId: product.storeId,
      item: {
        productId: product.id,
        productTitle: product.title,
        productSku: product.sku,
        priceCents: product.priceCents,
        imageUrl: product.images[0]?.url,
      },
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      platformFeeCents,
      status: OrderStatus.PENDING,
      paymentStatus: paymentIntentId ? PaymentStatus.AUTHORIZED : PaymentStatus.PENDING,
      paymentIntentId,
      shipping: {
        address: dto.shippingAddress,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.orders.create(order);

    // Mark product as sold
    await productRepository.markSold(product.id);

    return { success: true, data: order };
  },

  async update(id: string, dto: UpdateOrderDTO): Promise<Order | undefined> {
    await db.seed();
    const updates: Partial<Order> = {};

    if (dto.status) {
      updates.status = dto.status;
    }

    if (dto.paymentIntentId !== undefined) {
      updates.paymentIntentId = dto.paymentIntentId;
    }

    if (dto.platformFeeCents !== undefined) {
      updates.platformFeeCents = dto.platformFeeCents;
    }

    if (dto.trackingNumber || dto.carrier) {
      const existing = db.orders.findById(id);
      if (existing) {
        updates.shipping = {
          ...existing.shipping,
          trackingNumber: dto.trackingNumber || existing.shipping.trackingNumber,
          carrier: dto.carrier || existing.shipping.carrier,
          shippedAt: dto.trackingNumber ? new Date() : existing.shipping.shippedAt,
        };
      }
    }

    if (dto.notes !== undefined) {
      updates.notes = dto.notes;
    }

    return db.orders.update(id, updates);
  },

  async markShipped(id: string, trackingNumber: string, carrier: string): Promise<Order | undefined> {
    await db.seed();
    const order = db.orders.findById(id);
    if (!order) return undefined;

    return db.orders.update(id, {
      status: OrderStatus.SHIPPED,
      shipping: {
        ...order.shipping,
        trackingNumber,
        carrier,
        shippedAt: new Date(),
      },
    });
  },

  async markDelivered(id: string): Promise<Order | undefined> {
    await db.seed();
    const order = db.orders.findById(id);
    if (!order) return undefined;

    const deliveredAt = new Date();
    // Dispute window: 14 days after delivery
    const disputeDeadline = new Date(deliveredAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    return db.orders.update(id, {
      status: OrderStatus.DELIVERED,
      shipping: {
        ...order.shipping,
        deliveredAt,
      },
      disputeDeadline,
    });
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order | undefined> {
    await db.seed();
    const updates: Partial<Order> = { paymentStatus };

    if (paymentStatus === PaymentStatus.CAPTURED) {
      updates.status = OrderStatus.CONFIRMED;
    } else if (paymentStatus === PaymentStatus.FAILED) {
      updates.status = OrderStatus.CANCELLED;
      // Release the product back
      const order = db.orders.findById(id);
      if (order) {
        await productRepository.update(order.item.productId, { status: ProductStatus.ACTIVE });
      }
    }

    return db.orders.update(id, updates);
  },

  async getStats(storeId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    shippedOrders: number;
  }> {
    await db.seed();
    const orders = storeId
      ? db.orders.findMany((o) => o.storeId === storeId)
      : db.orders.all();

    return {
      totalOrders: orders.length,
      totalRevenue: orders
        .filter((o) => o.paymentStatus === PaymentStatus.CAPTURED)
        .reduce((sum, o) => sum + o.totalCents, 0),
      pendingOrders: orders.filter((o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED).length,
      shippedOrders: orders.filter((o) => o.status === OrderStatus.SHIPPED).length,
    };
  },
};
