import { clearSessionCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/errors';

export async function POST() {
  try {
    await clearSessionCookie();
    return createSuccessResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
