import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { storeApplicationRepository, userRepository } from '@/lib/repositories';
import { reviewApplicationSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { StoreApplicationStatus } from '@/types/store';
import { UserRole } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/applications/[id] - Get single application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session)) {
      throw new ForbiddenError();
    }

    const { id } = await params;
    const application = await storeApplicationRepository.findById(id);

    if (!application) {
      throw new NotFoundError('Application');
    }

    return createSuccessResponse(application);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/admin/applications/[id] - Review application
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session)) {
      throw new ForbiddenError();
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parsed = reviewApplicationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const application = await storeApplicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError('Application');
    }

    const { status, reviewNotes } = parsed.data;

    // Handle different statuses
    if (status === 'APPROVED') {
      // Approve and create store
      const result = await storeApplicationRepository.approve(id, session.userId, reviewNotes);
      
      if (!result.success) {
        throw new ValidationError(result.error.message);
      }

      // Update user role to STORE_ADMIN
      await userRepository.update(application.userId, { role: UserRole.STORE_ADMIN });

      return createSuccessResponse({
        application: await storeApplicationRepository.findById(id),
        store: result.data,
      });
    } else if (status === 'REJECTED') {
      const updated = await storeApplicationRepository.reject(id, session.userId, reviewNotes || 'Application rejected');
      return createSuccessResponse(updated);
    } else if (status === 'NEEDS_INFO') {
      const updated = await storeApplicationRepository.requestMoreInfo(id, session.userId, reviewNotes || 'Additional information required');
      return createSuccessResponse(updated);
    } else {
      // Under review or other status update
      const updated = await storeApplicationRepository.updateStatus(
        id,
        status as StoreApplicationStatus,
        session.userId,
        reviewNotes
      );
      return createSuccessResponse(updated);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
