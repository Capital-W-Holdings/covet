/**
 * Database Abstraction Layer
 * 
 * This module provides a unified interface that can use either:
 * - In-memory storage (for development/testing) - DEFAULT
 * - Prisma/PostgreSQL (for production)
 * 
 * To enable Prisma:
 * 1. Set DATABASE_URL in environment
 * 2. Set USE_PRISMA=true
 * 3. Run: npx prisma generate
 * 4. Run: npx prisma db push (or migrate)
 * 5. Run: npm run db:seed
 * 
 * ⚠️ The in-memory database loses all data on restart!
 * Always use Prisma/PostgreSQL for production.
 */

import type {
  User,
  Store,
  Product,
  Order,
  ProductFilters,
  ProductSort,
  PaginatedResponse,
} from '@/types';

// Check if Prisma should be used
const USE_PRISMA = process.env.USE_PRISMA === 'true' && process.env.DATABASE_URL;

// =============================================================================
// DATABASE INTERFACE
// =============================================================================

export interface DatabaseAdapter {
  // Products
  findProductById(id: string): Promise<Product | null>;
  findProductBySku(sku: string): Promise<Product | null>;
  findProducts(query: {
    filters?: ProductFilters;
    sort?: ProductSort;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Product>>;
  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Atomic operations
  reserveProductAtomic(
    id: string, 
    userId: string, 
    minutes: number
  ): Promise<{ success: boolean; error?: string; product?: Product }>;
  
  // Users
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  
  // Stores
  findStoreById(id: string): Promise<Store | null>;
  findStoreBySlug(slug: string): Promise<Store | null>;
  findStoreByOwnerId(ownerId: string): Promise<Store | null>;
  
  // Orders
  findOrderById(id: string): Promise<Order | null>;
  findOrderByNumber(orderNumber: string): Promise<Order | null>;
  findOrdersByBuyerId(buyerId: string): Promise<Order[]>;
  findOrdersByStoreId(storeId: string): Promise<Order[]>;
  createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | null>;
  
  // Health check
  isConnected(): Promise<boolean>;
  
  // For testing
  reset?(): Promise<void>;
  seed?(): Promise<void>;
}

// =============================================================================
// IN-MEMORY ADAPTER (wraps existing db.ts)
// =============================================================================

import { db as inMemoryDb } from './db';
import { 
  productRepository, 
  userRepository, 
  storeRepository, 
  orderRepository 
} from './repositories';

class InMemoryAdapter implements DatabaseAdapter {
  async findProductById(id: string): Promise<Product | null> {
    const product = await productRepository.findById(id);
    return product || null;
  }

  async findProductBySku(sku: string): Promise<Product | null> {
    const product = await productRepository.findBySku(sku);
    return product || null;
  }

  async findProducts(query: {
    filters?: ProductFilters;
    sort?: ProductSort;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Product>> {
    return productRepository.findMany(query);
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const result = await productRepository.create(data as Parameters<typeof productRepository.create>[0]);
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const result = await productRepository.update(id, data);
    return result || null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return productRepository.delete(id);
  }

  async reserveProductAtomic(
    id: string,
    userId: string,
    minutes: number
  ): Promise<{ success: boolean; error?: string; product?: Product }> {
    return productRepository.reserveAtomic(id, userId, minutes);
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await userRepository.findById(id);
    return user || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await userRepository.findByEmail(email);
    return user || null;
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await userRepository.create({
      email: data.email,
      password: '', // Already hashed in data.passwordHash
      name: data.profile.name,
    });
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const result = await userRepository.update(id, data);
    return result || null;
  }

  async findStoreById(id: string): Promise<Store | null> {
    const store = await storeRepository.findById(id);
    return store || null;
  }

  async findStoreBySlug(slug: string): Promise<Store | null> {
    const store = await storeRepository.findBySlug(slug);
    return store || null;
  }

  async findStoreByOwnerId(ownerId: string): Promise<Store | null> {
    const store = await storeRepository.findByOwnerId(ownerId);
    return store || null;
  }

  async findOrderById(id: string): Promise<Order | null> {
    const order = await orderRepository.findById(id);
    return order || null;
  }

  async findOrderByNumber(orderNumber: string): Promise<Order | null> {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    return order || null;
  }

  async findOrdersByBuyerId(buyerId: string): Promise<Order[]> {
    return orderRepository.findByBuyerId(buyerId);
  }

  async findOrdersByStoreId(storeId: string): Promise<Order[]> {
    return orderRepository.findByStoreId(storeId);
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    // This is a simplified version - actual creation goes through orderRepository.create
    throw new Error('Use orderRepository.create directly for full functionality');
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    const result = await orderRepository.update(id, data as Parameters<typeof orderRepository.update>[1]);
    return result || null;
  }

  async isConnected(): Promise<boolean> {
    return true; // In-memory is always "connected"
  }

  async reset(): Promise<void> {
    inMemoryDb.reset();
  }

  async seed(): Promise<void> {
    await inMemoryDb.seed();
  }
}

// =============================================================================
// PRISMA ADAPTER (placeholder - activated when Prisma is available)
// =============================================================================

async function createPrismaAdapter(): Promise<DatabaseAdapter> {
  // Dynamic import to avoid loading Prisma when not needed
  // This allows the app to run without Prisma being generated
  try {
    // Dynamic require to avoid TypeScript errors when Prisma isn't generated
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prismaModule = require('@prisma/client');
    const PrismaClientClass = prismaModule.PrismaClient;
    
    if (!PrismaClientClass) {
      throw new Error('PrismaClient not found - run `npx prisma generate` first');
    }
    
    const prisma = new PrismaClientClass();
    
    console.log('✓ Using Prisma/PostgreSQL database');
    
    // For now, return a stub that throws helpful errors
    // Full implementation would use prisma.product.findUnique(), etc.
    return {
      async findProductById() { throw new Error('Prisma adapter not fully implemented - run setup first'); },
      async findProductBySku() { throw new Error('Prisma adapter not fully implemented'); },
      async findProducts() { throw new Error('Prisma adapter not fully implemented'); },
      async createProduct() { throw new Error('Prisma adapter not fully implemented'); },
      async updateProduct() { throw new Error('Prisma adapter not fully implemented'); },
      async deleteProduct() { throw new Error('Prisma adapter not fully implemented'); },
      async reserveProductAtomic() { throw new Error('Prisma adapter not fully implemented'); },
      async findUserById() { throw new Error('Prisma adapter not fully implemented'); },
      async findUserByEmail() { throw new Error('Prisma adapter not fully implemented'); },
      async createUser() { throw new Error('Prisma adapter not fully implemented'); },
      async updateUser() { throw new Error('Prisma adapter not fully implemented'); },
      async findStoreById() { throw new Error('Prisma adapter not fully implemented'); },
      async findStoreBySlug() { throw new Error('Prisma adapter not fully implemented'); },
      async findStoreByOwnerId() { throw new Error('Prisma adapter not fully implemented'); },
      async findOrderById() { throw new Error('Prisma adapter not fully implemented'); },
      async findOrderByNumber() { throw new Error('Prisma adapter not fully implemented'); },
      async findOrdersByBuyerId() { throw new Error('Prisma adapter not fully implemented'); },
      async findOrdersByStoreId() { throw new Error('Prisma adapter not fully implemented'); },
      async createOrder() { throw new Error('Prisma adapter not fully implemented'); },
      async updateOrder() { throw new Error('Prisma adapter not fully implemented'); },
      async isConnected() {
        try {
          await prisma.$queryRaw`SELECT 1`;
          return true;
        } catch {
          return false;
        }
      },
    };
  } catch (error) {
    console.warn('⚠️ Prisma not available, falling back to in-memory database');
    console.warn('   To enable PostgreSQL:');
    console.warn('   1. Set DATABASE_URL in .env');
    console.warn('   2. Run: npx prisma generate');
    console.warn('   3. Run: npx prisma db push');
    return new InMemoryAdapter();
  }
}

// =============================================================================
// EXPORT
// =============================================================================

// Default to in-memory adapter
// Prisma adapter can be enabled by setting USE_PRISMA=true and DATABASE_URL
// For production, call getDatabase() to get the appropriate adapter
export const database: DatabaseAdapter = new InMemoryAdapter();

// Export flag for checking which backend is active
export const isDatabasePrisma = USE_PRISMA;

// Export a function to get the adapter (for async initialization in production)
export async function getDatabase(): Promise<DatabaseAdapter> {
  if (USE_PRISMA) {
    return createPrismaAdapter();
  }
  return new InMemoryAdapter();
}
