import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import type {
  User,
  Store,
  Product,
  Order,
  Authentication,
} from '@/types';
import type {
  StoreApplication,
  StorePayout,
} from '@/types/store';
import type {
  Review,
  Dispute,
} from '@/types/review';
import {
  UserRole,
  UserStatus,
  StoreType,
  StoreTier,
  StoreStatus,
  ProductCategory,
  ProductCondition,
  ProductStatus,
  AuthenticationStatus,
  OrderStatus,
  PaymentStatus,
} from '@/types';

// =============================================================================
// GENERIC TABLE CLASS
// =============================================================================

class Table<T extends { id: string }> {
  private data: Map<string, T> = new Map();

  create(item: T): T {
    this.data.set(item.id, item);
    return item;
  }

  findById(id: string): T | undefined {
    return this.data.get(id);
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    for (const item of this.data.values()) {
      if (predicate(item)) return item;
    }
    return undefined;
  }

  findMany(predicate?: (item: T) => boolean): T[] {
    const items = Array.from(this.data.values());
    if (predicate) {
      return items.filter(predicate);
    }
    return items;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const existing = this.data.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() } as T;
    this.data.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }

  count(predicate?: (item: T) => boolean): number {
    if (predicate) return this.findMany(predicate).length;
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  all(): T[] {
    return Array.from(this.data.values());
  }

  findAll(): T[] {
    return this.all();
  }
}

// =============================================================================
// DATABASE INSTANCE
// =============================================================================

class InMemoryDatabase {
  users = new Table<User>();
  stores = new Table<Store>();
  products = new Table<Product>();
  orders = new Table<Order>();
  authentications = new Table<Authentication>();
  storeApplications = new Table<StoreApplication>();
  storePayouts = new Table<StorePayout>();
  reviews = new Table<Review>();
  disputes = new Table<Dispute>();

  private seeded = false;

  reset(): void {
    this.users.clear();
    this.stores.clear();
    this.products.clear();
    this.orders.clear();
    this.authentications.clear();
    this.storeApplications.clear();
    this.storePayouts.clear();
    this.reviews.clear();
    this.disputes.clear();
    this.seeded = false;
  }

