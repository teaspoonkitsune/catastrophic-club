import { NextResponse } from 'next/server';
import {
  clearAuthSessionFromResponse,
  getAuthSession,
  getKeycloakConfig,
  getLogoutEndpoint,
} from '@/shared/auth';

function sanitizeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/';
  }

  if (value.startsWith('//')) {
    return '/';
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const session = await getAuthSession();
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get('returnTo'));

  if (!session) {
    const response = NextResponse.redirect(new URL(returnTo, requestUrl.origin));
    clearAuthSessionFromResponse(response);
    return response;
  }

  const config = getKeycloakConfig();
  const logoutUrl = new URL(getLogoutEndpoint());
  logoutUrl.searchParams.set('client_id', config.clientId);
  logoutUrl.searchParams.set(
    'post_logout_redirect_uri',
    new URL(returnTo, requestUrl.origin).toString(),
  );

  if (session.idToken) {
    logoutUrl.searchParams.set('id_token_hint', session.idToken);
  }

  const response = NextResponse.redirect(logoutUrl);
  clearAuthSessionFromResponse(response);
  return response;
}
