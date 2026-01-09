import { db } from '@/lib/db';
import type { Store } from '@/types';
import { StoreStatus } from '@/types';

export const storeRepository = {
  async findById(id: string): Promise<Store | undefined> {
    await db.seed();
    return db.stores.findById(id);
  },

  async findBySlug(slug: string): Promise<Store | undefined> {
    await db.seed();
    return db.stores.findOne((s) => s.slug === slug);
  },

  async findByOwnerId(ownerId: string): Promise<Store | undefined> {
    await db.seed();
    return db.stores.findOne((s) => s.ownerId === ownerId);
  },

  async findMany(): Promise<Store[]> {
    await db.seed();
    return db.stores.findMany((s) => s.status === StoreStatus.ACTIVE);
  },

  async update(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    await db.seed();
    return db.stores.update(id, updates);
  },

  async getDefault(): Promise<Store | undefined> {
    await db.seed();
    return db.stores.findOne((s) => s.slug === 'covet-boston');
  },
};
