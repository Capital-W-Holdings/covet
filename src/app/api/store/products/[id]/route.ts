import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeRepository, productRepository } from '@/lib/repositories';
import { updateProductSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { UserRole } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/store/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product || product.storeId !== store.id) {
      throw new NotFoundError('Product');
    }

    return createSuccessResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/store/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product || product.storeId !== store.id) {
      throw new NotFoundError('Product');
    }

    const body = await request.json();

    // Validate input
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const updated = await productRepository.update(id, parsed.data);

    return createSuccessResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/store/products/[id] - Delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN && session.role !== UserRole.COVET_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError();
    }

    // Get user's store
    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new ForbiddenError('No store found');
    }

    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product || product.storeId !== store.id) {
      throw new NotFoundError('Product');
    }

    await productRepository.delete(id);

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
