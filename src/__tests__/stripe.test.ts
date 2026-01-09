import {
  isStripeDemo,
  calculatePlatformFee,
  formatStripeAmount,
  getAppUrl,
} from '@/lib/stripe';

describe('Stripe Integration', () => {
  describe('Demo Mode Detection', () => {
    const originalEnv = process.env.STRIPE_SECRET_KEY;

    afterEach(() => {
      // Restore original env
      if (originalEnv) {
        process.env.STRIPE_SECRET_KEY = originalEnv;
      } else {
        delete process.env.STRIPE_SECRET_KEY;
      }
    });

    it('should detect demo mode when STRIPE_SECRET_KEY is not set', () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(isStripeDemo()).toBe(true);
    });

    it('should detect demo mode when STRIPE_SECRET_KEY is demo placeholder', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_demo_mode';
      expect(isStripeDemo()).toBe(true);
    });
  });

  describe('Platform Fee Calculation', () => {
    it('should calculate 6% fee for flagship stores', () => {
      const fee = calculatePlatformFee(100000, 'COVET_FLAGSHIP');
      expect(fee).toBe(6000); // $60 on $1000
    });

    it('should calculate 10% fee for partner stores', () => {
      const fee = calculatePlatformFee(100000, 'PARTNER');
      expect(fee).toBe(10000); // $100 on $1000
    });

    it('should round fees to nearest cent', () => {
      const fee = calculatePlatformFee(12345, 'COVET_FLAGSHIP');
      expect(fee).toBe(741); // 12345 * 0.06 = 740.7 → 741
    });

    it('should handle zero amounts', () => {
      const fee = calculatePlatformFee(0, 'PARTNER');
      expect(fee).toBe(0);
    });
  });

  describe('Amount Formatting', () => {
    it('should format cents to dollars', () => {
      expect(formatStripeAmount(100000)).toBe('$1,000.00');
    });

    it('should handle small amounts', () => {
      expect(formatStripeAmount(99)).toBe('$0.99');
    });

    it('should handle zero', () => {
      expect(formatStripeAmount(0)).toBe('$0.00');
    });

    it('should format with commas for large amounts', () => {
      expect(formatStripeAmount(189500000)).toBe('$1,895,000.00');
    });
  });

  describe('App URL', () => {
    it('should return configured URL', () => {
      const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_APP_URL = 'https://covet.example.com';
      
      expect(getAppUrl()).toBe('https://covet.example.com');
      
      if (originalUrl) {
        process.env.NEXT_PUBLIC_APP_URL = originalUrl;
      } else {
        delete process.env.NEXT_PUBLIC_APP_URL;
      }
    });

    it('should fallback to localhost', () => {
      const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;
      
      expect(getAppUrl()).toBe('http://localhost:3000');
      
      if (originalUrl) {
        process.env.NEXT_PUBLIC_APP_URL = originalUrl;
      }
    });
  });
});

describe('Checkout Flow', () => {
  it('should calculate correct order totals', () => {
    const priceCents = 189500000; // $1,895,000.00
    const shippingCents = 0; // Free shipping
    const taxCents = 0; // Simplified
    
    const subtotal = priceCents;
    const total = subtotal + shippingCents + taxCents;
    
    expect(subtotal).toBe(189500000);
    expect(total).toBe(189500000);
    
    const platformFee = calculatePlatformFee(priceCents, 'COVET_FLAGSHIP');
    expect(platformFee).toBe(11370000); // 6% = $113,700.00
    
    const sellerPayout = priceCents - platformFee;
    expect(sellerPayout).toBe(178130000); // $1,781,300.00
  });
});
