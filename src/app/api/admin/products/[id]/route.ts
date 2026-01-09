import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { productRepository, storeRepository } from '@/lib/repositories';
import { updateProductSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { UserRole } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session) && session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError();
    }

    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // For store admins, verify they own this product
    if (!isAdmin(session)) {
      const store = await storeRepository.findByOwnerId(session.userId);
      if (!store || product.storeId !== store.id) {
        throw new ForbiddenError();
      }
    }

    return createSuccessResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session) && session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError();
    }

    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // For store admins, verify they own this product
    if (!isAdmin(session)) {
      const store = await storeRepository.findByOwnerId(session.userId);
      if (!store || product.storeId !== store.id) {
        throw new ForbiddenError();
      }
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
    if (!updated) {
      throw new NotFoundError('Product');
    }

    return createSuccessResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session) && session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError();
    }

    const { id } = await params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // For store admins, verify they own this product
    if (!isAdmin(session)) {
      const store = await storeRepository.findByOwnerId(session.userId);
      if (!store || product.storeId !== store.id) {
        throw new ForbiddenError();
      }
    }

    await productRepository.delete(id);
    return createSuccessResponse({ message: 'Product deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
