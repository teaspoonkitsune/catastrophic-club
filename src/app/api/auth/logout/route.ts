import { NextResponse } from 'next/server';
import {
  clearAuthSessionFromResponse,
} from '@/shared/auth';
import { sanitizeReturnTo } from '@/shared/auth/links';
import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('api.auth.logout');

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get('returnTo'));

  logger.info('auth.logout_redirect', { returnTo });
  const response = NextResponse.redirect(new URL(returnTo, requestUrl.origin));
  clearAuthSessionFromResponse(response);
  return response;
}

export async function POST() {
  logger.info('auth.logout_succeeded');
  const response = NextResponse.json({ ok: true });
  clearAuthSessionFromResponse(response);
  return response;
}
