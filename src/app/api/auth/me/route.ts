import { getSession } from '@/lib/auth';
import { userRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, UnauthorizedError } from '@/lib/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Return user (without password hash)
    const { passwordHash: _, ...userData } = user;
    return createSuccessResponse(userData);
  } catch (error) {
    return handleApiError(error);
  }
}
