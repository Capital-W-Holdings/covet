import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { PriceAlert, CreatePriceAlertDTO, PriceAlertWithProduct } from '@/types/priceAlert';
import { productRepository } from '@/lib/repositories';

// =============================================================================
// In-memory storage (would be database in production)
// =============================================================================

const priceAlerts: Map<string, PriceAlert> = new Map();

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// Helper: Get current user from session
// =============================================================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie?.value) return null;
    
    const session = JSON.parse(sessionCookie.value);
    return session.userId || null;
  } catch {
    return null;
  }
}

// =============================================================================
// GET: List user's price alerts
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'AUTH_ERROR',
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    // Get user's alerts
    const userAlerts = Array.from(priceAlerts.values())
      .filter((alert) => alert.userId === userId && alert.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Enrich with product data
    const alertsWithProducts: PriceAlertWithProduct[] = [];
    
    for (const alert of userAlerts) {
      const product = await productRepository.findById(alert.productId);
      if (product) {
        alertsWithProducts.push({
          ...alert,
          currentPriceCents: product.priceCents,
          product: {
            id: product.id,
            sku: product.sku,
            title: product.title,
            brand: product.brand,
            priceCents: product.priceCents,
            images: product.images.slice(0, 1).map((img) => ({
              url: img.url,
              alt: img.alt,
            })),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: alertsWithProducts,
    });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: 'Failed to fetch price alerts',
          code: 'FETCH_ALERTS_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST: Create a new price alert
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'AUTH_ERROR',
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreatePriceAlertDTO;
    const { productId, targetPriceCents } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Product ID is required',
            code: 'MISSING_PRODUCT_ID',
          },
        },
        { status: 400 }
      );
    }

    if (!targetPriceCents || targetPriceCents <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Valid target price is required',
            code: 'INVALID_TARGET_PRICE',
          },
        },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check target price is less than current price
    if (targetPriceCents >= product.priceCents) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Target price must be less than current price',
            code: 'INVALID_TARGET_PRICE',
          },
        },
        { status: 400 }
      );
    }

    // Check if user already has an alert for this product
    const existingAlert = Array.from(priceAlerts.values()).find(
      (alert) => alert.userId === userId && alert.productId === productId && alert.isActive
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.targetPriceCents = targetPriceCents;
      existingAlert.updatedAt = new Date();
      priceAlerts.set(existingAlert.id, existingAlert);

      return NextResponse.json({
        success: true,
        data: existingAlert,
        message: 'Price alert updated',
      });
    }

    // Create new alert
    const alert: PriceAlert = {
      id: generateId(),
      userId,
      productId,
      targetPriceCents,
      currentPriceCents: product.priceCents,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    priceAlerts.set(alert.id, alert);

    // Count watchers for this product
    const watcherCount = Array.from(priceAlerts.values()).filter(
      (a) => a.productId === productId && a.isActive
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        watcherCount,
      },
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: 'Failed to create price alert',
          code: 'CREATE_ALERT_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE: Remove a price alert
// =============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'AUTH_ERROR',
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const productId = searchParams.get('productId');

    if (!alertId && !productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Alert ID or Product ID is required',
            code: 'MISSING_IDENTIFIER',
          },
        },
        { status: 400 }
      );
    }

    let alertToDelete: PriceAlert | undefined;

    if (alertId) {
      alertToDelete = priceAlerts.get(alertId);
    } else if (productId) {
      alertToDelete = Array.from(priceAlerts.values()).find(
        (alert) => alert.userId === userId && alert.productId === productId && alert.isActive
      );
    }

    if (!alertToDelete) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: 'Price alert not found',
            code: 'ALERT_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (alertToDelete.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'FORBIDDEN',
            message: 'Not authorized to delete this alert',
            code: 'NOT_AUTHORIZED',
          },
        },
        { status: 403 }
      );
    }

    // Soft delete
    alertToDelete.isActive = false;
    alertToDelete.updatedAt = new Date();
    priceAlerts.set(alertToDelete.id, alertToDelete);

    return NextResponse.json({
      success: true,
      message: 'Price alert deleted',
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: 'Failed to delete price alert',
          code: 'DELETE_ALERT_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
