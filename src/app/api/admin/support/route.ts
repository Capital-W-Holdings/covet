import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { supportRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { TicketStatus, TicketPriority } from '@/types/support';

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
    const status = searchParams.get('status') as TicketStatus | null;
    const priority = searchParams.get('priority') as TicketPriority | null;

    const filters: {
      status?: TicketStatus;
      priority?: TicketPriority;
    } = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    const [tickets, stats] = await Promise.all([
      supportRepository.findAll(filters),
      supportRepository.getStats(),
    ]);

    return createSuccessResponse({ tickets, stats });
  } catch (error) {
    return handleApiError(error);
  }
}
