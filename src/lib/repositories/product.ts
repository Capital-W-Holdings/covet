import { db } from '@/lib/db';
import type { Product, CreateProductDTO, UpdateProductDTO, ProductQuery, PaginatedResponse, Result } from '@/types';
import { ProductStatus, AuthenticationStatus } from '@/types';
import { v4 as uuid } from 'uuid';
import { generateSku } from '@/lib/utils';

export const productRepository = {
  async findById(id: string): Promise<Product | undefined> {
    await db.seed();
    return db.products.findById(id);
  },

  async findBySku(sku: string): Promise<Product | undefined> {
    await db.seed();
    return db.products.findOne((p) => p.sku === sku);
  },

  async findMany(query: ProductQuery = {}): Promise<PaginatedResponse<Product>> {
    await db.seed();
    const { filters = {}, sort, page = 1, pageSize = 12 } = query;

    let products = db.products.findMany((p) => {
      // By default, only show active products unless status filter is specified
      if (!filters.status && p.status !== ProductStatus.ACTIVE) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.brand && !p.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
      if (filters.condition && p.condition !== filters.condition) return false;
      if (filters.minPrice && p.priceCents < filters.minPrice) return false;
      if (filters.maxPrice && p.priceCents > filters.maxPrice) return false;
      if (filters.authStatus && p.authenticationStatus !== filters.authStatus) return false;
      if (filters.storeId && p.storeId !== filters.storeId) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(searchLower);
        const matchesBrand = p.brand.toLowerCase().includes(searchLower);
        const matchesDescription = p.description.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesBrand && !matchesDescription) return false;
      }
      return true;
    });

    // Sort
    if (sort) {
      products.sort((a, b) => {
        let comparison = 0;
        switch (sort.field) {
          case 'price':
            comparison = a.priceCents - b.priceCents;
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'viewCount':
            comparison = a.viewCount - b.viewCount;
            break;
        }
        return sort.order === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default sort: newest first
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = products.length;
    const start = (page - 1) * pageSize;
    const items = products.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
  },

  async create(dto: CreateProductDTO): Promise<Result<Product>> {
    await db.seed();

    const sku = generateSku(dto.brand, dto.title);
    const existing = await this.findBySku(sku);
    if (existing) {
      return { success: false, error: new Error('SKU already exists') };
    }

    const product: Product = {
      id: uuid(),
      storeId: dto.storeId,
      sku,
      title: dto.title,
      description: dto.description,
      brand: dto.brand,
      category: dto.category,
      subcategory: dto.subcategory,
      condition: dto.condition,
      priceCents: dto.priceCents,
      originalPriceCents: dto.originalPriceCents,
      images: dto.images,
      authenticationStatus: dto.storeId === 'store_covet'
        ? AuthenticationStatus.COVET_CERTIFIED
        : AuthenticationStatus.STORE_CERTIFIED,
      status: ProductStatus.DRAFT,
      metadata: dto.metadata || {},
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.products.create(product);
    return { success: true, data: product };
  },

  async update(id: string, dto: UpdateProductDTO): Promise<Product | undefined> {
    await db.seed();
    // Build update data, converting null to undefined
    const updateData: Partial<Product> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.priceCents !== undefined) updateData.priceCents = dto.priceCents;
    if (dto.originalPriceCents !== undefined && dto.originalPriceCents !== null) {
      updateData.originalPriceCents = dto.originalPriceCents;
    }
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.condition !== undefined) updateData.condition = dto.condition;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
    return db.products.update(id, updateData);
  },

  async delete(id: string): Promise<boolean> {
    await db.seed();
    return db.products.delete(id);
  },

  async incrementViewCount(id: string): Promise<void> {
    await db.seed();
    const product = db.products.findById(id);
    if (product) {
      db.products.update(id, { viewCount: product.viewCount + 1 });
    }
  },

  async reserve(id: string, userId: string, minutes = 10): Promise<boolean> {
    await db.seed();
    const product = db.products.findById(id);
    if (!product || product.status !== ProductStatus.ACTIVE) return false;

    const reservedUntil = new Date(Date.now() + minutes * 60 * 1000);
    db.products.update(id, {
      status: ProductStatus.RESERVED,
      reservedBy: userId,
      reservedUntil,
    });
    return true;
  },

  /**
   * Atomic reserve - check status and reserve in single operation
   * Returns true only if product was ACTIVE and is now RESERVED by this user
   * This prevents double-sell race conditions
   */
  async reserveAtomic(
    id: string, 
    userId: string, 
    minutes = 10
  ): Promise<{ success: boolean; error?: string }> {
    await db.seed();
    
    // In a real database, this would be a single atomic transaction:
    // UPDATE products SET status='RESERVED', reservedBy=?, reservedUntil=?
    // WHERE id=? AND status='ACTIVE'
    // RETURNING *
    
    const product = db.products.findById(id);
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    // Check if already reserved by this user (idempotent)
    if (
      product.status === ProductStatus.RESERVED && 
      product.reservedBy === userId &&
      product.reservedUntil &&
      product.reservedUntil > new Date()
    ) {
      return { success: true }; // Already reserved by same user
    }
    
    // Check if available
    if (product.status !== ProductStatus.ACTIVE) {
      if (product.status === ProductStatus.SOLD) {
        return { success: false, error: 'This item has been sold' };
      }
      if (product.status === ProductStatus.RESERVED) {
        return { success: false, error: 'This item is currently reserved by another buyer' };
      }
      return { success: false, error: 'This item is no longer available' };
    }
    
    // Reserve it
    const reservedUntil = new Date(Date.now() + minutes * 60 * 1000);
    db.products.update(id, {
      status: ProductStatus.RESERVED,
      reservedBy: userId,
      reservedUntil,
    });
    
    return { success: true };
  },

  async releaseReservation(id: string): Promise<void> {
    await db.seed();
    db.products.update(id, {
      status: ProductStatus.ACTIVE,
      reservedBy: undefined,
      reservedUntil: undefined,
    });
  },

  async markSold(id: string): Promise<void> {
    await db.seed();
    db.products.update(id, {
      status: ProductStatus.SOLD,
      reservedBy: undefined,
      reservedUntil: undefined,
    });
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    await db.seed();
    return db.products
      .findMany((p) => p.status === ProductStatus.ACTIVE)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  },

  async getRelated(productId: string, limit = 4): Promise<Product[]> {
    await db.seed();
    const product = db.products.findById(productId);
    if (!product) return [];

    return db.products
      .findMany((p) =>
        p.id !== productId &&
        p.status === ProductStatus.ACTIVE &&
        (p.category === product.category || p.brand === product.brand)
      )
      .slice(0, limit);
  },

  async getBrands(): Promise<string[]> {
    await db.seed();
    const brands = new Set<string>();
    db.products.findMany((p) => p.status === ProductStatus.ACTIVE).forEach((p) => brands.add(p.brand));
    return Array.from(brands).sort();
  },

  async count(storeId?: string): Promise<number> {
    await db.seed();
    if (storeId) {
      return db.products.count((p) => p.storeId === storeId && p.status === ProductStatus.ACTIVE);
    }
    return db.products.count((p) => p.status === ProductStatus.ACTIVE);
  },
};
