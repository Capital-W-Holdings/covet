// Review and Dispute Types for Phase 3

export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  FLAGGED = 'FLAGGED',
  REMOVED = 'REMOVED',
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  storeId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  images?: string[];
  status: ReviewStatus;
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewDTO {
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Disputes
export enum DisputeStatus {
  OPEN = 'OPEN',
  SELLER_RESPONSE = 'SELLER_RESPONSE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DisputeReason {
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  AUTHENTICATION_CONCERN = 'AUTHENTICATION_CONCERN',
  DAMAGED_IN_SHIPPING = 'DAMAGED_IN_SHIPPING',
  NOT_RECEIVED = 'NOT_RECEIVED',
  WRONG_ITEM = 'WRONG_ITEM',
  OTHER = 'OTHER',
}

export enum DisputeResolution {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  RETURN_AND_REFUND = 'RETURN_AND_REFUND',
  REPLACEMENT = 'REPLACEMENT',
  NO_ACTION = 'NO_ACTION',
  BUYER_WITHDREW = 'BUYER_WITHDREW',
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderName: string;
  senderRole: 'BUYER' | 'SELLER' | 'ADMIN';
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  storeId: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  messages: DisputeMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDisputeDTO {
  orderId: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
}

export interface DisputeResponseDTO {
  message: string;
  attachments?: string[];
}

// Trust Score Components
export interface TrustScoreFactors {
  reviewScore: number; // 0-25 points based on avg rating
  disputeScore: number; // 0-25 points based on dispute rate
  fulfillmentScore: number; // 0-25 points based on ship time
  volumeScore: number; // 0-25 points based on completed orders
}

export interface StoreTrustProfile {
  storeId: string;
  trustScore: number; // 0-100
  factors: TrustScoreFactors;
  totalOrders: number;
  totalDisputes: number;
  disputeRate: number;
  averageRating: number;
  totalReviews: number;
  averageShipDays: number;
  badges: string[];
  lastCalculated: Date;
}
