import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { supportRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const ticket = await supportRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    // Users can only view their own tickets (admins can view all)
    if (!isAdmin(session) && ticket.userId !== session.userId) {
      throw new ForbiddenError();
    }

    return createSuccessResponse(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
