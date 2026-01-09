import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Debug endpoint to check auth state - REMOVE IN PRODUCTION
export async function GET(request: NextRequest) {
  try {
    // Ensure DB is seeded
    await db.seed();

    // Get current session
    const session = await getSession();

    // Find admin user
    const adminUser = db.users.findOne((u) => u.email === 'admin@covet.com');

    // Test password verification
    let passwordMatch = false;
    if (adminUser) {
      passwordMatch = await bcrypt.compare('Admin123!', adminUser.passwordHash);
    }

    // Get all users (just email and role for debugging)
    const allUsers = db.users.findMany().map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
    }));

    return NextResponse.json({
      success: true,
      debug: {
        sessionExists: !!session,
        session: session ? {
          userId: session.userId,
          email: session.email,
          role: session.role,
        } : null,
        adminUserExists: !!adminUser,
        adminUserDetails: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        } : null,
        passwordMatch,
        totalUsers: allUsers.length,
        allUsers,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
