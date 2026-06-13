import { NextResponse } from 'next/server';
import { sql } from 'kysely';
import {
  getAuthRateLimitMaxAttempts,
  getAuthRateLimitWindowSeconds,
  validateAuthEnvironment,
} from '@/shared/auth';
import { db } from '@/shared/api';
import { createLogger } from '@/shared/lib/logger';

export const dynamic = 'force-dynamic';
const logger = createLogger('api.health');

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
    logger.error('health.env_check_failed', error);
  }

  try {
    await sql<{ ok: number }>`select 1 as ok`.execute(db);
    checks.database = true;
  } catch (error) {
    logger.error('health.database_check_failed', error);
  }

  const ok = checks.env && checks.database;

  if (!ok) {
    logger.warn('health.unhealthy', { checks });
  }

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
