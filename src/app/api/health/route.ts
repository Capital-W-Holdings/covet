import { NextResponse } from 'next/server';
import { database, isDatabasePrisma } from '@/lib/database';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: isDatabasePrisma ? 'postgresql' : 'in-memory',
      connected: false,
      warning: isDatabasePrisma ? null : 'Using in-memory database - data will be lost on restart',
    },
  };

  try {
    health.database.connected = await database.isConnected();
  } catch (error) {
    health.database.connected = false;
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}
