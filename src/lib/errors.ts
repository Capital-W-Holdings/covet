import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class AppError extends Error {
  constructor(
    public readonly type: string,
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('ValidationError', message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NotFoundError', `${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UnauthorizedError', message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('ForbiddenError', message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('ConflictError', message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

// =============================================================================
// ERROR RESPONSE HELPERS
// =============================================================================

export interface ApiErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
}

export function createErrorResponse(error: AppError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        code: error.code,
        details: error.details,
      },
    },
    { status: error.statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return createErrorResponse(error);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.reduce(
      (acc, err) => ({
        ...acc,
        [err.path.join('.')]: err.message,
      }),
      {}
    );
    return createErrorResponse(
      new ValidationError('Invalid request data', details)
    );
  }

  // Handle unknown errors
  return createErrorResponse(
    new AppError(
      'InternalError',
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500
    )
  );
}

// =============================================================================
// SUCCESS RESPONSE HELPER
// =============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export function createSuccessResponse<T>(
  data: T,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}
