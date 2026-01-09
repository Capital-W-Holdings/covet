import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { disputeRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { DisputeStatus } from '@/types/review';

// GET /api/admin/disputes - List all disputes
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
    const status = searchParams.get('status') as DisputeStatus | null;

    const disputes = await disputeRepository.findAll(status || undefined);
    const openCount = await disputeRepository.getOpenCount();

    return createSuccessResponse({
      disputes,
      openCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
