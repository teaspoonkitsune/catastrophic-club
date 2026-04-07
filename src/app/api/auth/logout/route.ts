import { NextResponse } from 'next/server';
import {
  clearAuthSessionFromResponse,
  clearOauthStateFromResponse,
} from '@/shared/auth';

function sanitizeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/';
  }

  // Avoid protocol-relative redirects such as //evil.example.
  if (value.startsWith('//')) {
    return '/';
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get('returnTo'));

  const response = NextResponse.redirect(new URL(returnTo, requestUrl.origin));
  clearAuthSessionFromResponse(response);
  clearOauthStateFromResponse(response);
  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthSessionFromResponse(response);
  clearOauthStateFromResponse(response);
  return response;
}
