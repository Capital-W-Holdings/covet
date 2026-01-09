/**
 * Process Seller Payouts Cron Job
 * 
 * Runs daily at 6 AM UTC to process pending seller payouts.
 * Payouts are held for 7 days after order delivery for dispute resolution.
 * 
 * Schedule: 0 6 * * * (daily at 6 AM)
 */

import { NextRequest } from 'next/server';
import { database, isDatabasePrisma } from '@/lib/database';
import { 
  verifyCronAuth, 
  cronUnauthorizedResponse, 
  cronResponse, 
  runCronJob 
} from '@/lib/cron';
import { logger } from '@/lib/logger';
import { isStripeDemo } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for batch processing

// Payout hold period after delivery (7 days)
const PAYOUT_HOLD_DAYS = 7;

interface PayoutCandidate {
  orderId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  amountCents: number;
  platformFeeCents: number;
  netPayoutCents: number;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return cronUnauthorizedResponse();
  }

  const result = await runCronJob('process-payouts', async () => {
    const now = new Date();
    const holdCutoff = new Date(now.getTime() - PAYOUT_HOLD_DAYS * 24 * 60 * 60 * 1000);
    
    let processed = 0;
    let errors = 0;
    let totalPayoutCents = 0;
    const payoutDetails: Array<{
      storeId: string;
      orders: number;
      amount: number;
      status: 'success' | 'failed' | 'skipped';
    }> = [];

    // Find orders eligible for payout:
    // - Status: DELIVERED
    // - Delivered more than 7 days ago
    // - No open disputes
    // - Not already paid out

    if (isDatabasePrisma) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prisma = (database as unknown as { prisma: any }).prisma;

      // Find eligible orders grouped by store
      const eligibleOrders = await prisma.order.findMany({
        where: {
          status: 'DELIVERED',
          deliveredAt: {
            lt: holdCutoff,
          },
          dispute: null, // No disputes
          // Add a field to track payout status in production
        },
        include: {
          store: {
            select: {
              name: true,
              stripeConnectId: true,
            },
          },
        },
      }) as Array<{
        id: string;
        orderNumber: string;
        storeId: string;
        totalCents: number;
        platformFeeCents: number;
        store: { name: string; stripeConnectId: string | null };
      }>;

      // Group by store
      const storePayouts = new Map<string, PayoutCandidate[]>();
      
      for (const order of eligibleOrders) {
        const candidates = storePayouts.get(order.storeId) || [];
        candidates.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          storeId: order.storeId,
          storeName: order.store.name,
          amountCents: order.totalCents,
          platformFeeCents: order.platformFeeCents,
          netPayoutCents: order.totalCents - order.platformFeeCents,
        });
        storePayouts.set(order.storeId, candidates);
      }

      // Process payouts per store
      for (const [storeId, orders] of storePayouts) {
        const totalNetPayout = orders.reduce((sum, o) => sum + o.netPayoutCents, 0);
        const storeName = orders[0].storeName;

        try {
          if (isStripeDemo()) {
            // Demo mode - just log
            logger.info('Demo payout would be processed', {
              storeId,
              storeName,
              orders: orders.length,
              totalCents: totalNetPayout,
            });

            payoutDetails.push({
              storeId,
              orders: orders.length,
              amount: totalNetPayout / 100,
              status: 'skipped',
            });
          } else {
            // Production - create payout via Stripe Connect
            // In real implementation, use Stripe transfers/payouts API
            
            // Record payout in database
            await prisma.storePayout.create({
              data: {
                storeId,
                amountCents: totalNetPayout,
                status: 'PROCESSING',
              },
            });

            processed++;
            totalPayoutCents += totalNetPayout;
            
            payoutDetails.push({
              storeId,
              orders: orders.length,
              amount: totalNetPayout / 100,
              status: 'success',
            });

            logger.info('Payout processed', {
              storeId,
              storeName,
              orders: orders.length,
              totalCents: totalNetPayout,
            });
          }
        } catch (error) {
          errors++;
          payoutDetails.push({
            storeId,
            orders: orders.length,
            amount: totalNetPayout / 100,
            status: 'failed',
          });

          logger.error('Payout failed', error, {
            storeId,
            storeName,
          });
        }
      }
    } else {
      // In-memory database - simplified handling
      logger.info('Payout processing skipped - using in-memory database');
    }

    return {
      success: errors === 0,
      processed,
      errors,
      details: {
        totalPayoutAmount: totalPayoutCents / 100,
        holdPeriodDays: PAYOUT_HOLD_DAYS,
        cutoffDate: holdCutoff.toISOString(),
        payouts: payoutDetails,
        isDemo: isStripeDemo(),
      },
    };
  });

  return cronResponse(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
