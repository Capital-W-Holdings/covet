import { db } from '@/lib/db';
import type { Result, Order } from '@/types';
import type { Review, CreateReviewDTO, ReviewStats } from '@/types/review';
import { ReviewStatus, OrderStatus } from '@/types';
import { v4 as uuid } from 'uuid';

export const reviewRepository = {
  async findById(id: string): Promise<Review | undefined> {
    await db.seed();
    return db.reviews.findById(id);
  },

  async findByOrderId(orderId: string): Promise<Review | undefined> {
    await db.seed();
    return db.reviews.findOne((r) => r.orderId === orderId);
  },

  async findByProductId(productId: string, limit = 10): Promise<Review[]> {
    await db.seed();
    return db.reviews
      .findMany((r) => r.productId === productId && r.status === ReviewStatus.PUBLISHED)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async findByStoreId(storeId: string, limit = 50): Promise<Review[]> {
    await db.seed();
    return db.reviews
      .findMany((r) => r.storeId === storeId && r.status === ReviewStatus.PUBLISHED)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async findByBuyerId(buyerId: string): Promise<Review[]> {
    await db.seed();
    return db.reviews
      .findMany((r) => r.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(
    buyerId: string,
    buyerName: string,
    order: Order,
    dto: CreateReviewDTO
  ): Promise<Result<Review, Error>> {
    await db.seed();

    // Check if review already exists
    const existing = await this.findByOrderId(dto.orderId);
    if (existing) {
      return { success: false, error: new Error('Review already exists for this order') };
    }

    // Validate order status
    if (order.status !== OrderStatus.DELIVERED) {
      return { success: false, error: new Error('Can only review delivered orders') };
    }

    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      return { success: false, error: new Error('Rating must be between 1 and 5') };
    }

    const review: Review = {
      id: uuid(),
      orderId: order.id,
      productId: order.item.productId,
      storeId: order.storeId,
      buyerId,
      buyerName,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      images: dto.images,
      status: ReviewStatus.PUBLISHED, // Auto-publish for now
      helpfulCount: 0,
      verifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.reviews.create(review);
    return { success: true, data: review };
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<Review | undefined> {
    await db.seed();
    return db.reviews.update(id, { status });
  },

  async incrementHelpful(id: string): Promise<Review | undefined> {
    await db.seed();
    const review = await this.findById(id);
    if (!review) return undefined;
    return db.reviews.update(id, { helpfulCount: review.helpfulCount + 1 });
  },

  async getStatsForStore(storeId: string): Promise<ReviewStats> {
    await db.seed();
    const reviews = db.reviews.findMany(
      (r) => r.storeId === storeId && r.status === ReviewStatus.PUBLISHED
    );

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  },

  async getStatsForProduct(productId: string): Promise<ReviewStats> {
    await db.seed();
    const reviews = db.reviews.findMany(
      (r) => r.productId === productId && r.status === ReviewStatus.PUBLISHED
    );

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  },

  async getPendingReviews(): Promise<Review[]> {
    await db.seed();
    return db.reviews.findMany((r) => r.status === ReviewStatus.PENDING);
  },

  async getFlaggedReviews(): Promise<Review[]> {
    await db.seed();
    return db.reviews.findMany((r) => r.status === ReviewStatus.FLAGGED);
  },
};
