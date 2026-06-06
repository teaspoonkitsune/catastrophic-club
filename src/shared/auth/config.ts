const DEFAULT_SCOPE = 'openid profile email';
const DEFAULT_APP_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_AUTH_RATE_LIMIT_MAX_ATTEMPTS = 10;
const DEFAULT_AUTH_RATE_LIMIT_WINDOW_SECONDS = 60;

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

function getEnvOrDefault(name: string, defaultValue: string) {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  return value;
}

export function getAuthSecret() {
  return getEnv('AUTH_SECRET');
}

export function getAppSessionTtlSeconds() {
  const value = process.env.AUTH_SESSION_TTL_SECONDS;

  if (!value) {
    return DEFAULT_APP_SESSION_TTL_SECONDS;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 300) {
    return DEFAULT_APP_SESSION_TTL_SECONDS;
  }

  return parsed;
}

export function getAuthRateLimitMaxAttempts() {
  const value = process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS;

  if (!value) {
    return DEFAULT_AUTH_RATE_LIMIT_MAX_ATTEMPTS;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_AUTH_RATE_LIMIT_MAX_ATTEMPTS;
  }

  return parsed;
}

export function getAuthRateLimitWindowSeconds() {
  const value = process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS;

  if (!value) {
    return DEFAULT_AUTH_RATE_LIMIT_WINDOW_SECONDS;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_AUTH_RATE_LIMIT_WINDOW_SECONDS;
  }

  return parsed;
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

export function validateAuthEnvironment() {
  getAuthSecret();
  getKeycloakConfig();
  getEnv('KEYCLOAK_CLIENT_SECRET');
  getEnvOrDefault('KEYCLOAK_ADMIN_REALM', 'master');
  getEnvOrDefault('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli');
  getEnv('KEYCLOAK_ADMIN_USERNAME');
  getEnv('KEYCLOAK_ADMIN_PASSWORD');
}

export function getKeycloakAdminConfig() {
  const config = getKeycloakConfig();

  return {
    baseUrl: config.baseUrl,
    realm: config.realm,
    adminRealm: getEnvOrDefault('KEYCLOAK_ADMIN_REALM', 'master'),
    adminClientId: getEnvOrDefault('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli'),
    adminUsername: getEnv('KEYCLOAK_ADMIN_USERNAME'),
    adminPassword: getEnv('KEYCLOAK_ADMIN_PASSWORD'),
  };
}

function getRealmBaseUrl() {
  const config = getKeycloakConfig();
  return `${config.baseUrl}/realms/${config.realm}`;
}

export function getTokenEndpoint() {
  return `${getRealmBaseUrl()}/protocol/openid-connect/token`;
}

export function getUserInfoEndpoint() {
  return `${getRealmBaseUrl()}/protocol/openid-connect/userinfo`;
}

export function getKeycloakAdminTokenEndpoint() {
  const config = getKeycloakAdminConfig();
  return `${config.baseUrl}/realms/${config.adminRealm}/protocol/openid-connect/token`;
}

export function getKeycloakAdminUsersEndpoint() {
  const config = getKeycloakAdminConfig();
  return `${config.baseUrl}/admin/realms/${config.realm}/users`;
}

export function getKeycloakAdminUserEndpoint(userId: string) {
  return `${getKeycloakAdminUsersEndpoint()}/${encodeURIComponent(userId)}`;
}
