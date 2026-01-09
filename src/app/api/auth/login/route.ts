import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { userRepository } from '@/lib/repositories';
import { createToken, setSessionCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, AppError } from '@/lib/errors';
import { checkRateLimit, getClientIp, createRateLimitHeaders, RateLimitPresets } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    console.log('[Login] Step 1: Rate limit check');
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

    console.log('[Login] Step 2: Parse request body');
    const body = await request.json();

    console.log('[Login] Step 3: Validate input');
    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    console.log('[Login] Step 4: Find user');
    // Find user
    const user = await userRepository.findByEmail(parsed.data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    console.log('[Login] Step 5: Verify password');
    // Verify password
    const isValid = await userRepository.verifyPassword(user, parsed.data.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    console.log('[Login] Step 6: Update last login');
    // Update last login
    await userRepository.updateLastLogin(user.id);

    console.log('[Login] Step 7: Create token');
    // Create session token
    let token: string;
    try {
      token = await createToken(user);
      console.log('[Login] Step 7a: Token created successfully');
    } catch (tokenError) {
      console.error('Token creation failed:', tokenError);
      return NextResponse.json({
        success: false,
        error: { type: 'InternalError', message: 'Token creation failed', details: String(tokenError) }
      }, { status: 500 });
    }

    console.log('[Login] Step 8: Set cookie');
    // Set cookie
    try {
      await setSessionCookie(token);
      console.log('[Login] Step 8a: Cookie set successfully');
    } catch (cookieError) {
      console.error('Cookie setting failed:', cookieError);
      return NextResponse.json({
        success: false,
        error: { type: 'InternalError', message: 'Cookie setting failed', details: String(cookieError) }
      }, { status: 500 });
    }

    console.log('[Login] Step 9: Build response');
    // Return user (without password hash)
    const { passwordHash: _, ...userData } = user;

    const response = createSuccessResponse(userData);
    // Add rate limit headers to successful response too
    Object.entries(createRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Login error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return handleApiError(error);
  }
}
