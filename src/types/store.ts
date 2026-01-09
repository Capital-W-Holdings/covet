// Store Application Types for Phase 2

export enum StoreApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_INFO = 'NEEDS_INFO',
}

export interface StoreApplication {
  id: string;
  userId: string;
  businessName: string;
  legalName: string;
  businessType: 'SOLE_PROPRIETOR' | 'LLC' | 'CORPORATION' | 'PARTNERSHIP';
  taxId?: string;
  website?: string;
  instagram?: string;
  description: string;
  yearsInBusiness: number;
  estimatedInventory: number;
  estimatedMonthlyGMV: number;
  categories: string[];
  hasPhysicalLocation: boolean;
  physicalAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactEmail: string;
  contactPhone: string;
  status: StoreApplicationStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  stripeConnectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreApplicationDTO {
  businessName: string;
  legalName: string;
  businessType: 'SOLE_PROPRIETOR' | 'LLC' | 'CORPORATION' | 'PARTNERSHIP';
  taxId?: string;
  website?: string;
  instagram?: string;
  description: string;
  yearsInBusiness: number;
  estimatedInventory: number;
  estimatedMonthlyGMV: number;
  categories: string[];
  hasPhysicalLocation: boolean;
  physicalAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactEmail: string;
  contactPhone: string;
}

export interface StoreStats {
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface StorePayout {
  id: string;
  storeId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  stripePayoutId?: string;
  periodStart: Date;
  periodEnd: Date;
  orderCount: number;
  createdAt: Date;
  completedAt?: Date;
}
