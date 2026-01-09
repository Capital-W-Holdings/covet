import { NextRequest } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { disputeRepository, storeRepository } from '@/lib/repositories';
import { disputeResponseSchema, resolveDisputeSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { DisputeResolution } from '@/types/review';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/disputes/[id] - Get dispute detail
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const dispute = await disputeRepository.findById(id);

    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    // Verify access
    const canAccess =
      isAdmin(session) ||
      dispute.buyerId === session.userId ||
      dispute.sellerId === session.userId;

    if (!canAccess) {
      throw new ForbiddenError();
    }

    return createSuccessResponse(dispute);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/disputes/[id] - Add message to dispute
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const dispute = await disputeRepository.findById(id);

    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    // Verify access
    const isBuyer = dispute.buyerId === session.userId;
    const isSeller = dispute.sellerId === session.userId;
    const isAdminUser = isAdmin(session);

    if (!isBuyer && !isSeller && !isAdminUser) {
      throw new ForbiddenError();
    }

    const body = await request.json();

    // Validate input
    const parsed = disputeResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Determine role
    let senderRole: 'BUYER' | 'SELLER' | 'ADMIN' = 'BUYER';
    if (isAdminUser) senderRole = 'ADMIN';
    else if (isSeller) senderRole = 'SELLER';

    // Add message
    const updated = await disputeRepository.addMessage(
      id,
      session.userId,
      session.userName || session.email,
      senderRole,
      parsed.data.message,
      parsed.data.attachments
    );

    return createSuccessResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/disputes/[id] - Resolve dispute (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (!isAdmin(session)) {
      throw new ForbiddenError('Only admins can resolve disputes');
    }

    const { id } = await params;
    const dispute = await disputeRepository.findById(id);

    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    const body = await request.json();

    // Validate input
    const parsed = resolveDisputeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Resolve dispute
    const resolved = await disputeRepository.resolve(
      id,
      parsed.data.resolution as DisputeResolution,
      session.userId,
      parsed.data.resolutionNotes
    );

    return createSuccessResponse(resolved);
  } catch (error) {
    return handleApiError(error);
  }
}
