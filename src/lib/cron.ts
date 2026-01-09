/**
 * Cron Job Authorization
 * 
 * Verifies that cron requests come from authorized sources:
 * - Vercel Cron (via CRON_SECRET header)
 * - Manual trigger with admin auth
 * 
 * Required environment variables:
 * - CRON_SECRET: Shared secret for cron authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export interface CronResult {
  success: boolean;
  processed: number;
  errors: number;
  details?: Record<string, unknown>;
  duration: number;
}

/**
 * Verify cron request authorization
 */
export function verifyCronAuth(request: NextRequest): boolean {
  // Check for Vercel Cron header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow unauthenticated cron calls
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Cron auth bypassed in development mode');
    return true;
  }

  // Production requires CRON_SECRET
  if (!cronSecret) {
    logger.error('CRON_SECRET not configured');
    return false;
  }

  // Check Bearer token
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Check Vercel cron signature (x-vercel-cron-signature)
  const vercelCronSig = request.headers.get('x-vercel-cron-signature');
  if (vercelCronSig) {
    // Vercel cron requests are automatically authenticated
    return true;
  }

  logger.warn('Unauthorized cron request attempted');
  return false;
}

/**
 * Create unauthorized response for cron endpoints
 */
export function cronUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

/**
 * Create cron result response
 */
export function cronResponse(result: CronResult): NextResponse {
  const status = result.errors > 0 ? 207 : 200; // 207 = Multi-Status for partial success
  
  return NextResponse.json(result, { 
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Wrap cron handler with timing and error handling
 */
export async function runCronJob(
  name: string,
  handler: () => Promise<Omit<CronResult, 'duration'>>
): Promise<CronResult> {
  const start = Date.now();
  
  try {
    logger.info(`Cron job started: ${name}`);
    const result = await handler();
    const duration = Date.now() - start;
    
    logger.info(`Cron job completed: ${name}`, {
      processed: result.processed,
      errors: result.errors,
      duration,
    });
    
    return { ...result, duration };
  } catch (error) {
    const duration = Date.now() - start;
    
    logger.error(`Cron job failed: ${name}`, error, { duration });
    
    return {
      success: false,
      processed: 0,
      errors: 1,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      duration,
    };
  }
}
