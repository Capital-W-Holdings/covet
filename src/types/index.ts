// =============================================================================
// COVET PLATFORM - TYPE DEFINITIONS
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export enum UserRole {
  BUYER = 'BUYER',
  STORE_ADMIN = 'STORE_ADMIN',
  COVET_ADMIN = 'COVET_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum StoreType {
  COVET_FLAGSHIP = 'COVET_FLAGSHIP',
  PARTNER = 'PARTNER',
}

export enum StoreTier {
  FLAGSHIP = 'FLAGSHIP',
  PREMIUM = 'PREMIUM',
  STANDARD = 'STANDARD',
}

export enum StoreStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum ProductCategory {
  HANDBAGS = 'HANDBAGS',
  WATCHES = 'WATCHES',
  JEWELRY = 'JEWELRY',
  ACCESSORIES = 'ACCESSORIES',
  CLOTHING = 'CLOTHING',
  SHOES = 'SHOES',
}

export enum ProductCondition {
  NEW_WITH_TAGS = 'NEW_WITH_TAGS',
  NEW_WITHOUT_TAGS = 'NEW_WITHOUT_TAGS',
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  ARCHIVED = 'ARCHIVED',
}

export enum AuthenticationStatus {
  PENDING = 'PENDING',
  COVET_CERTIFIED = 'COVET_CERTIFIED',
  STORE_CERTIFIED = 'STORE_CERTIFIED',
  THIRD_PARTY = 'THIRD_PARTY',
  FAILED = 'FAILED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// -----------------------------------------------------------------------------
// BASE INTERFACES
// -----------------------------------------------------------------------------

export interface Address {
  id?: string;
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  phone?: string;
  shippingAddresses: Address[];
}

// -----------------------------------------------------------------------------
// ENTITY INTERFACES
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: UserProfile;
  stripeCustomerId?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface StoreBranding {
  logoUrl?: string;
  bannerUrl?: string;
  coverUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  description?: string;
  tagline?: string;
}

export interface StoreContact {
  email: string;
  phone?: string;
  address?: Address;
}

export interface StoreSettings {
  acceptsOffers?: boolean;
  autoPublish?: boolean;
  defaultShippingDays?: number;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
  type: StoreType;
  tier: StoreTier;
  status: StoreStatus;
  branding: StoreBranding;
  settings?: StoreSettings;
  contact?: StoreContact;
  stripeConnectId?: string;
  trustScore?: number;
  takeRate: number; // percentage as decimal (0.06 = 6%)
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
  isPrimary?: boolean;
}

export interface ProductMetadata {
  material?: string;
  color?: string;
  size?: string;
  serialNumber?: string;
  yearProduced?: number;
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    unit: 'cm' | 'in';
  };
  includedAccessories?: string[];
}

export interface Product {
  id: string;
  storeId: string;
  sku: string;
  title: string;
  description: string;
  brand: string;
  category: ProductCategory;
  subcategory?: string;
  condition: ProductCondition;
  priceCents: number;
  originalPriceCents?: number;
  images: ProductImage[];
  authenticationStatus: AuthenticationStatus;
  authenticationId?: string;
  status: ProductStatus;
  metadata: ProductMetadata;
  viewCount: number;
  reservedUntil?: Date;
  reservedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Authentication {
  id: string;
  productId: string;
  method: 'COVET_EXPERT' | 'THIRD_PARTY' | 'STORE_SELF';
  certifiedBy: string;
  notes?: string;
  evidenceUrls: string[];
  confidence: number; // 0-100
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productSku: string;
  priceCents: number;
  imageUrl?: string;
}

export interface ShippingInfo {
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  address: Address;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  storeId: string;
  item: OrderItem;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  platformFeeCents: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  shipping: ShippingInfo;
  notes?: string;
  disputeDeadline?: Date; // 14 days after delivery
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// API TYPES
// -----------------------------------------------------------------------------

export interface ApiError {
  type: string;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// -----------------------------------------------------------------------------
// FILTER & QUERY TYPES
// -----------------------------------------------------------------------------

export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  authStatus?: AuthenticationStatus;
  storeId?: string;
  search?: string;
  status?: ProductStatus;
}

export interface ProductSort {
  field: 'price' | 'createdAt' | 'title' | 'viewCount';
  order: 'asc' | 'desc';
}

export interface ProductQuery {
  filters?: ProductFilters;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

// -----------------------------------------------------------------------------
// CART TYPES
// -----------------------------------------------------------------------------

export interface CartItem {
  productId: string;
  addedAt: Date;
}

export interface Cart {
  item?: CartItem;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// SESSION TYPES
// -----------------------------------------------------------------------------

export interface Session {
  userId: string;
  email: string;
  userName?: string;
  role: UserRole;
  storeId?: string;
  expiresAt: Date;
}

// -----------------------------------------------------------------------------
// RESULT TYPE (for error handling)
// -----------------------------------------------------------------------------

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// -----------------------------------------------------------------------------
// DTO TYPES (Data Transfer Objects)
// -----------------------------------------------------------------------------

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateProductDTO {
  storeId: string;
  title: string;
  description: string;
  brand: string;
  category: ProductCategory;
  subcategory?: string;
  condition: ProductCondition;
  priceCents: number;
  originalPriceCents?: number;
  images: ProductImage[];
  metadata?: ProductMetadata;
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  priceCents?: number;
  originalPriceCents?: number | null;
  images?: ProductImage[];
  condition?: ProductCondition;
  status?: ProductStatus;
  metadata?: ProductMetadata;
}

export interface CreateOrderDTO {
  productId: string;
  shippingAddress: Address;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  paymentIntentId?: string;
  platformFeeCents?: number;
}

// Re-export store types
export * from './store';

// Re-export review and dispute types
export * from './review';

// Re-export price alert types
export * from './priceAlert';
