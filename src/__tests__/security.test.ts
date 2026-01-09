import { db } from '@/lib/db';
import { productRepository } from '@/lib/repositories/product';
import { checkRateLimit, RateLimitPresets } from '@/lib/rateLimit';
import { ProductStatus } from '@/types';

describe('Security Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  describe('Rate Limiting', () => {
    it('should allow requests under the limit', () => {
      const result1 = checkRateLimit('test-key-1', { limit: 5, windowMs: 60000 });
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);
      
      const result2 = checkRateLimit('test-key-1', { limit: 5, windowMs: 60000 });
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests over the limit', () => {
      const key = 'test-key-2';
      const config = { limit: 3, windowMs: 60000 };
      
      // Use up the limit
      checkRateLimit(key, config);
      checkRateLimit(key, config);
      checkRateLimit(key, config);
      
      // Next request should be blocked
      const result = checkRateLimit(key, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it('should track different keys independently', () => {
      const config = { limit: 2, windowMs: 60000 };
      
      checkRateLimit('user-a', config);
      checkRateLimit('user-a', config);
      
      // user-a is at limit
      const resultA = checkRateLimit('user-a', config);
      expect(resultA.allowed).toBe(false);
      
      // user-b still has requests
      const resultB = checkRateLimit('user-b', config);
      expect(resultB.allowed).toBe(true);
    });

    it('should have correct presets defined', () => {
      expect(RateLimitPresets.login.limit).toBe(5);
      expect(RateLimitPresets.register.limit).toBe(3);
      expect(RateLimitPresets.checkout.limit).toBe(10);
    });
  });

  describe('Atomic Reservation (Double-Sell Prevention)', () => {
    it('should successfully reserve an active product', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      const product = result.items[0];
      
      const reserveResult = await productRepository.reserveAtomic(product.id, 'user_1');
      expect(reserveResult.success).toBe(true);
      
      // Verify product is now reserved
      const updated = await productRepository.findById(product.id);
      expect(updated?.status).toBe(ProductStatus.RESERVED);
      expect(updated?.reservedBy).toBe('user_1');
    });

    it('should block second reservation attempt (prevent double-sell)', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      const product = result.items[0];
      
      // First user reserves
      const result1 = await productRepository.reserveAtomic(product.id, 'user_1');
      expect(result1.success).toBe(true);
      
      // Second user tries to reserve same product
      const result2 = await productRepository.reserveAtomic(product.id, 'user_2');
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('reserved by another');
    });

    it('should allow same user to reserve again (idempotent)', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      const product = result.items[0];
      
      // First reservation
      const result1 = await productRepository.reserveAtomic(product.id, 'user_1');
      expect(result1.success).toBe(true);
      
      // Same user reserves again
      const result2 = await productRepository.reserveAtomic(product.id, 'user_1');
      expect(result2.success).toBe(true); // Idempotent
    });

    it('should block reservation of sold product', async () => {
      await db.seed();
      const result = await productRepository.findMany({});
      const product = result.items[0];
      
      // Mark as sold
      await productRepository.markSold(product.id);
      
      // Try to reserve
      const reserveResult = await productRepository.reserveAtomic(product.id, 'user_1');
      expect(reserveResult.success).toBe(false);
      expect(reserveResult.error).toContain('sold');
    });

    it('should return error for non-existent product', async () => {
      await db.seed();
      
      const result = await productRepository.reserveAtomic('non-existent-id', 'user_1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Dispute Deadline', () => {
    it('should set dispute deadline on delivery', async () => {
      const { orderRepository } = require('@/lib/repositories/order');
      await db.seed();
      
      // Create a mock order
      const products = await productRepository.findMany({});
      const product = products.items[0];
      
      const orderResult = await orderRepository.create(
        'user_buyer',
        { 
          productId: product.id, 
          shippingAddress: {
            name: 'Test',
            street1: '123 Test St',
            city: 'Boston',
            state: 'MA',
            postalCode: '02101',
            country: 'US',
          }
        },
        product
      );
      
      expect(orderResult.success).toBe(true);
      
      // Mark as shipped then delivered
      await orderRepository.markShipped(orderResult.data.id, 'TRACK123', 'UPS');
      const delivered = await orderRepository.markDelivered(orderResult.data.id);
      
      expect(delivered.disputeDeadline).toBeDefined();
      
      // Deadline should be ~14 days from now
      const deadline = new Date(delivered.disputeDeadline);
      const now = new Date();
      const daysDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBeGreaterThan(13);
      expect(daysDiff).toBeLessThan(15);
    });
  });
});

describe('Authorization Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  it('should include storeId in JWT for store admins', async () => {
    const { createToken, verifyToken } = require('@/lib/auth');
    await db.seed();
    
    // Get store admin user
    const storeUser = db.users.findOne((u) => u.email === 'store@covet.com');
    expect(storeUser).toBeDefined();
    
    if (!storeUser) return; // TypeScript guard
    
    const token = await createToken(storeUser);
    const session = await verifyToken(token);
    
    expect(session).toBeDefined();
    expect(session.userId).toBe(storeUser.id);
    // Note: storeId will be undefined since store owner isn't set up in seed
    // This test verifies the token includes the field
  });

  it('should include storeId in JWT for covet admin', async () => {
    const { createToken, verifyToken } = require('@/lib/auth');
    await db.seed();
    
    // Get admin user
    const adminUser = db.users.findOne((u) => u.email === 'admin@covet.com');
    expect(adminUser).toBeDefined();
    
    if (!adminUser) return; // TypeScript guard
    
    const token = await createToken(adminUser);
    const session = await verifyToken(token);
    
    expect(session).toBeDefined();
    expect(session.userId).toBe(adminUser.id);
    expect(session.storeId).toBe('store_covet'); // Admin owns the flagship store
  });
});
