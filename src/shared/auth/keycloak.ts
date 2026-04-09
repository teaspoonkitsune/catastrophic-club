import 'server-only';

import {
  getAppSessionTtlSeconds,
  getKeycloakAdminConfig,
  getKeycloakAdminTokenEndpoint,
  getKeycloakAdminUserEndpoint,
  getKeycloakAdminUsersEndpoint,
  getKeycloakConfig,
  getTokenEndpoint,
  getUserInfoEndpoint,
} from './config';
import type { AuthSession } from './session';
import { syncAuthenticatedUser } from './users';

type KeycloakTokenResponse = {
  access_token: string;
  id_token?: string;
};

type KeycloakUserInfoResponse = {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
};

type RegisterKeycloakUserInput = {
  username: string;
  email: string;
  password: string;
};

type LoginResult = {
  session: AuthSession;
  user: AuthSession['user'];
};

export class KeycloakAuthError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'KeycloakAuthError';
    this.status = status;
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as Partial<{
      error: string;
      error_description: string;
      errorMessage: string;
      message: string;
    }>;

    return payload.error_description ?? payload.errorMessage ?? payload.message ?? payload.error ?? fallback;
  } catch {
    return fallback;
  }
}

async function fetchUserInfo(accessToken: string) {
  const response = await fetch(getUserInfoEndpoint(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new KeycloakAuthError('Failed to load account data', 502);
  }

  return (await response.json()) as KeycloakUserInfoResponse;
}

export async function loginWithKeycloakPassword(
  username: string,
  password: string,
  fallbackName: string | null = null,
): Promise<LoginResult> {
  const config = getKeycloakConfig();
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: config.clientId,
    username,
    password,
    scope: config.scope,
  });

  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret);
  }

  const response = await fetch(getTokenEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, 'Invalid username or password');
    const status =
      message.toLowerCase().includes('account is not fully set up')
        ? 409
        : response.status === 401
          ? 401
          : 400;

    throw new KeycloakAuthError(message, status);
  }

  const tokenPayload = (await response.json()) as KeycloakTokenResponse;
  const userInfo = await fetchUserInfo(tokenPayload.access_token);
  const name = userInfo.preferred_username ?? userInfo.name ?? fallbackName ?? null;
  const email = userInfo.email ?? `${userInfo.sub}@keycloak.local`;
  const user = {
    subject: userInfo.sub,
    email,
    name,
  };

  await syncAuthenticatedUser({
    id: user.subject,
    email: user.email,
    name: user.name,
  });

  return {
    user,
    session: {
      user,
      idToken: tokenPayload.id_token ?? null,
      expiresAt: new Date(Date.now() + getAppSessionTtlSeconds() * 1000).toISOString(),
    },
  };
}

async function getKeycloakAdminAccessToken() {
  const config = getKeycloakAdminConfig();
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: config.adminClientId,
    username: config.adminUsername,
    password: config.adminPassword,
  });

  const response = await fetch(getKeycloakAdminTokenEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, 'Failed to authorize admin registration flow');
    throw new KeycloakAuthError(message, 500);
  }

  const payload = (await response.json()) as Partial<KeycloakTokenResponse>;

  if (!payload.access_token) {
    throw new KeycloakAuthError('Failed to get admin access token', 500);
  }

  return payload.access_token;
}

export async function registerKeycloakUser(input: RegisterKeycloakUserInput): Promise<void> {
  const adminAccessToken = await getKeycloakAdminAccessToken();
  const normalizedUsername = input.username.trim();
  const normalizedEmail = input.email.trim().toLowerCase();

  const response = await fetch(getKeycloakAdminUsersEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAccessToken}`,
    },
    body: JSON.stringify({
      username: normalizedUsername,
      email: normalizedEmail,
      enabled: true,
      emailVerified: true,
      requiredActions: [],
      credentials: [
        {
          type: 'password',
          value: input.password,
          temporary: false,
        },
      ],
    }),
    cache: 'no-store',
  });

  if (response.ok) {
    const locationHeader = response.headers.get('location');
    const createdUserId = locationHeader?.split('/').at(-1);

    if (createdUserId) {
      const finalizeResponse = await fetch(getKeycloakAdminUserEndpoint(createdUserId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({
          username: normalizedUsername,
          email: normalizedEmail,
          enabled: true,
          emailVerified: true,
          requiredActions: [],
          credentials: [
            {
              type: 'password',
              value: input.password,
              temporary: false,
            },
          ],
        }),
        cache: 'no-store',
      });

      if (!finalizeResponse.ok) {
        const message = await readErrorMessage(finalizeResponse, 'Failed to finalize account setup');
        throw new KeycloakAuthError(message, 500);
      }
    }

    return;
  }

  if (response.status === 409) {
    throw new KeycloakAuthError('Account already exists', 409);
  }

  const message = await readErrorMessage(response, 'Failed to create account');
  throw new KeycloakAuthError(message, response.status >= 400 && response.status < 500 ? 400 : 500);
}
