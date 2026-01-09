import { db } from '@/lib/db';
import type { Store, Result } from '@/types';
import type { StoreApplication, CreateStoreApplicationDTO, StoreStats, StorePayout } from '@/types/store';
import { StoreApplicationStatus } from '@/types/store';
import { StoreStatus, StoreTier, StoreType, OrderStatus } from '@/types';
import { v4 as uuid } from 'uuid';
import { slugify } from '@/lib/utils';

export const storeApplicationRepository = {
  async findById(id: string): Promise<StoreApplication | undefined> {
    await db.seed();
    return db.storeApplications.findById(id);
  },

  async findByUserId(userId: string): Promise<StoreApplication | undefined> {
    await db.seed();
    const applications = db.storeApplications.findAll();
    return applications.find((app) => app.userId === userId);
  },

  async findAll(status?: StoreApplicationStatus): Promise<StoreApplication[]> {
    await db.seed();
    let applications = db.storeApplications.findAll();
    if (status) {
      applications = applications.filter((app) => app.status === status);
    }
    return applications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async create(
    userId: string,
    dto: CreateStoreApplicationDTO
  ): Promise<Result<StoreApplication, Error>> {
    await db.seed();

    // Check if user already has an application
    const existing = await this.findByUserId(userId);
    if (existing) {
      return { success: false, error: new Error('You already have a pending application') };
    }

    const application: StoreApplication = {
      id: uuid(),
      userId,
      ...dto,
      status: StoreApplicationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.storeApplications.create(application);
    return { success: true, data: application };
  },

  async updateStatus(
    id: string,
    status: StoreApplicationStatus,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<StoreApplication | undefined> {
    await db.seed();
    return db.storeApplications.update(id, {
      status,
      reviewedBy,
      reviewNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async approve(
    applicationId: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<Result<Store, Error>> {
    await db.seed();

    const application = await this.findById(applicationId);
    if (!application) {
      return { success: false, error: new Error('Application not found') };
    }

    if (application.status !== StoreApplicationStatus.PENDING && 
        application.status !== StoreApplicationStatus.UNDER_REVIEW) {
      return { success: false, error: new Error('Application cannot be approved') };
    }

    // Update application status
    await this.updateStatus(applicationId, StoreApplicationStatus.APPROVED, reviewedBy, reviewNotes);

    // Create the store
    const slug = slugify(application.businessName);
    const store: Store = {
      id: uuid(),
      ownerId: application.userId,
      name: application.businessName,
      slug,
      type: StoreType.PARTNER,
      tier: StoreTier.STANDARD,
      status: StoreStatus.ACTIVE,
      branding: {
        logoUrl: '',
        accentColor: '#1a1a1a',
      },
      settings: {
        acceptsOffers: false,
        autoPublish: false,
        defaultShippingDays: 5,
      },
      stripeConnectId: application.stripeConnectId,
      takeRate: 0.06,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.stores.create(store);
    return { success: true, data: store };
  },

  async reject(
    applicationId: string,
    reviewedBy: string,
    reviewNotes: string
  ): Promise<StoreApplication | undefined> {
    return this.updateStatus(applicationId, StoreApplicationStatus.REJECTED, reviewedBy, reviewNotes);
  },

  async requestMoreInfo(
    applicationId: string,
    reviewedBy: string,
    reviewNotes: string
  ): Promise<StoreApplication | undefined> {
    return this.updateStatus(applicationId, StoreApplicationStatus.NEEDS_INFO, reviewedBy, reviewNotes);
  },
};

export const storeStatsRepository = {
  async getStats(storeId: string): Promise<StoreStats> {
    await db.seed();

    const products = db.products.findAll().filter((p) => p.storeId === storeId);
    const orders = db.orders.findAll().filter((o) => o.storeId === storeId);

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
    const soldProducts = products.filter((p) => p.status === 'SOLD').length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => 
      o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED
    ).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalCents, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Calculate conversion rate (views to sales)
    const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
    const conversionRate = totalViews > 0 ? (soldProducts / totalViews) * 100 : 0;

    return {
      totalProducts,
      activeProducts,
      soldProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      averageOrderValue,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  },
};

export const storePayoutRepository = {
  async findByStoreId(storeId: string): Promise<StorePayout[]> {
    await db.seed();
    return db.storePayouts.findAll().filter((p) => p.storeId === storeId);
  },

  async create(storeId: string, amount: number, periodStart: Date, periodEnd: Date, orderCount: number): Promise<StorePayout> {
    const payout: StorePayout = {
      id: uuid(),
      storeId,
      amount,
      currency: 'USD',
      status: 'PENDING',
      periodStart,
      periodEnd,
      orderCount,
      createdAt: new Date(),
    };

    db.storePayouts.create(payout);
    return payout;
  },

  async updateStatus(id: string, status: StorePayout['status'], stripePayoutId?: string): Promise<StorePayout | undefined> {
    return db.storePayouts.update(id, {
      status,
      stripePayoutId,
      completedAt: status === 'COMPLETED' ? new Date() : undefined,
    });
  },
};
