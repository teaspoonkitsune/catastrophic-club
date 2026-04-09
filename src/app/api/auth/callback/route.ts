import { NextResponse } from 'next/server';
import {
  clearOauthStateFromResponse,
  getAppSessionTtlSeconds,
  getAuthCallbackUrl,
  getKeycloakConfig,
  getOauthState,
  getTokenEndpoint,
  getUserInfoEndpoint,
  writeAuthSessionToResponse,
} from '@/shared/auth';
import { syncAuthenticatedUser } from '@/shared/auth/users';

type TokenResponse = {
  access_token: string;
  id_token?: string;
};

type UserInfoResponse = {
  sub: string;
  email: string;
  name?: string;
  preferred_username?: string;
};

function buildRedirect(origin: string, pathname: string, error?: string) {
  const redirectUrl = new URL(pathname, origin);

  if (error) {
    redirectUrl.searchParams.set('authError', error);
  }

  return redirectUrl;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const storedState = await getOauthState();

  if (!storedState) {
    return NextResponse.redirect(buildRedirect(requestUrl.origin, '/favorites', 'oauth_state_missing'));
  }

  if (error) {
    const response = NextResponse.redirect(buildRedirect(requestUrl.origin, storedState.returnTo, error));
    clearOauthStateFromResponse(response);
    return response;
  }

  if (!code || !state || storedState.state !== state) {
    const response = NextResponse.redirect(buildRedirect(requestUrl.origin, '/favorites', 'oauth_state_invalid'));
    clearOauthStateFromResponse(response);
    return response;
  }

  try {
    const config = getKeycloakConfig();
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code,
      redirect_uri: getAuthCallbackUrl(requestUrl.origin),
      code_verifier: storedState.codeVerifier,
    });

    if (config.clientSecret) {
      body.set('client_secret', config.clientSecret);
    }

    const tokenResponse = await fetch(getTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokenPayload = (await tokenResponse.json()) as TokenResponse;
    const userInfoResponse = await fetch(getUserInfoEndpoint(), {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
      cache: 'no-store',
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to load user info');
    }

    const userInfo = (await userInfoResponse.json()) as UserInfoResponse;
    const name = userInfo.preferred_username ?? userInfo.name ?? null;
    const email = userInfo.email ?? `${userInfo.sub}@keycloak.local`;

    await syncAuthenticatedUser({
      id: userInfo.sub,
      email,
      name,
    });

    const response = NextResponse.redirect(new URL(storedState.returnTo, requestUrl.origin));
    const sessionTtlSeconds = getAppSessionTtlSeconds();

    writeAuthSessionToResponse(response, {
      user: {
        subject: userInfo.sub,
        email,
        name,
      },
      idToken: tokenPayload.id_token ?? null,
      expiresAt: new Date(Date.now() + sessionTtlSeconds * 1000).toISOString(),
    });
    clearOauthStateFromResponse(response);

    return response;
  } catch (callbackError) {
    console.error('Failed to finish Keycloak callback', callbackError);
    const response = NextResponse.redirect(buildRedirect(requestUrl.origin, '/favorites', 'oauth_callback_failed'));
    clearOauthStateFromResponse(response);
    return response;
  }
}
