import { NextResponse } from 'next/server';
import {
  getAuthRateLimitMaxAttempts,
  getAuthRateLimitWindowSeconds,
  writeAuthSessionToResponse,
} from '@/shared/auth';
import { KeycloakAuthError, loginWithKeycloakPassword } from '@/shared/auth/keycloak';
import { getRequestI18n } from '@/shared/i18n/server';
import { createLogger } from '@/shared/lib/logger';
import { consumeRateLimit } from '@/shared/lib/rate-limit';

const logger = createLogger('api.auth.login');

function getRequestClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: Request) {
  const { messages } = await getRequestI18n();
  const rateLimit = consumeRateLimit({
    key: `auth:login:${getRequestClientIp(request)}`,
    limit: getAuthRateLimitMaxAttempts(),
    windowMs: getAuthRateLimitWindowSeconds() * 1000,
  });

  if (!rateLimit.success) {
    logger.warn('auth.login_rate_limited', {
      clientIp: getRequestClientIp(request),
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return NextResponse.json(
      { error: messages.auth.errors.rateLimited },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const body = (await request.json().catch(() => null)) as Partial<{
    username: string;
    password: string;
  }> | null;
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json({ error: messages.auth.errors.missingUsernamePassword }, { status: 400 });
  }

  try {
    const { session, user } = await loginWithKeycloakPassword(username, password);
    logger.info('auth.login_succeeded', { subject: user.subject });
    const response = NextResponse.json({ ok: true, user });
    writeAuthSessionToResponse(response, session);
    return response;
  } catch (error) {
    if (error instanceof KeycloakAuthError) {
      logger.warn('auth.login_failed', { status: error.status });
      const localizedError =
        error.status === 401
          ? messages.auth.errors.invalidCredentials
          : error.status === 409
            ? messages.auth.errors.accountSetupIncomplete
          : error.status === 502
            ? messages.auth.errors.loadAccountFailed
            : messages.auth.errors.genericLoginFailed;

      return NextResponse.json({ error: localizedError }, { status: error.status });
    }

    logger.error('auth.login_unexpected_error', error);
    return NextResponse.json({ error: messages.auth.errors.genericLoginFailed }, { status: 500 });
  }
}
