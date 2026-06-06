import { NextResponse } from 'next/server';
import {
  clearAuthSessionFromResponse,
} from '@/shared/auth';
import { sanitizeReturnTo } from '@/shared/auth/links';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get('returnTo'));

  const response = NextResponse.redirect(new URL(returnTo, requestUrl.origin));
  clearAuthSessionFromResponse(response);
  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthSessionFromResponse(response);
  return response;
}
