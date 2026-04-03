const DEFAULT_SCOPE = 'openid profile email';

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export function getAuthSecret() {
  return getEnv('AUTH_SECRET');
}

export function getKeycloakConfig() {
  return {
    baseUrl: trimTrailingSlash(getEnv('KEYCLOAK_BASE_URL')),
    realm: getEnv('KEYCLOAK_REALM'),
    clientId: getEnv('KEYCLOAK_CLIENT_ID'),
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    scope: process.env.KEYCLOAK_SCOPE ?? DEFAULT_SCOPE,
  };
}

function getRealmBaseUrl() {
  const config = getKeycloakConfig();
  return `${config.baseUrl}/realms/${config.realm}`;
}

export function getAuthorizationEndpoint() {
  return `${getRealmBaseUrl()}/protocol/openid-connect/auth`;
}

export function getTokenEndpoint() {
  return `${getRealmBaseUrl()}/protocol/openid-connect/token`;
}

export function getLogoutEndpoint() {
  return `${getRealmBaseUrl()}/protocol/openid-connect/logout`;
}

export function getUserInfoEndpoint() {
  return `${getRealmBaseUrl()}/protocol/openid-connect/userinfo`;
}

export function getAuthCallbackUrl(origin: string) {
  return `${origin}/api/auth/callback`;
}
