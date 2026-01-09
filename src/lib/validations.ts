import { z } from 'zod';
import {
  ProductCategory,
  ProductCondition,
  ProductStatus,
  AuthenticationStatus,
  OrderStatus,
} from '@/types';

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// =============================================================================
// PRODUCT SCHEMAS
// =============================================================================

export const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().min(1, 'Alt text is required'),
  order: z.number().int().min(0),
  isPrimary: z.boolean().optional(),
});

export const productMetadataSchema = z.object({
  material: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  serialNumber: z.string().optional(),
  yearProduced: z.number().int().min(1900).max(2100).optional(),
  measurements: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      depth: z.number().positive().optional(),
      unit: z.enum(['cm', 'in']),
    })
    .optional(),
  includedAccessories: z.array(z.string()).optional(),
});

export const createProductSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  brand: z.string().min(1, 'Brand is required'),
  category: z.nativeEnum(ProductCategory),
  subcategory: z.string().optional(),
  condition: z.nativeEnum(ProductCondition),
  priceCents: z.number().int().positive('Price must be positive'),
  originalPriceCents: z.number().int().positive().optional(),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  metadata: productMetadataSchema.optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  priceCents: z.number().int().positive().optional(),
  originalPriceCents: z.number().int().positive().nullable().optional(),
  images: z.array(productImageSchema).min(1).optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  metadata: productMetadataSchema.optional(),
});

export const productQuerySchema = z.object({
  category: z.nativeEnum(ProductCategory).optional(),
  brand: z.string().optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  authStatus: z.nativeEnum(AuthenticationStatus).optional(),
  storeId: z.string().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sortField: z.enum(['price', 'createdAt', 'title', 'viewCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

// =============================================================================
// ORDER SCHEMAS
// =============================================================================

export const createOrderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  shippingAddress: addressSchema,
});

export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// -----------------------------------------------------------------------------
// STORE APPLICATION SCHEMAS
// -----------------------------------------------------------------------------

export const storeApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name required').max(100),
  legalName: z.string().min(2, 'Legal name required').max(100),
  businessType: z.enum(['SOLE_PROPRIETOR', 'LLC', 'CORPORATION', 'PARTNERSHIP']),
  taxId: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().max(50).optional(),
  description: z.string().min(50, 'Please provide at least 50 characters').max(2000),
  yearsInBusiness: z.coerce.number().int().min(0).max(100),
  estimatedInventory: z.coerce.number().int().min(1),
  estimatedMonthlyGMV: z.coerce.number().int().min(0),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  hasPhysicalLocation: z.boolean(),
  physicalAddress: z.object({
    street1: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2).max(2),
  }).optional(),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(10, 'Invalid phone number'),
});

export const reviewApplicationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'NEEDS_INFO', 'UNDER_REVIEW']),
  reviewNotes: z.string().max(2000).optional(),
});

export type StoreApplicationInput = z.infer<typeof storeApplicationSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;

// -----------------------------------------------------------------------------
// REVIEW SCHEMAS
// -----------------------------------------------------------------------------

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID required'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// -----------------------------------------------------------------------------
// DISPUTE SCHEMAS
// -----------------------------------------------------------------------------

export const createDisputeSchema = z.object({
  orderId: z.string().min(1, 'Order ID required'),
  reason: z.enum([
    'NOT_AS_DESCRIBED',
    'AUTHENTICATION_CONCERN',
    'DAMAGED_IN_SHIPPING',
    'NOT_RECEIVED',
    'WRONG_ITEM',
    'OTHER',
  ]),
  description: z.string().min(20, 'Please provide at least 20 characters').max(2000),
  evidence: z.array(z.string().url()).max(10).optional(),
});

export const disputeResponseSchema = z.object({
  message: z.string().min(1, 'Message required').max(2000),
  attachments: z.array(z.string().url()).max(5).optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z.enum([
    'FULL_REFUND',
    'PARTIAL_REFUND',
    'RETURN_AND_REFUND',
    'REPLACEMENT',
    'NO_ACTION',
    'BUYER_WITHDREW',
  ]),
  resolutionNotes: z.string().max(2000).optional(),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type DisputeResponseInput = z.infer<typeof disputeResponseSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
