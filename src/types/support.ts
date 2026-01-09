// Support ticket types

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_CUSTOMER = 'AWAITING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  ORDER_ISSUE = 'ORDER_ISSUE',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  RETURNS = 'RETURNS',
  AUTHENTICATION = 'AUTHENTICATION',
  ACCOUNT = 'ACCOUNT',
  SELLER_QUESTION = 'SELLER_QUESTION',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN';
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string;
  assignedToName?: string;
  orderId?: string;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface CreateTicketDTO {
  category: TicketCategory;
  subject: string;
  description: string;
  orderId?: string;
}

export interface TicketReplyDTO {
  message: string;
  attachments?: string[];
}

export interface UpdateTicketDTO {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
}

// FAQ types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  items: FAQItem[];
}
