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

  const registrationUrl = new URL(getAuthorizationEndpoint());
  registrationUrl.searchParams.set('client_id', config.clientId);
  registrationUrl.searchParams.set('redirect_uri', getAuthCallbackUrl(url.origin));
  registrationUrl.searchParams.set('response_type', 'code');
  registrationUrl.searchParams.set('scope', config.scope);
  registrationUrl.searchParams.set('state', state);
  registrationUrl.searchParams.set('code_challenge', createCodeChallenge(codeVerifier));
  registrationUrl.searchParams.set('code_challenge_method', 'S256');
  registrationUrl.searchParams.set('prompt', 'create');

  const response = NextResponse.redirect(registrationUrl);

  writeOauthStateToResponse(response, {
    state,
    codeVerifier,
    returnTo: sanitizeReturnTo(url.searchParams.get('returnTo')),
  });

  return response;
}
