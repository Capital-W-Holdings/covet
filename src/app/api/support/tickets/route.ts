import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { supportRepository, userRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError, ValidationError } from '@/lib/errors';
import { TicketCategory } from '@/types/support';
import { z } from 'zod';

const createTicketSchema = z.object({
  category: z.nativeEnum(TicketCategory),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(10, 'Please provide more details').max(5000),
  orderId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const tickets = await supportRepository.findByUserId(session.userId);
    return createSuccessResponse(tickets);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();

    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    const ticket = await supportRepository.create(
      parsed.data,
      session.userId,
      user.email,
      user.profile.name
    );

    return createSuccessResponse(ticket, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
