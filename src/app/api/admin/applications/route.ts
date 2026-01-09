import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { storeApplicationRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { StoreApplicationStatus } from '@/types/store';

// GET /api/admin/applications - List all applications
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session)) {
      throw new ForbiddenError();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as StoreApplicationStatus | null;

    const applications = await storeApplicationRepository.findAll(status || undefined);

    return createSuccessResponse(applications);
  } catch (error) {
    return handleApiError(error);
  }
}
