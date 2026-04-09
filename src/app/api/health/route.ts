import { NextResponse } from 'next/server';
import { sql } from 'kysely';
import {
  getAuthRateLimitMaxAttempts,
  getAuthRateLimitWindowSeconds,
  validateAuthEnvironment,
} from '@/shared/auth';
import { db } from '@/shared/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    env: false,
    database: false,
  };

  try {
    validateAuthEnvironment();
    getAuthRateLimitMaxAttempts();
    getAuthRateLimitWindowSeconds();
    checks.env = true;
  } catch (error) {
    console.error('Health check env validation failed', error);
  }

  try {
    await sql<{ ok: number }>`select 1 as ok`.execute(db);
    checks.database = true;
  } catch (error) {
    console.error('Health check database validation failed', error);
  }

  const ok = checks.env && checks.database;

  return NextResponse.json(
    {
      ok,
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
