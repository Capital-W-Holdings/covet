/**
 * Cleanup Expired Reservations Cron Job
 * 
 * Runs every 15 minutes to release products that were reserved but not purchased.
 * Products can be reserved during checkout for up to 30 minutes.
 * 
 * Schedule: every 15 minutes
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return cronUnauthorizedResponse();
  }

  const result = await runCronJob('cleanup-reservations', async () => {
    const now = new Date();
    let processed = 0;
    let errors = 0;
    const expiredReservations: string[] = [];

    if (isDatabasePrisma) {
      // Use Prisma for real database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prisma = (database as unknown as { prisma: any }).prisma;

      // Find all products with expired reservations
      const expiredProducts = await prisma.product.findMany({
        where: {
          reservedUntil: {
            lt: now,
          },
          reservedBy: {
            not: null,
          },
        },
        select: {
          id: true,
          sku: true,
          reservedBy: true,
        },
      }) as Array<{ id: string; sku: string; reservedBy: string | null }>;

      for (const product of expiredProducts) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              reservedBy: null,
              reservedUntil: null,
              status: 'ACTIVE',
            },
          });
          
          processed++;
          expiredReservations.push(product.sku);
          
          logger.info('Released expired reservation', {
            productId: product.id,
            sku: product.sku,
            reservedBy: product.reservedBy,
          });
        } catch (error) {
          errors++;
          logger.error('Failed to release reservation', error, {
            productId: product.id,
          });
        }
      }
    } else {
      // In-memory database handling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = database as unknown as {
        getProducts: () => Array<{
          id: string;
          sku: string;
          reservedBy?: string | null;
          reservedUntil?: Date | null;
          status: string;
        }>;
        updateProduct: (id: string, data: Record<string, unknown>) => void;
      };

      const products = db.getProducts?.() || [];
      const expiredProducts = products.filter(
        p => p.reservedUntil && new Date(p.reservedUntil) < now && p.reservedBy
      );

      for (const product of expiredProducts) {
        try {
          db.updateProduct(product.id, {
            reservedBy: null,
            reservedUntil: null,
            status: 'ACTIVE',
          });
          
          processed++;
          expiredReservations.push(product.sku);
        } catch (error) {
          errors++;
        }
      }
    }

    return {
      success: errors === 0,
      processed,
      errors,
      details: {
        expiredReservations,
        timestamp: now.toISOString(),
      },
    };
  });

  return cronResponse(result);
}

// Allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
