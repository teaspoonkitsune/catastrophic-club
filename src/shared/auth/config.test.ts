import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAppSessionTtlSeconds,
  getAuthRateLimitMaxAttempts,
  getAuthRateLimitWindowSeconds,
  getKeycloakAdminConfig,
  getKeycloakAdminTokenEndpoint,
  getKeycloakConfig,
  getTokenEndpoint,
  getUserInfoEndpoint,
  validateAuthEnvironment,
} from './config';

const originalEnv = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }

  Object.assign(process.env, originalEnv);
}

test.beforeEach(() => {
  restoreEnv();
});

test.after(() => {
  restoreEnv();
});

test('getKeycloakConfig trims trailing slashes and preserves scope', () => {
  process.env.KEYCLOAK_BASE_URL = 'http://localhost:8080/';
  process.env.KEYCLOAK_REALM = 'cats';
  process.env.KEYCLOAK_CLIENT_ID = 'web';
  process.env.KEYCLOAK_CLIENT_SECRET = 'secret';
  process.env.KEYCLOAK_SCOPE = 'openid email';

  assert.deepEqual(getKeycloakConfig(), {
    baseUrl: 'http://localhost:8080',
    realm: 'cats',
    clientId: 'web',
    clientSecret: 'secret',
    scope: 'openid email',
  });
});

test('auth config numeric helpers fall back for missing or invalid values', () => {
  delete process.env.AUTH_SESSION_TTL_SECONDS;
  delete process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS;
  delete process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS;

  assert.equal(getAppSessionTtlSeconds(), 604800);
  assert.equal(getAuthRateLimitMaxAttempts(), 10);
  assert.equal(getAuthRateLimitWindowSeconds(), 60);

  process.env.AUTH_SESSION_TTL_SECONDS = '200';
  process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '0';
  process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS = '-1';

  assert.equal(getAppSessionTtlSeconds(), 604800);
  assert.equal(getAuthRateLimitMaxAttempts(), 10);
  assert.equal(getAuthRateLimitWindowSeconds(), 60);
});

test('auth endpoints are derived from the configured realm', () => {
  process.env.KEYCLOAK_BASE_URL = 'http://localhost:8080/';
  process.env.KEYCLOAK_REALM = 'cats';
  process.env.KEYCLOAK_CLIENT_ID = 'web';
  process.env.KEYCLOAK_ADMIN_USERNAME = 'admin';
  process.env.KEYCLOAK_ADMIN_PASSWORD = 'password';

  assert.equal(getTokenEndpoint(), 'http://localhost:8080/realms/cats/protocol/openid-connect/token');
  assert.equal(getUserInfoEndpoint(), 'http://localhost:8080/realms/cats/protocol/openid-connect/userinfo');
  assert.deepEqual(getKeycloakAdminConfig(), {
    baseUrl: 'http://localhost:8080',
    realm: 'cats',
    adminRealm: 'master',
    adminClientId: 'admin-cli',
    adminUsername: 'admin',
    adminPassword: 'password',
  });
  assert.equal(
    getKeycloakAdminTokenEndpoint(),
    'http://localhost:8080/realms/master/protocol/openid-connect/token',
  );
});

test('validateAuthEnvironment throws when required values are missing', () => {
  assert.throws(() => validateAuthEnvironment(), /AUTH_SECRET is not set/);
});
