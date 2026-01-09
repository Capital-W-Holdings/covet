import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { supportRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { TicketStatus, TicketPriority } from '@/types/support';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assignedTo: z.string().optional(),
});

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

    if (!isAdmin(session)) {
      throw new ForbiddenError();
    }

    const ticket = await supportRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    return createSuccessResponse(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session)) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const parsed = updateTicketSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const ticket = await supportRepository.update(id, parsed.data);
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    return createSuccessResponse(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
