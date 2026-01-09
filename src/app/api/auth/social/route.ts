import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userRepository } from '@/lib/repositories';
import { UserRole, UserStatus } from '@/types';

// =============================================================================
// Types
// =============================================================================

interface SocialAuthRequest {
  provider: 'google' | 'apple';
  mockToken: string;
  // In production, these would come from the OAuth provider
  email?: string;
  name?: string;
  providerId?: string;
}

// =============================================================================
// Mock OAuth token verification
// In production, verify with Google/Apple APIs
// =============================================================================

async function verifyGoogleToken(token: string): Promise<{
  email: string;
  name: string;
  providerId: string;
} | null> {
  // Mock: Extract mock data from token
  // In production, call Google's tokeninfo endpoint or use googleapis
  if (!token.startsWith('mock_google_')) {
    return null;
  }

  // Generate consistent mock user based on token
  const hash = token.split('_').pop() || '';
  const mockNumber = parseInt(hash.slice(-3)) || 1;

  return {
    email: `google.user.${mockNumber}@gmail.com`,
    name: `Google User ${mockNumber}`,
    providerId: `google_${hash}`,
  };
}

async function verifyAppleToken(token: string): Promise<{
  email: string;
  name: string;
  providerId: string;
} | null> {
  // Mock: Extract mock data from token
  // In production, verify Apple's identityToken using apple-signin-auth
  if (!token.startsWith('mock_apple_')) {
    return null;
  }

  const hash = token.split('_').pop() || '';
  const mockNumber = parseInt(hash.slice(-3)) || 1;

  return {
    email: `apple.user.${mockNumber}@privaterelay.appleid.com`,
    name: `Apple User ${mockNumber}`,
    providerId: `apple_${hash}`,
  };
}

// =============================================================================
// POST Handler
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SocialAuthRequest;
    const { provider, mockToken } = body;

    // Validate provider
    if (!provider || !['google', 'apple'].includes(provider)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Invalid authentication provider',
            code: 'INVALID_PROVIDER',
          },
        },
        { status: 400 }
      );
    }

    // Verify token with provider
    let providerData: { email: string; name: string; providerId: string } | null = null;

    if (provider === 'google') {
      providerData = await verifyGoogleToken(mockToken);
    } else if (provider === 'apple') {
      providerData = await verifyAppleToken(mockToken);
    }

    if (!providerData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'AUTH_ERROR',
            message: 'Failed to verify authentication token',
            code: 'TOKEN_VERIFICATION_FAILED',
          },
        },
        { status: 401 }
      );
    }

    const { email, name, providerId } = providerData;

    // Check if user exists
    let user = await userRepository.findByEmail(email);

    if (user) {
      // Existing user - update last login
      await userRepository.update(user.id, {
        lastLogin: new Date(),
      });
    } else {
      // New user - create account
      const createResult = await userRepository.create({
        email,
        password: `social_${provider}_${providerId}`, // Placeholder - social users don't need password
        name,
      });

      if (!createResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              type: 'SERVER_ERROR',
              message: createResult.error?.message || 'Failed to create user account',
              code: 'USER_CREATION_FAILED',
            },
          },
          { status: 500 }
        );
      }

      user = createResult.data;
    }

    // Check if user is suspended
    if (user.status === UserStatus.SUSPENDED) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'AUTH_ERROR',
            message: 'Your account has been suspended. Please contact support.',
            code: 'ACCOUNT_SUSPENDED',
          },
        },
        { status: 403 }
      );
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      userName: user.profile.name,
      role: user.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.profile.name,
          role: user.role,
        },
        isNewUser: !user.lastLogin,
        provider,
      },
    });
  } catch (error) {
    console.error('Social auth error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: 'Authentication failed. Please try again.',
          code: 'SOCIAL_AUTH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
