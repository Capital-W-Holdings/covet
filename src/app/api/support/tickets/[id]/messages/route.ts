import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { supportRepository, userRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, NotFoundError, ForbiddenError, ValidationError } from '@/lib/errors';
import { TicketStatus } from '@/types/support';
import { z } from 'zod';

const replySchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000),
  attachments: z.array(z.string()).optional(),
});

export async function POST(
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

    // Users can only reply to their own tickets
    if (!isAdmin(session) && ticket.userId !== session.userId) {
      throw new ForbiddenError();
    }

    // Can't reply to closed tickets
    if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
      throw new ValidationError('Cannot reply to a closed ticket');
    }

    const body = await request.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await userRepository.findById(session.userId);
    const senderName = user?.profile.name || session.email;
    const senderRole = isAdmin(session) ? 'ADMIN' : 'USER';

    const updatedTicket = await supportRepository.addMessage(
      id,
      parsed.data,
      session.userId,
      senderName,
      senderRole
    );

    if (!updatedTicket) {
      throw new NotFoundError('Ticket');
    }

    return createSuccessResponse(updatedTicket);
  } catch (error) {
    return handleApiError(error);
  }
}
