import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { userRepository } from '@/lib/repositories';
import { createToken, setSessionCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError } from '@/lib/errors';
import { checkRateLimit, getClientIp, createRateLimitHeaders, RateLimitPresets } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(`login:${clientIp}`, RateLimitPresets.login);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'RateLimitError',
            message: 'Too many login attempts. Please try again later.',
            code: 'RATE_LIMITED',
            details: {
              retryAfterSeconds: Math.ceil(rateLimitResult.retryAfterMs / 1000),
            },
          },
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Find user
    const user = await userRepository.findByEmail(parsed.data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await userRepository.verifyPassword(user, parsed.data.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Create session token
    const token = await createToken(user);

    // Set cookie
    await setSessionCookie(token);

    // Return user (without password hash)
    const { passwordHash: _, ...userData } = user;

    const response = createSuccessResponse(userData);
    // Add rate limit headers to successful response too
    Object.entries(createRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return handleApiError(error);
  }
}
