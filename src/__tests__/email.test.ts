import { isEmailDemo } from '@/lib/email/service';
import {
  orderConfirmationTemplate,
  shippingConfirmationTemplate,
  deliveryConfirmationTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
} from '@/lib/email/templates';
import type { Order } from '@/types';
import { OrderStatus, PaymentStatus } from '@/types';

describe('Email Service', () => {
  describe('Demo Mode Detection', () => {
    const originalProvider = process.env.EMAIL_PROVIDER;
    const originalKey = process.env.EMAIL_API_KEY;

    afterEach(() => {
      if (originalProvider) {
        process.env.EMAIL_PROVIDER = originalProvider;
      } else {
        delete process.env.EMAIL_PROVIDER;
      }
      if (originalKey) {
        process.env.EMAIL_API_KEY = originalKey;
      } else {
        delete process.env.EMAIL_API_KEY;
      }
    });

    it('should detect demo mode when no API key is set', () => {
      delete process.env.EMAIL_API_KEY;
      delete process.env.EMAIL_PROVIDER;
      expect(isEmailDemo()).toBe(true);
    });

    it('should detect demo mode when no provider is set', () => {
      process.env.EMAIL_API_KEY = 'test-key';
      delete process.env.EMAIL_PROVIDER;
      expect(isEmailDemo()).toBe(true);
    });
  });
});

describe('Email Templates', () => {
  const mockOrder: Order = {
    id: 'order_123',
    orderNumber: 'COV-2025-001',
    buyerId: 'user_buyer',
    storeId: 'store_covet',
    item: {
      productId: 'prod_123',
      productTitle: 'Test Product',
      productSku: 'SKU-001',
      priceCents: 100000,
      imageUrl: 'https://example.com/image.jpg',
    },
    subtotalCents: 100000,
    shippingCents: 0,
    taxCents: 0,
    totalCents: 100000,
    platformFeeCents: 6000,
    status: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.CAPTURED,
    shipping: {
      address: {
        name: 'Test User',
        street1: '123 Test St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02116',
        country: 'US',
      },
      carrier: 'UPS',
      trackingNumber: '1Z999AA10123456784',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    title: 'Hermès Birkin 25',
    brand: 'Hermès',
    imageUrl: 'https://example.com/birkin.jpg',
    sku: 'hermes-birkin-25',
  };

  describe('Order Confirmation Template', () => {
    it('should generate order confirmation email', () => {
      const result = orderConfirmationTemplate({
        order: mockOrder,
        product: mockProduct,
        appUrl: 'https://covet.com',
      });

      expect(result.subject).toContain(mockOrder.orderNumber);
      expect(result.html).toContain('Thank you for your order');
      expect(result.html).toContain(mockProduct.brand);
      expect(result.text).toContain(mockOrder.orderNumber);
    });
  });

  describe('Shipping Confirmation Template', () => {
    it('should generate shipping confirmation email', () => {
      const result = shippingConfirmationTemplate({
        order: mockOrder,
        product: mockProduct,
        trackingUrl: 'https://ups.com/track/123',
        appUrl: 'https://covet.com',
      });

      expect(result.subject).toContain('Shipped');
      expect(result.html).toContain('shipped');
      expect(result.html).toContain(mockOrder.shipping.carrier);
      expect(result.text).toContain(mockOrder.shipping.trackingNumber);
    });
  });

  describe('Delivery Confirmation Template', () => {
    it('should generate delivery confirmation email', () => {
      const result = deliveryConfirmationTemplate({
        order: mockOrder,
        product: mockProduct,
        appUrl: 'https://covet.com',
      });

      expect(result.subject).toContain('Delivered');
      expect(result.html).toContain('delivered');
      expect(result.html).toContain('Review');
    });
  });

  describe('Welcome Email Template', () => {
    it('should generate welcome email', () => {
      const result = welcomeEmailTemplate({
        userName: 'Test User',
        appUrl: 'https://covet.com',
      });

      expect(result.subject).toContain('Welcome');
      expect(result.html).toContain('Test User');
      expect(result.html).toContain('Authenticated');
    });
  });

  describe('Password Reset Template', () => {
    it('should generate password reset email', () => {
      const result = passwordResetTemplate({
        userName: 'Test User',
        resetUrl: 'https://covet.com/reset?token=abc123',
        expiresIn: '1 hour',
      });

      expect(result.subject).toContain('Reset');
      expect(result.html).toContain('Test User');
      expect(result.html).toContain('1 hour');
      expect(result.html).toContain('reset?token=abc123');
    });
  });
});
