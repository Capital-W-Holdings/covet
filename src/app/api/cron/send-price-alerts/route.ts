/**
 * Send Price Alerts Cron Job
 * 
 * Runs every 4 hours to check for price drops and notify users.
 * Users can set alerts on products they're watching.
 * 
 * Schedule: every 4 hours
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
export const maxDuration = 120;

interface PriceAlert {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  productSku: string;
  targetPriceCents: number;
  currentPriceCents: number;
  triggered: boolean;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return cronUnauthorizedResponse();
  }

  const result = await runCronJob('send-price-alerts', async () => {
    let processed = 0;
    let errors = 0;
    const alertsSent: Array<{
      productSku: string;
      userEmail: string;
      oldPrice: number;
      newPrice: number;
    }> = [];

    if (isDatabasePrisma) {
      // In production, query price_alerts table joined with products
      // For now, this is a placeholder implementation
      
      logger.info('Price alert check running with Prisma');
      
      // Example query structure:
      // SELECT pa.*, p.priceCents, p.title, u.email
      // FROM price_alerts pa
      // JOIN products p ON pa.productId = p.id
      // JOIN users u ON pa.userId = u.id
      // WHERE pa.targetPriceCents >= p.priceCents
      // AND pa.notified = false
      // AND p.status = 'ACTIVE'

      // Placeholder: In real implementation, this would:
      // 1. Query active alerts where current price <= target price
      // 2. Send email to each user
      // 3. Mark alerts as notified
      // 4. Optionally deactivate one-time alerts
      
    } else {
      // In-memory database simulation
      // Simulate finding triggered alerts
      const mockAlerts: PriceAlert[] = [
        // In real implementation, this would come from database
      ];

      for (const alert of mockAlerts) {
        if (alert.currentPriceCents <= alert.targetPriceCents && !alert.triggered) {
          try {
            // Send email notification
            await sendPriceAlertEmail({
              to: alert.userEmail,
              productTitle: alert.productTitle,
              productSku: alert.productSku,
              originalPrice: alert.targetPriceCents,
              newPrice: alert.currentPriceCents,
            });

            processed++;
            alertsSent.push({
              productSku: alert.productSku,
              userEmail: maskEmail(alert.userEmail),
              oldPrice: alert.targetPriceCents / 100,
              newPrice: alert.currentPriceCents / 100,
            });

            logger.info('Price alert sent', {
              alertId: alert.id,
              productSku: alert.productSku,
              priceDrop: ((alert.targetPriceCents - alert.currentPriceCents) / alert.targetPriceCents * 100).toFixed(1) + '%',
            });
          } catch (error) {
            errors++;
            logger.error('Failed to send price alert', error, {
              alertId: alert.id,
            });
          }
        }
      }
    }

    return {
      success: errors === 0,
      processed,
      errors,
      details: {
        alertsSent,
        checkTime: new Date().toISOString(),
      },
    };
  });

  return cronResponse(result);
}

/**
 * Send price alert email (placeholder)
 */
async function sendPriceAlertEmail(params: {
  to: string;
  productTitle: string;
  productSku: string;
  originalPrice: number;
  newPrice: number;
}): Promise<void> {
  // In production, integrate with email service
  // For now, just log
  logger.info('Would send price alert email', {
    to: maskEmail(params.to),
    product: params.productTitle,
    savings: ((params.originalPrice - params.newPrice) / 100).toFixed(2),
  });
}

/**
 * Mask email for logging (privacy)
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  
  const maskedLocal = local.length > 2 
    ? local[0] + '***' + local[local.length - 1]
    : '***';
  
  return `${maskedLocal}@${domain}`;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
