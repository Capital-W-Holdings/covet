import { db } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import type {
  SupportTicket,
  TicketMessage,
  CreateTicketDTO,
  TicketReplyDTO,
  UpdateTicketDTO,
} from '@/types/support';
import { TicketStatus, TicketPriority } from '@/types/support';

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

export const supportRepository = {
  async create(
    dto: CreateTicketDTO,
    userId: string,
    userEmail: string,
    userName: string
  ): Promise<SupportTicket> {
    await db.seed();

    const ticket: SupportTicket = {
      id: uuid(),
      ticketNumber: generateTicketNumber(),
      userId,
      userEmail,
      userName,
      category: dto.category,
      subject: dto.subject,
      description: dto.description,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      orderId: dto.orderId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.supportTickets.create(ticket);
    return ticket;
  },

  async findById(id: string): Promise<SupportTicket | undefined> {
    await db.seed();
    return db.supportTickets.findById(id);
  },

  async findByTicketNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    await db.seed();
    return db.supportTickets.findOne((t) => t.ticketNumber === ticketNumber);
  },

  async findByUserId(userId: string): Promise<SupportTicket[]> {
    await db.seed();
    return db.supportTickets
      .findMany((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findAll(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
  }): Promise<SupportTicket[]> {
    await db.seed();

    let tickets = db.supportTickets.findAll();

    if (filters?.status) {
      tickets = tickets.filter((t) => t.status === filters.status);
    }
    if (filters?.priority) {
      tickets = tickets.filter((t) => t.priority === filters.priority);
    }
    if (filters?.assignedTo) {
      tickets = tickets.filter((t) => t.assignedTo === filters.assignedTo);
    }

    return tickets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async addMessage(
    ticketId: string,
    dto: TicketReplyDTO,
    senderId: string,
    senderName: string,
    senderRole: 'USER' | 'ADMIN'
  ): Promise<SupportTicket | undefined> {
    await db.seed();

    const ticket = db.supportTickets.findById(ticketId);
    if (!ticket) return undefined;

    const message: TicketMessage = {
      id: uuid(),
      ticketId,
      senderId,
      senderName,
      senderRole,
      message: dto.message,
      attachments: dto.attachments,
      createdAt: new Date(),
    };

    const updatedMessages = [...ticket.messages, message];

    // Update status based on who replied
    let newStatus = ticket.status;
    if (senderRole === 'ADMIN' && ticket.status === TicketStatus.OPEN) {
      newStatus = TicketStatus.IN_PROGRESS;
    } else if (senderRole === 'ADMIN') {
      newStatus = TicketStatus.AWAITING_CUSTOMER;
    } else if (senderRole === 'USER' && ticket.status === TicketStatus.AWAITING_CUSTOMER) {
      newStatus = TicketStatus.IN_PROGRESS;
    }

    return db.supportTickets.update(ticketId, {
      messages: updatedMessages,
      status: newStatus,
      updatedAt: new Date(),
    });
  },

  async update(ticketId: string, dto: UpdateTicketDTO): Promise<SupportTicket | undefined> {
    await db.seed();

    const updates: Partial<SupportTicket> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.status === TicketStatus.RESOLVED || dto.status === TicketStatus.CLOSED) {
      updates.resolvedAt = new Date();
    }

    return db.supportTickets.update(ticketId, updates);
  },

  async getStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    awaitingCustomer: number;
    resolved: number;
  }> {
    await db.seed();
    const tickets = db.supportTickets.findAll();

    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
      awaitingCustomer: tickets.filter((t) => t.status === TicketStatus.AWAITING_CUSTOMER).length,
      resolved: tickets.filter(
        (t) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED
      ).length,
    };
  },
};
