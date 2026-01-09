import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { userRepository } from '@/lib/repositories';
import { createToken, setSessionCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError, ValidationError } from '@/lib/errors';
import { checkRateLimit, getClientIp, createRateLimitHeaders, RateLimitPresets } from '@/lib/rateLimit';
import { sendWelcomeEmail } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  try {
    // Rate limit check - more restrictive for registration
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(`register:${clientIp}`, RateLimitPresets.register);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'RateLimitError',
            message: 'Too many registration attempts. Please try again later.',
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
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Create user
    const result = await userRepository.create(parsed.data);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    // Create session
    const token = await createToken(result.data);
    await setSessionCookie(token);

    // Send welcome email (async, don't block registration)
    sendWelcomeEmail(result.data.email, result.data.profile.name)
      .then((emailResult: { success: boolean; error?: string }) => {
        if (emailResult.success) {
          console.log(`Welcome email sent to: ${result.data.email}`);
        } else {
          console.error(`Failed to send welcome email: ${emailResult.error}`);
        }
      })
      .catch((error: unknown) => {
        console.error('Welcome email error:', error);
      });

    // Return user (without password hash)
    const { passwordHash: _, ...user } = result.data;
    
    const response = createSuccessResponse(user, 201);
    // Add rate limit headers
    Object.entries(createRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
