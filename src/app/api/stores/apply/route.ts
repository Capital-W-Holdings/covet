import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeApplicationRepository } from '@/lib/repositories';
import { storeApplicationSchema } from '@/lib/validations';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, ConflictError } from '@/lib/errors';

// GET /api/stores/apply - Get current user's application
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const application = await storeApplicationRepository.findByUserId(session.userId);
    return createSuccessResponse(application || null);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/stores/apply - Submit new application
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();

    // Validate input
    const parsed = storeApplicationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Check for existing application
    const existing = await storeApplicationRepository.findByUserId(session.userId);
    if (existing) {
      throw new ConflictError('You already have a pending application');
    }

    // Create application
    const result = await storeApplicationRepository.create(session.userId, parsed.data);

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return createSuccessResponse(result.data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
