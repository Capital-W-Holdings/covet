import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImage, isImageDemo } from '@/lib/upload/service';
import { UnauthorizedError, ValidationError, handleApiError, createSuccessResponse } from '@/lib/errors';
import { checkRateLimit, createRateLimitHeaders } from '@/lib/rateLimit';
import { UserRole } from '@/types';

// Configure for larger uploads
export const runtime = 'nodejs';

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    // Only store admins can upload product images
    const allowedRoles = [UserRole.STORE_ADMIN, UserRole.COVET_ADMIN, UserRole.SUPER_ADMIN];
    if (!allowedRoles.includes(session.role)) {
      throw new UnauthorizedError('Only store admins can upload images');
    }

    // Rate limit - 20 uploads per minute
    const rateLimitResult = checkRateLimit(`upload:${session.userId}`, {
      windowMs: 60 * 1000,
      limit: 20,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'RateLimitError',
            message: 'Too many uploads. Please wait a moment.',
            code: 'RATE_LIMITED',
          },
        },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload
    const result = await uploadImage(buffer, file.name, {
      folder,
      maxSizeBytes: MAX_FILE_SIZE,
    });

    if (!result.success) {
      throw new ValidationError(result.error || 'Upload failed');
    }

    const response = createSuccessResponse({
      url: result.url,
      publicId: result.publicId,
      isDemo: isImageDemo(),
    });

    // Add rate limit headers
    Object.entries(createRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Get upload configuration
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxFileSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
      isDemo: isImageDemo(),
      provider: process.env.IMAGE_PROVIDER || 'demo',
    },
  });
}
