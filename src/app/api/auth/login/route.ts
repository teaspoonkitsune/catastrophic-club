import { NextResponse } from 'next/server';
import {
  createCodeChallenge,
  createRandomString,
  getAuthCallbackUrl,
  getAuthorizationEndpoint,
  getKeycloakConfig,
  writeOauthStateToResponse,
} from '@/shared/auth';

function sanitizeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/favorites';
  }

  if (value.startsWith('//')) {
    return '/favorites';
  }

  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = getKeycloakConfig();
  const state = createRandomString();
  const codeVerifier = createRandomString(48);

  const authorizationUrl = new URL(getAuthorizationEndpoint());
  authorizationUrl.searchParams.set('client_id', config.clientId);
  authorizationUrl.searchParams.set('redirect_uri', getAuthCallbackUrl(url.origin));
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', config.scope);
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('code_challenge', createCodeChallenge(codeVerifier));
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');

  const response = NextResponse.redirect(authorizationUrl);

  writeOauthStateToResponse(response, {
    state,
    codeVerifier,
    returnTo: sanitizeReturnTo(url.searchParams.get('returnTo')),
  });

  return response;
}
