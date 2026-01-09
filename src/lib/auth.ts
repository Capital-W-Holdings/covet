import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { Session, User } from '@/types';
import { UserRole } from '@/types';
import { db } from '@/lib/db';

// Validate JWT_SECRET at module load - fail fast in production
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && (!secret || secret.length < 32)) {
    throw new Error(
      'FATAL: JWT_SECRET must be set and at least 32 characters in production'
    );
  }
  
  // Allow fallback ONLY in development/test
  const finalSecret = secret || 'covet-development-jwt-secret-32-chars';
  return new TextEncoder().encode(finalSecret);
}

const JWT_SECRET = getJwtSecret();

const COOKIE_NAME = 'covet-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a JWT token for a user
 */
export async function createToken(user: User): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  // Look up store for store admins
  let storeId: string | undefined;
  if (user.role === UserRole.STORE_ADMIN || user.role === UserRole.COVET_ADMIN) {
    await db.seed();
    const store = db.stores.findOne((s) => s.ownerId === user.id);
    storeId = store?.id;
  }

  return new SignJWT({
    userId: user.id,
    email: user.email,
    userName: user.profile.name,
    role: user.role,
    storeId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      userName: payload.userName as string | undefined,
      role: payload.role as UserRole,
      storeId: payload.storeId as string | undefined,
      expiresAt: new Date((payload.exp || 0) * 1000),
    };
  } catch {
    return null;
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION / 1000,
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Check if user has required role
 */
export function hasRole(session: Session | null, roles: UserRole[]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}

/**
 * Check if user is admin (COVET_ADMIN or SUPER_ADMIN)
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, [UserRole.COVET_ADMIN, UserRole.SUPER_ADMIN]);
}

/**
 * Check if user can manage store
 */
export function canManageStore(session: Session | null, storeId?: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  if (session.role === UserRole.STORE_ADMIN && session.storeId === storeId) return true;
  return false;
}

/**
 * Verify session from a request (reads from Authorization header or cookies)
 */
export async function verifySession(request: Request): Promise<Session | null> {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // Try cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies[COOKIE_NAME];
    if (token) {
      return verifyToken(token);
    }
  }

  return null;
}
