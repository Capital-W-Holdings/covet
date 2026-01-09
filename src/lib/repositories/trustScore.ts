import { db } from '@/lib/db';
import { reviewRepository } from './review';
import { disputeRepository } from './dispute';
import type { StoreTrustProfile, TrustScoreFactors } from '@/types/review';
import { OrderStatus, ReviewStatus } from '@/types';

export const trustScoreRepository = {
  async calculateForStore(storeId: string): Promise<StoreTrustProfile> {
    await db.seed();

    // Get all data
    const orders = db.orders.findMany((o) => o.storeId === storeId);
    const completedOrders = orders.filter(
      (o) => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.SHIPPED
    );
    const reviews = db.reviews.findMany(
      (r) => r.storeId === storeId && r.status === ReviewStatus.PUBLISHED
    );
    const disputes = db.disputes.findMany((d) => d.storeId === storeId);

    // Calculate metrics
    const totalOrders = completedOrders.length;
    const totalDisputes = disputes.length;
    const disputeRate = totalOrders > 0 ? (totalDisputes / totalOrders) * 100 : 0;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    const totalReviews = reviews.length;

    // Calculate average ship time (days from confirmed to shipped)
    const shippedOrders = orders.filter(
      (o) => o.shipping.shippedAt && o.status !== OrderStatus.CANCELLED
    );
    let averageShipDays = 0;
    if (shippedOrders.length > 0) {
      const totalDays = shippedOrders.reduce((sum, o) => {
        const created = new Date(o.createdAt).getTime();
        const shipped = new Date(o.shipping.shippedAt!).getTime();
        return sum + (shipped - created) / (1000 * 60 * 60 * 24);
      }, 0);
      averageShipDays = totalDays / shippedOrders.length;
    }

    // Calculate factor scores (each 0-25 points)
    const factors: TrustScoreFactors = {
      // Review score: 5 stars = 25 points, 1 star = 5 points, no reviews = 15 points
      reviewScore: totalReviews > 0
        ? Math.round((averageRating / 5) * 25)
        : 15,

      // Dispute score: 0% disputes = 25 points, 10%+ = 0 points
      disputeScore: Math.round(Math.max(0, 25 - (disputeRate * 2.5))),

      // Fulfillment score: ≤2 days = 25 points, ≥7 days = 5 points
      fulfillmentScore: totalOrders > 0
        ? Math.round(Math.max(5, Math.min(25, 25 - ((averageShipDays - 2) * 4))))
        : 15,

      // Volume score: 100+ orders = 25 points, 0 orders = 5 points
      volumeScore: Math.round(Math.min(25, 5 + (totalOrders / 5))),
    };

    // Calculate total trust score
    const trustScore = Math.round(
      factors.reviewScore + factors.disputeScore + factors.fulfillmentScore + factors.volumeScore
    );

    // Determine badges
    const badges: string[] = [];
    if (trustScore >= 90) badges.push('TOP_RATED');
    if (totalOrders >= 100) badges.push('HIGH_VOLUME');
    if (disputeRate === 0 && totalOrders >= 10) badges.push('DISPUTE_FREE');
    if (averageRating >= 4.8 && totalReviews >= 10) badges.push('CUSTOMER_FAVORITE');
    if (averageShipDays <= 1 && totalOrders >= 5) badges.push('FAST_SHIPPER');

    return {
      storeId,
      trustScore,
      factors,
      totalOrders,
      totalDisputes,
      disputeRate: Math.round(disputeRate * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      averageShipDays: Math.round(averageShipDays * 10) / 10,
      badges,
      lastCalculated: new Date(),
    };
  },

  async updateStoreTrustScore(storeId: string): Promise<number> {
    const profile = await this.calculateForStore(storeId);
    
    // Update the store's trust score
    db.stores.update(storeId, { trustScore: profile.trustScore });
    
    return profile.trustScore;
  },

  async recalculateAllStores(): Promise<void> {
    await db.seed();
    const stores = db.stores.findAll();
    
    for (const store of stores) {
      await this.updateStoreTrustScore(store.id);
    }
  },
};
