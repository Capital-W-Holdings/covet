import { db } from '@/lib/db';
import { productRepository } from '@/lib/repositories/product';
import { userRepository } from '@/lib/repositories/user';
import { orderRepository } from '@/lib/repositories/order';
import { ProductCategory, ProductCondition, ProductStatus } from '@/types';

describe('Database', () => {
  beforeEach(() => {
    db.reset();
  });

  describe('productRepository', () => {
    it('should seed database with products', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should find product by SKU', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      const firstProduct = result.items[0];
      
      const found = await productRepository.findBySku(firstProduct.sku);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstProduct.id);
    });

    it('should filter products by category', async () => {
      await db.seed();
      const result = await productRepository.findMany({
        filters: { category: ProductCategory.HANDBAGS },
      });
      
      result.items.forEach((product) => {
        expect(product.category).toBe(ProductCategory.HANDBAGS);
      });
    });

    it('should create new product', async () => {
      await db.seed();
      const result = await productRepository.create({
        storeId: 'store_covet',
        title: 'Test Product',
        description: 'A test product',
        brand: 'Test Brand',
        category: ProductCategory.ACCESSORIES,
        condition: ProductCondition.EXCELLENT,
        priceCents: 100000,
        images: [{ url: 'https://example.com/image.jpg', alt: 'Test', order: 0 }],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Product');
        expect(result.data.status).toBe(ProductStatus.DRAFT);
      }
    });

    it('should update product', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      const firstProduct = result.items[0];

      const updated = await productRepository.update(firstProduct.id, {
        title: 'Updated Title',
      });

      expect(updated?.title).toBe('Updated Title');
    });

    it('should get featured products', async () => {
      await db.seed();
      const featured = await productRepository.getFeatured(4);
      expect(featured.length).toBeLessThanOrEqual(4);
    });

    it('should search products', async () => {
      await db.seed();
      const result = await productRepository.findMany({
        filters: { search: 'birkin' },
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((product) => {
        const searchMatch =
          product.title.toLowerCase().includes('birkin') ||
          product.description.toLowerCase().includes('birkin') ||
          product.brand.toLowerCase().includes('birkin');
        expect(searchMatch).toBe(true);
      });
    });
  });

  describe('userRepository', () => {
    it('should seed admin user', async () => {
      await db.seed();
      const admin = await userRepository.findByEmail('admin@covet.com');
      expect(admin).toBeDefined();
      expect(admin?.role).toBe('COVET_ADMIN');
    });

    it('should create new user', async () => {
      await db.seed();
      const result = await userRepository.create({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe('BUYER');
      }
    });

    it('should not create duplicate user', async () => {
      await db.seed();
      const result = await userRepository.create({
        email: 'admin@covet.com',
        password: 'Test123!',
        name: 'Duplicate',
      });

      expect(result.success).toBe(false);
    });

    it('should verify password', async () => {
      await db.seed();
      const user = await userRepository.findByEmail('admin@covet.com');
      expect(user).toBeDefined();

      if (user) {
        const isValid = await userRepository.verifyPassword(user, 'Admin123!');
        expect(isValid).toBe(true);

        const isInvalid = await userRepository.verifyPassword(user, 'WrongPassword');
        expect(isInvalid).toBe(false);
      }
    });
  });

  describe('orderRepository', () => {
    it('should get order stats', async () => {
      await db.seed();
      const stats = await orderRepository.getStats();
      
      expect(stats).toHaveProperty('totalOrders');
      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('pendingOrders');
      expect(stats).toHaveProperty('shippedOrders');
    });
  });
});

describe('Utils', () => {
  describe('formatPrice', () => {
    const { formatPrice } = require('@/lib/utils');

    it('should format cents to dollars', () => {
      expect(formatPrice(100)).toBe('$1.00');
      expect(formatPrice(1500)).toBe('$15.00');
      expect(formatPrice(189500)).toBe('$1,895.00');
    });
  });

  describe('calculateDiscount', () => {
    const { calculateDiscount } = require('@/lib/utils');

    it('should calculate discount percentage', () => {
      expect(calculateDiscount(100, 80)).toBe(20);
      expect(calculateDiscount(200, 150)).toBe(25);
      expect(calculateDiscount(100, 100)).toBe(0);
    });

    it('should handle zero original price', () => {
      expect(calculateDiscount(0, 50)).toBe(0);
    });
  });

  describe('generateOrderNumber', () => {
    const { generateOrderNumber } = require('@/lib/utils');

    it('should generate unique order numbers', () => {
      const num1 = generateOrderNumber();
      const num2 = generateOrderNumber();
      
      expect(num1).toMatch(/^COV-/);
      expect(num2).toMatch(/^COV-/);
      expect(num1).not.toBe(num2);
    });
  });
});

describe('StoreApplicationRepository', () => {
  const { storeApplicationRepository } = require('@/lib/repositories');
  const { StoreApplicationStatus } = require('@/types/store');

  beforeEach(() => {
    db.reset();
  });

  it('should create a store application', async () => {
    await db.seed();
    
    const result = await storeApplicationRepository.create('user_buyer', {
      businessName: 'Luxury Resale Shop',
      legalName: 'Luxury Resale LLC',
      businessType: 'LLC',
      description: 'A premium luxury resale shop with authentic items and excellent service.',
      yearsInBusiness: 5,
      estimatedInventory: 100,
      estimatedMonthlyGMV: 50000,
      categories: ['HANDBAGS', 'JEWELRY'],
      hasPhysicalLocation: false,
      contactEmail: 'shop@luxury.com',
      contactPhone: '555-1234',
    });

    expect(result.success).toBe(true);
    expect(result.data.businessName).toBe('Luxury Resale Shop');
    expect(result.data.status).toBe(StoreApplicationStatus.PENDING);
  });

  it('should not allow duplicate applications', async () => {
    await db.seed();
    
    const appData = {
      businessName: 'Test Shop',
      legalName: 'Test LLC',
      businessType: 'LLC' as const,
      description: 'A test shop with great products and customer service.',
      yearsInBusiness: 2,
      estimatedInventory: 50,
      estimatedMonthlyGMV: 10000,
      categories: ['ACCESSORIES'],
      hasPhysicalLocation: false,
      contactEmail: 'test@shop.com',
      contactPhone: '555-5678',
    };

    // First application should succeed
    const result1 = await storeApplicationRepository.create('user_buyer', appData);
    expect(result1.success).toBe(true);

    // Second application should fail
    const result2 = await storeApplicationRepository.create('user_buyer', appData);
    expect(result2.success).toBe(false);
  });

  it('should approve application and create store', async () => {
    await db.seed();
    
    const createResult = await storeApplicationRepository.create('user_buyer', {
      businessName: 'Approved Shop',
      legalName: 'Approved LLC',
      businessType: 'LLC',
      description: 'A shop that will be approved for selling luxury items.',
      yearsInBusiness: 3,
      estimatedInventory: 75,
      estimatedMonthlyGMV: 25000,
      categories: ['WATCHES'],
      hasPhysicalLocation: true,
      physicalAddress: {
        street1: '123 Main St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
      },
      contactEmail: 'approved@shop.com',
      contactPhone: '555-9999',
    });

    expect(createResult.success).toBe(true);

    const approveResult = await storeApplicationRepository.approve(
      createResult.data.id,
      'user_admin',
      'Great application!'
    );

    expect(approveResult.success).toBe(true);
    expect(approveResult.data.name).toBe('Approved Shop');
  });
});

describe('ReviewRepository', () => {
  const { reviewRepository } = require('@/lib/repositories/review');
  const { orderRepository } = require('@/lib/repositories/order');
  const { OrderStatus } = require('@/types');

  beforeEach(() => {
    db.reset();
  });

  it('should get stats for store with no reviews', async () => {
    await db.seed();
    const stats = await reviewRepository.getStatsForStore('store_covet');
    
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageRating).toBe(0);
    expect(stats.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });
});

describe('DisputeRepository', () => {
  const { disputeRepository } = require('@/lib/repositories/dispute');

  beforeEach(() => {
    db.reset();
  });

  it('should get open dispute count', async () => {
    await db.seed();
    const count = await disputeRepository.getOpenCount();
    
    expect(count).toBe(0);
  });

  it('should get dispute rate for store', async () => {
    await db.seed();
    const rate = await disputeRepository.getStoreDisputeRate('store_covet');
    
    expect(rate).toBe(0);
  });
});

describe('TrustScoreRepository', () => {
  const { trustScoreRepository } = require('@/lib/repositories/trustScore');

  beforeEach(() => {
    db.reset();
  });

  it('should calculate trust score for new store', async () => {
    await db.seed();
    const profile = await trustScoreRepository.calculateForStore('store_covet');
    
    expect(profile.storeId).toBe('store_covet');
    expect(profile.trustScore).toBeGreaterThanOrEqual(0);
    expect(profile.trustScore).toBeLessThanOrEqual(100);
    expect(profile.factors).toHaveProperty('reviewScore');
    expect(profile.factors).toHaveProperty('disputeScore');
    expect(profile.factors).toHaveProperty('fulfillmentScore');
    expect(profile.factors).toHaveProperty('volumeScore');
  });
});
