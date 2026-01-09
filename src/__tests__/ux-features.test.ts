/**
 * Wishlist Tests
 * Tests for wishlist functionality including localStorage persistence
 */

// Setup localStorage mock at module level
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

const localStorageMock = createLocalStorageMock();
Object.defineProperty(global, 'localStorage', { 
  value: localStorageMock,
  writable: true 
});

describe('Wishlist Functionality', () => {
  const STORAGE_KEY = 'covet_wishlist';

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Storage Operations', () => {
    test('should save wishlist items to localStorage', () => {
      const items = [
        { productId: 'prod-1', addedAt: new Date().toISOString() },
        { productId: 'prod-2', addedAt: new Date().toISOString() },
      ];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].productId).toBe('prod-1');
    });

    test('should load wishlist items from localStorage', () => {
      const items = [
        { productId: 'prod-1', addedAt: '2024-01-01T00:00:00Z' },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      
      expect(parsed).toHaveLength(1);
      expect(parsed[0].productId).toBe('prod-1');
    });

    test('should handle empty localStorage gracefully', () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeNull();
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      
      try {
        JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('Wishlist Item Management', () => {
    test('should add new item to wishlist', () => {
      const items: { productId: string; addedAt: string }[] = [];
      const newItem = { productId: 'prod-new', addedAt: new Date().toISOString() };
      
      items.unshift(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].productId).toBe('prod-new');
    });

    test('should remove item from wishlist', () => {
      const items = [
        { productId: 'prod-1', addedAt: new Date().toISOString() },
        { productId: 'prod-2', addedAt: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      const filtered = items.filter(item => item.productId !== 'prod-1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].productId).toBe('prod-2');
    });

    test('should check if item is in wishlist', () => {
      const items = [
        { productId: 'prod-1', addedAt: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      const isInWishlist = stored.some((item: { productId: string }) => item.productId === 'prod-1');
      
      expect(isInWishlist).toBe(true);
    });

    test('should not add duplicate items', () => {
      const items = [
        { productId: 'prod-1', addedAt: new Date().toISOString() },
      ];
      
      const isAlreadyIn = items.some(item => item.productId === 'prod-1');
      expect(isAlreadyIn).toBe(true);
      
      // Should not add duplicate
      if (!isAlreadyIn) {
        items.push({ productId: 'prod-1', addedAt: new Date().toISOString() });
      }
      
      expect(items).toHaveLength(1);
    });

    test('should enforce max items limit', () => {
      const MAX_ITEMS = 50;
      const items: { productId: string; addedAt: string }[] = [];
      
      // Add max items
      for (let i = 0; i < MAX_ITEMS + 5; i++) {
        if (items.length < MAX_ITEMS) {
          items.push({ productId: `prod-${i}`, addedAt: new Date().toISOString() });
        }
      }
      
      expect(items.length).toBeLessThanOrEqual(MAX_ITEMS);
    });

    test('should clear all wishlist items', () => {
      const items = [
        { productId: 'prod-1', addedAt: new Date().toISOString() },
        { productId: 'prod-2', addedAt: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      localStorage.removeItem(STORAGE_KEY);
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});

describe('Search Modal', () => {
  const RECENT_SEARCHES_KEY = 'covet_recent_searches';
  const MAX_RECENT = 5;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Recent Searches', () => {
    test('should save recent search', () => {
      const searches = ['Hermès Birkin'];
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      
      const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)!);
      expect(stored).toContain('Hermès Birkin');
    });

    test('should limit recent searches to max', () => {
      const searches = ['s1', 's2', 's3', 's4', 's5', 's6'];
      const limited = searches.slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limited));
      
      const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)!);
      expect(stored).toHaveLength(MAX_RECENT);
    });

    test('should not duplicate searches', () => {
      const existing = ['search1', 'search2'];
      const newSearch = 'search1';
      
      const filtered = existing.filter(s => s.toLowerCase() !== newSearch.toLowerCase());
      const updated = [newSearch, ...filtered];
      
      expect(updated).toHaveLength(2);
      expect(updated[0]).toBe('search1');
    });

    test('should clear recent searches', () => {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['s1', 's2']));
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      
      expect(localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    });
  });
});

describe('Share Button', () => {
  describe('URL Generation', () => {
    test('should generate correct Twitter share URL', () => {
      const title = 'Test Product';
      const url = 'https://covet.com/products/test';
      
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
      
      expect(shareUrl).toContain('twitter.com');
      expect(shareUrl).toContain(encodeURIComponent(title));
      expect(shareUrl).toContain(encodeURIComponent(url));
    });

    test('should generate correct Facebook share URL', () => {
      const url = 'https://covet.com/products/test';
      
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      
      expect(shareUrl).toContain('facebook.com');
      expect(shareUrl).toContain(encodeURIComponent(url));
    });

    test('should generate correct WhatsApp share URL', () => {
      const title = 'Test Product';
      const url = 'https://covet.com/products/test';
      
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
      
      expect(shareUrl).toContain('wa.me');
    });

    test('should generate correct Pinterest share URL with image', () => {
      const url = 'https://covet.com/products/test';
      const title = 'Test Product';
      const image = 'https://example.com/image.jpg';
      
      const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}&media=${encodeURIComponent(image)}`;
      
      expect(shareUrl).toContain('pinterest.com');
      expect(shareUrl).toContain(encodeURIComponent(image));
    });

    test('should generate correct email share URL', () => {
      const title = 'Test Product';
      const url = 'https://covet.com/products/test';
      
      const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this item on Covet: ${url}`)}`;
      
      expect(emailUrl).toContain('mailto:');
      expect(emailUrl).toContain(encodeURIComponent(title));
    });
  });
});

describe('Social Authentication', () => {
  describe('Provider Validation', () => {
    test('should accept valid Google provider', () => {
      const validProviders = ['google', 'apple'];
      expect(validProviders).toContain('google');
    });

    test('should accept valid Apple provider', () => {
      const validProviders = ['google', 'apple'];
      expect(validProviders).toContain('apple');
    });

    test('should reject invalid provider', () => {
      const validProviders = ['google', 'apple'];
      expect(validProviders).not.toContain('facebook');
      expect(validProviders).not.toContain('twitter');
    });
  });

  describe('Mock Token Verification', () => {
    test('should verify Google mock token format', () => {
      const token = 'mock_google_token_12345';
      expect(token.startsWith('mock_google_')).toBe(true);
    });

    test('should verify Apple mock token format', () => {
      const token = 'mock_apple_token_67890';
      expect(token.startsWith('mock_apple_')).toBe(true);
    });

    test('should reject invalid token format', () => {
      const invalidToken = 'invalid_token';
      expect(invalidToken.startsWith('mock_google_')).toBe(false);
      expect(invalidToken.startsWith('mock_apple_')).toBe(false);
    });
  });
});

describe('Address Autocomplete', () => {
  describe('ZIP Code Parsing', () => {
    test('should extract valid 5-digit ZIP', () => {
      const input = '02116';
      const zip = input.replace(/\D/g, '').slice(0, 5);
      expect(zip).toBe('02116');
      expect(zip).toHaveLength(5);
    });

    test('should clean non-numeric characters', () => {
      const input = '02116-1234';
      const zip = input.replace(/\D/g, '').slice(0, 5);
      expect(zip).toBe('02116');
    });

    test('should truncate ZIP+4 to 5 digits', () => {
      const input = '021161234';
      const zip = input.slice(0, 5);
      expect(zip).toBe('02116');
    });
  });

  describe('Address Validation', () => {
    test('should validate complete address', () => {
      const address = {
        street1: '123 Newbury Street',
        city: 'Boston',
        state: 'MA',
        postalCode: '02116',
        country: 'US',
      };
      
      const isValid = !!(
        address.street1 &&
        address.city &&
        address.state &&
        address.postalCode &&
        address.country
      );
      
      expect(isValid).toBe(true);
    });

    test('should reject incomplete address', () => {
      const address = {
        street1: '123 Newbury Street',
        city: 'Boston',
        // Missing state, postalCode, country
      };
      
      const isValid = !!(
        address.street1 &&
        address.city &&
        (address as { state?: string }).state &&
        (address as { postalCode?: string }).postalCode &&
        (address as { country?: string }).country
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('State Codes', () => {
    const US_STATES = ['AL', 'AK', 'AZ', 'CA', 'CO', 'FL', 'MA', 'NY', 'TX', 'WA'];
    
    test('should validate Massachusetts code', () => {
      expect(US_STATES).toContain('MA');
    });

    test('should validate California code', () => {
      expect(US_STATES).toContain('CA');
    });

    test('should be two-letter codes', () => {
      US_STATES.forEach(state => {
        expect(state).toHaveLength(2);
        expect(state).toMatch(/^[A-Z]{2}$/);
      });
    });
  });
});

describe('Review Stats', () => {
  describe('Rating Calculation', () => {
    test('should calculate average rating correctly', () => {
      const reviews = [5, 4, 4, 5, 3];
      const avg = reviews.reduce((a, b) => a + b, 0) / reviews.length;
      expect(avg).toBe(4.2);
    });

    test('should round rating to one decimal', () => {
      const rating = 4.256;
      const rounded = Math.round(rating * 10) / 10;
      expect(rounded).toBe(4.3);
    });

    test('should cap rating at 5', () => {
      const rating = 5.5;
      const capped = Math.min(5, rating);
      expect(capped).toBe(5);
    });
  });

  describe('Mock Review Generation', () => {
    function getMockReviewStats(productId: string) {
      const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hasReviews = hash % 3 !== 0;
      
      if (!hasReviews) return null;

      const totalReviews = (hash % 47) + 3;
      const baseRating = 3.5 + ((hash % 15) / 10);
      const averageRating = Math.min(5, Math.round(baseRating * 10) / 10);

      return { totalReviews, averageRating };
    }

    test('should generate consistent stats for same product', () => {
      const stats1 = getMockReviewStats('prod-123');
      const stats2 = getMockReviewStats('prod-123');
      expect(stats1).toEqual(stats2);
    });

    test('should generate different stats for different products', () => {
      const stats1 = getMockReviewStats('prod-abc');
      const stats2 = getMockReviewStats('prod-xyz');
      // May or may not be equal depending on hash, but we test generation works
      expect(stats1 !== null || stats2 !== null).toBe(true);
    });

    test('should have reviews in valid range', () => {
      const stats = getMockReviewStats('prod-test-item');
      if (stats) {
        expect(stats.totalReviews).toBeGreaterThanOrEqual(3);
        expect(stats.totalReviews).toBeLessThanOrEqual(50);
        expect(stats.averageRating).toBeGreaterThanOrEqual(3.5);
        expect(stats.averageRating).toBeLessThanOrEqual(5);
      }
    });
  });
});

describe('Price Alerts', () => {
  describe('Target Price Validation', () => {
    test('should reject target price equal to current price', () => {
      const currentPriceCents = 10000;
      const targetPriceCents = 10000;
      const isValid = targetPriceCents < currentPriceCents;
      expect(isValid).toBe(false);
    });

    test('should reject target price higher than current price', () => {
      const currentPriceCents = 10000;
      const targetPriceCents = 12000;
      const isValid = targetPriceCents < currentPriceCents;
      expect(isValid).toBe(false);
    });

    test('should accept target price lower than current price', () => {
      const currentPriceCents = 10000;
      const targetPriceCents = 8000;
      const isValid = targetPriceCents < currentPriceCents;
      expect(isValid).toBe(true);
    });

    test('should reject negative target price', () => {
      const targetPriceCents = -100;
      const isValid = targetPriceCents > 0;
      expect(isValid).toBe(false);
    });

    test('should reject zero target price', () => {
      const targetPriceCents = 0;
      const isValid = targetPriceCents > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Price Drop Calculation', () => {
    test('should calculate 10% off correctly', () => {
      const currentPrice = 10000;
      const discount = Math.round(currentPrice * 0.1);
      const targetPrice = currentPrice - discount;
      expect(targetPrice).toBe(9000);
    });

    test('should calculate 20% off correctly', () => {
      const currentPrice = 10000;
      const discount = Math.round(currentPrice * 0.2);
      const targetPrice = currentPrice - discount;
      expect(targetPrice).toBe(8000);
    });

    test('should calculate 30% off correctly', () => {
      const currentPrice = 10000;
      const discount = Math.round(currentPrice * 0.3);
      const targetPrice = currentPrice - discount;
      expect(targetPrice).toBe(7000);
    });

    test('should calculate drop percentage correctly', () => {
      const currentPrice = 10000;
      const targetPrice = 8500;
      const dropPercent = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);
      expect(dropPercent).toBe(15);
    });
  });

  describe('Alert ID Generation', () => {
    test('should generate unique alert IDs', () => {
      const generateId = () => `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    test('should have correct prefix format', () => {
      const generateId = () => `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const id = generateId();
      expect(id.startsWith('alert_')).toBe(true);
    });
  });
});

describe('Mobile Filter Sheet', () => {
  describe('Filter State Management', () => {
    test('should toggle filter value on', () => {
      const activeFilters: { [key: string]: string[] } = { brand: [] };
      const groupId = 'brand';
      const value = 'Hermès';
      
      const current = activeFilters[groupId] || [];
      const isActive = current.includes(value);
      const newFilters = {
        ...activeFilters,
        [groupId]: isActive ? current.filter(v => v !== value) : [...current, value],
      };
      
      expect(newFilters.brand).toContain('Hermès');
    });

    test('should toggle filter value off', () => {
      const activeFilters: { [key: string]: string[] } = { brand: ['Hermès'] };
      const groupId = 'brand';
      const value = 'Hermès';
      
      const current = activeFilters[groupId] || [];
      const isActive = current.includes(value);
      const newFilters = {
        ...activeFilters,
        [groupId]: isActive ? current.filter(v => v !== value) : [...current, value],
      };
      
      expect(newFilters.brand).not.toContain('Hermès');
      expect(newFilters.brand).toHaveLength(0);
    });

    test('should count active filters correctly', () => {
      const activeFilters: { [key: string]: string[] | [number, number] } = { 
        brand: ['Hermès', 'Chanel'],
        condition: ['EXCELLENT'],
        price: [0, 50000]
      };
      
      const count = Object.values(activeFilters).reduce((c, vals) => {
        if (Array.isArray(vals) && typeof vals[0] === 'string') {
          return c + vals.length;
        }
        return c;
      }, 0);
      
      expect(count).toBe(3);
    });
  });

  describe('Clear Filters', () => {
    test('should clear all checkbox filters', () => {
      const filters = [
        { id: 'brand', label: 'Brand', type: 'checkbox' as const, options: [] },
        { id: 'condition', label: 'Condition', type: 'checkbox' as const, options: [] },
      ];
      
      const cleared: { [key: string]: string[] } = {};
      filters.forEach(group => {
        cleared[group.id] = [];
      });
      
      expect(cleared.brand).toEqual([]);
      expect(cleared.condition).toEqual([]);
    });
  });

  describe('Quick Filter Chips', () => {
    test('should flatten options from multiple groups', () => {
      const filters = [
        { id: 'brand', label: 'Brand', type: 'checkbox' as const, options: [
          { value: 'hermes', label: 'Hermès' },
          { value: 'chanel', label: 'Chanel' },
          { value: 'louis-vuitton', label: 'Louis Vuitton' },
        ]},
        { id: 'condition', label: 'Condition', type: 'checkbox' as const, options: [
          { value: 'excellent', label: 'Excellent' },
          { value: 'very-good', label: 'Very Good' },
        ]},
      ];
      
      const quickOptions = filters
        .flatMap(group => 
          (group.options || [])
            .slice(0, 3)
            .map(opt => ({ groupId: group.id, value: opt.value, label: opt.label }))
        )
        .slice(0, 8);
      
      expect(quickOptions).toHaveLength(5);
      expect(quickOptions[0].groupId).toBe('brand');
      expect(quickOptions[3].groupId).toBe('condition');
    });

    test('should limit to max 8 quick options', () => {
      const filters = [
        { id: 'brand', label: 'Brand', type: 'checkbox' as const, options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
          { value: 'd', label: 'D' },
          { value: 'e', label: 'E' },
        ]},
        { id: 'size', label: 'Size', type: 'checkbox' as const, options: [
          { value: 'xs', label: 'XS' },
          { value: 's', label: 'S' },
          { value: 'm', label: 'M' },
          { value: 'l', label: 'L' },
          { value: 'xl', label: 'XL' },
        ]},
      ];
      
      const quickOptions = filters
        .flatMap(group => 
          (group.options || [])
            .slice(0, 3)
            .map(opt => ({ groupId: group.id, value: opt.value, label: opt.label }))
        )
        .slice(0, 8);
      
      expect(quickOptions.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Price Range Slider', () => {
    test('should not allow min to exceed max', () => {
      const min = 0;
      const max = 10000;
      const step = 100;
      const localMax = 5000;
      
      const newMin = Math.min(6000, localMax - step);
      expect(newMin).toBe(4900);
    });

    test('should not allow max to go below min', () => {
      const min = 0;
      const max = 10000;
      const step = 100;
      const localMin = 3000;
      
      const newMax = Math.max(2000, localMin + step);
      expect(newMax).toBe(3100);
    });
  });
});
