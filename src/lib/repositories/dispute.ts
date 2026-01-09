import { db } from '@/lib/db';
import type { Result, Order } from '@/types';
import type { Dispute, CreateDisputeDTO, DisputeMessage, DisputeResolution } from '@/types/review';
import { DisputeStatus, DisputeReason, OrderStatus } from '@/types';
import { v4 as uuid } from 'uuid';

export const disputeRepository = {
  async findById(id: string): Promise<Dispute | undefined> {
    await db.seed();
    return db.disputes.findById(id);
  },

  async findByOrderId(orderId: string): Promise<Dispute | undefined> {
    await db.seed();
    return db.disputes.findOne((d) => d.orderId === orderId);
  },

  async findByBuyerId(buyerId: string): Promise<Dispute[]> {
    await db.seed();
    return db.disputes
      .findMany((d) => d.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findBySellerId(sellerId: string): Promise<Dispute[]> {
    await db.seed();
    return db.disputes
      .findMany((d) => d.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findByStoreId(storeId: string): Promise<Dispute[]> {
    await db.seed();
    return db.disputes
      .findMany((d) => d.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findAll(status?: DisputeStatus): Promise<Dispute[]> {
    await db.seed();
    let disputes = db.disputes.findAll();
    if (status) {
      disputes = disputes.filter((d) => d.status === status);
    }
    return disputes.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async create(
    buyerId: string,
    order: Order,
    dto: CreateDisputeDTO
  ): Promise<Result<Dispute, Error>> {
    await db.seed();

    // Check if dispute already exists
    const existing = await this.findByOrderId(dto.orderId);
    if (existing) {
      return { success: false, error: new Error('Dispute already exists for this order') };
    }

    // Validate order status (can dispute after shipped)
    const validStatuses = [OrderStatus.SHIPPED, OrderStatus.DELIVERED];
    if (!validStatuses.includes(order.status)) {
      return { success: false, error: new Error('Can only dispute shipped or delivered orders') };
    }

    // Check dispute deadline (if order is delivered)
    if (order.status === OrderStatus.DELIVERED && order.disputeDeadline) {
      if (new Date() > new Date(order.disputeDeadline)) {
        return { 
          success: false, 
          error: new Error('Dispute window has closed. Disputes must be filed within 14 days of delivery.') 
        };
      }
    }

    // Get seller info
    const store = db.stores.findById(order.storeId);
    if (!store) {
      return { success: false, error: new Error('Store not found') };
    }

    const dispute: Dispute = {
      id: uuid(),
      orderId: order.id,
      buyerId,
      sellerId: store.ownerId,
      storeId: order.storeId,
      reason: dto.reason,
      description: dto.description,
      evidence: dto.evidence,
      status: DisputeStatus.OPEN,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.disputes.create(dispute);
    return { success: true, data: dispute };
  },

  async addMessage(
    disputeId: string,
    senderId: string,
    senderName: string,
    senderRole: 'BUYER' | 'SELLER' | 'ADMIN',
    message: string,
    attachments?: string[]
  ): Promise<Dispute | undefined> {
    await db.seed();
    const dispute = await this.findById(disputeId);
    if (!dispute) return undefined;

    const newMessage: DisputeMessage = {
      id: uuid(),
      disputeId,
      senderId,
      senderName,
      senderRole,
      message,
      attachments,
      createdAt: new Date(),
    };

    // Update status if seller responds
    const newStatus = senderRole === 'SELLER' 
      ? DisputeStatus.SELLER_RESPONSE 
      : dispute.status;

    return db.disputes.update(disputeId, {
      messages: [...dispute.messages, newMessage],
      status: newStatus,
    });
  },

  async updateStatus(id: string, status: DisputeStatus): Promise<Dispute | undefined> {
    await db.seed();
    return db.disputes.update(id, { status });
  },

  async resolve(
    id: string,
    resolution: DisputeResolution,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<Dispute | undefined> {
    await db.seed();
    return db.disputes.update(id, {
      status: DisputeStatus.RESOLVED,
      resolution,
      resolvedBy,
      resolutionNotes,
      resolvedAt: new Date(),
    });
  },

  async getOpenCount(): Promise<number> {
    await db.seed();
    return db.disputes.count((d) => 
      d.status === DisputeStatus.OPEN || d.status === DisputeStatus.SELLER_RESPONSE
    );
  },

  async getStoreDisputeRate(storeId: string): Promise<number> {
    await db.seed();
    const orders = db.orders.findMany((o) => o.storeId === storeId);
    const disputes = db.disputes.findMany((d) => d.storeId === storeId);
    
    if (orders.length === 0) return 0;
    return (disputes.length / orders.length) * 100;
  },
};