  async seed(): Promise<void> {
    if (this.seeded) return;

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const adminUser: User = {
      id: 'user_admin',
      email: 'admin@covet.com',
      passwordHash: adminPasswordHash,
      role: UserRole.COVET_ADMIN,
      profile: {
        name: 'Covet Admin',
        shippingAddresses: [],
      },
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.create(adminUser);

    // Create store admin
    const storePasswordHash = await bcrypt.hash('Store123!', 10);
    const storeUser: User = {
      id: 'user_store',
      email: 'store@covet.com',
      passwordHash: storePasswordHash,
      role: UserRole.STORE_ADMIN,
      profile: {
        name: 'Store Manager',
        shippingAddresses: [],
      },
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.create(storeUser);

    // Create test buyer
    const buyerPasswordHash = await bcrypt.hash('Buyer123!', 10);
    const buyerUser: User = {
      id: 'user_buyer',
      email: 'buyer@test.com',
      passwordHash: buyerPasswordHash,
      role: UserRole.BUYER,
      profile: {
        name: 'Test Buyer',
        shippingAddresses: [
          {
            id: 'addr_1',
            name: 'Test Buyer',
            street1: '123 Main St',
            city: 'Boston',
            state: 'MA',
            postalCode: '02101',
            country: 'US',
            isDefault: true,
          },
        ],
      },
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.create(buyerUser);

    // Create Covet flagship store
    const covetStore: Store = {
      id: 'store_covet',
      slug: 'covet-boston',
      name: 'Covet Boston',
      ownerId: adminUser.id,
      type: StoreType.COVET_FLAGSHIP,
      tier: StoreTier.FLAGSHIP,
      status: StoreStatus.ACTIVE,
      branding: {
        logoUrl: 'https://i.ibb.co/99Gyjq1p/Covet-Logotype.webp',
        accentColor: '#1a1a1a',
        description: "Boston's premier destination for authenticated luxury consignment. Since 2015, we've connected discerning buyers with the world's finest pre-owned luxury goods.",
        tagline: 'Luxury, Authenticated.',
      },
      contact: {
        email: 'hello@covet.com',
        phone: '(617) 555-0100',
        address: {
          id: 'store_addr_1',
          name: 'Covet Boston',
          street1: '234 Newbury Street',
          city: 'Boston',
          state: 'MA',
          postalCode: '02116',
          country: 'US',
        },
      },
      trustScore: 98,
      takeRate: 0.06,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stores.create(covetStore);

    // Create sample products
    const products: Omit<Product, 'id'>[] = [
      {
        storeId: covetStore.id,
        sku: 'hermes-birkin-25-noir',
        title: 'Hermès Birkin 25 Togo Noir',
        description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware. Includes original box, dustbag, lock, keys, and clochette. Date stamp T (2015).',
        brand: 'Hermès',
        category: ProductCategory.HANDBAGS,
        subcategory: 'Totes',
        condition: ProductCondition.EXCELLENT,
        priceCents: 1895000,
        originalPriceCents: 2200000,
        images: [
          { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', alt: 'Hermès Birkin 25 Front', order: 0, isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', alt: 'Hermès Birkin 25 Side', order: 1 },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: 'Togo Leather',
          color: 'Noir (Black)',
          serialNumber: 'T****25',
          yearProduced: 2015,
          measurements: { width: 25, height: 19, depth: 13, unit: 'cm' },
          includedAccessories: ['Original Box', 'Dustbag', 'Lock', 'Keys', 'Clochette'],
        },
        viewCount: 342,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'chanel-classic-flap-medium',
        title: 'Chanel Classic Flap Medium Caviar',
        description: 'Timeless Chanel Classic Medium Flap in black caviar leather with silver hardware. Excellent condition with minor wear to corners.',
        brand: 'Chanel',
        category: ProductCategory.HANDBAGS,
        subcategory: 'Shoulder Bags',
        condition: ProductCondition.VERY_GOOD,
        priceCents: 785000,
        originalPriceCents: 1050000,
        images: [
          { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', alt: 'Chanel Classic Flap', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: 'Caviar Leather',
          color: 'Black',
          serialNumber: '25******',
          yearProduced: 2019,
          measurements: { width: 25.5, height: 15.5, depth: 6.5, unit: 'cm' },
          includedAccessories: ['Dustbag', 'Authenticity Card'],
        },
        viewCount: 528,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'rolex-datejust-36',
        title: 'Rolex Datejust 36 Two-Tone',
        description: 'Classic Rolex Datejust 36mm in steel and 18k yellow gold with champagne dial. Includes box, papers, and service history.',
        brand: 'Rolex',
        category: ProductCategory.WATCHES,
        subcategory: 'Dress Watches',
        condition: ProductCondition.EXCELLENT,
        priceCents: 895000,
        originalPriceCents: 1200000,
        images: [
          { url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800', alt: 'Rolex Datejust', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: 'Steel/18k Yellow Gold',
          color: 'Champagne',
          serialNumber: '****7890',
          yearProduced: 2018,
          includedAccessories: ['Box', 'Papers', 'Service Records'],
        },
        viewCount: 892,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'cartier-love-bracelet',
        title: 'Cartier Love Bracelet Yellow Gold',
        description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17. Includes original screwdriver, box, and certificate.',
        brand: 'Cartier',
        category: ProductCategory.JEWELRY,
        subcategory: 'Bracelets',
        condition: ProductCondition.EXCELLENT,
        priceCents: 595000,
        originalPriceCents: 750000,
        images: [
          { url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800', alt: 'Cartier Love Bracelet', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: '18k Yellow Gold',
          color: 'Yellow Gold',
          size: '17',
          includedAccessories: ['Screwdriver', 'Box', 'Certificate'],
        },
        viewCount: 456,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'louis-vuitton-neverfull-mm',
        title: 'Louis Vuitton Neverfull MM Damier Ebene',
        description: 'Versatile Louis Vuitton Neverfull MM in Damier Ebene canvas with red interior. Includes pochette.',
        brand: 'Louis Vuitton',
        category: ProductCategory.HANDBAGS,
        subcategory: 'Totes',
        condition: ProductCondition.VERY_GOOD,
        priceCents: 145000,
        originalPriceCents: 200000,
        images: [
          { url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', alt: 'LV Neverfull', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: 'Damier Ebene Canvas',
          color: 'Brown',
          measurements: { width: 32, height: 28.5, depth: 17, unit: 'cm' },
          includedAccessories: ['Pochette'],
        },
        viewCount: 723,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'gucci-marmont-small',
        title: 'Gucci GG Marmont Small Matelassé',
        description: 'Elegant Gucci GG Marmont small shoulder bag in dusty pink matelassé leather with gold hardware.',
        brand: 'Gucci',
        category: ProductCategory.HANDBAGS,
        subcategory: 'Shoulder Bags',
        condition: ProductCondition.EXCELLENT,
        priceCents: 165000,
        originalPriceCents: 250000,
        images: [
          { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', alt: 'Gucci Marmont', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: 'Matelassé Leather',
          color: 'Dusty Pink',
          measurements: { width: 26, height: 15, depth: 7, unit: 'cm' },
          includedAccessories: ['Dustbag'],
        },
        viewCount: 234,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'omega-speedmaster-moonwatch',
        title: 'Omega Speedmaster Professional Moonwatch',
        description: 'The legendary Omega Speedmaster Professional "Moonwatch" with hesalite crystal. Manual wind caliber 1861.',
        brand: 'Omega',
        category: ProductCategory.WATCHES,
        subcategory: 'Chronographs',
        condition: ProductCondition.EXCELLENT,
        priceCents: 495000,
        originalPriceCents: 650000,
        images: [
          { url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800', alt: 'Omega Speedmaster', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: 'Stainless Steel',
          color: 'Black',
          yearProduced: 2020,
          includedAccessories: ['Box', 'Papers', 'NATO Strap'],
        },
        viewCount: 567,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        storeId: covetStore.id,
        sku: 'van-cleef-alhambra-vintage',
        title: 'Van Cleef & Arpels Vintage Alhambra Pendant',
        description: 'Signature Van Cleef & Arpels Vintage Alhambra pendant in 18k yellow gold with mother of pearl.',
        brand: 'Van Cleef & Arpels',
        category: ProductCategory.JEWELRY,
        subcategory: 'Necklaces',
        condition: ProductCondition.EXCELLENT,
        priceCents: 325000,
        originalPriceCents: 420000,
        images: [
          { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', alt: 'VCA Alhambra', order: 0, isPrimary: true },
        ],
        authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
        status: ProductStatus.ACTIVE,
        metadata: {
          material: '18k Yellow Gold',
          color: 'Mother of Pearl',
          includedAccessories: ['Box', 'Certificate'],
        },
        viewCount: 312,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    products.forEach((product, index) => {
      this.products.create({
        ...product,
        id: `prod_${index + 1}`,
      } as Product);
    });

    this.seeded = true;
  }
}

// Export singleton instance
export const db = new InMemoryDatabase();

// Auto-seed on import (for development)
if (typeof window === 'undefined') {
  db.seed().catch(console.error);
}
