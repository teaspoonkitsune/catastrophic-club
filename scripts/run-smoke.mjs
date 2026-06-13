#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const appDir = process.cwd();
const composeProject = process.env.SMOKE_COMPOSE_PROJECT ?? 'catastrophic-club-smoke';
const appPort = Number(process.env.SMOKE_APP_PORT ?? '3100');
const keycloakUrl = process.env.SMOKE_KEYCLOAK_BASE_URL ?? 'http://127.0.0.1:8080';
const databaseUrl =
  process.env.SMOKE_DATABASE_URL
  ?? 'postgres://catastrophic_club:catastrophic_club@127.0.0.1:5432/catastrophic_club';
const smokeEnvFile = process.env.SMOKE_ENV_FILE ?? '/tmp/catastrophic-club-smoke.env';
const appBaseUrl = `http://127.0.0.1:${appPort}`;
const buildIdPath = join(appDir, '.next', 'BUILD_ID');

const authSecret = 'catastrophic-club-smoke-auth-secret';
const keycloakClientSecret = 'catastrophic-club-smoke-client-secret';

const appEnv = {
  DATABASE_URL: databaseUrl,
  DATABASE_SSL: 'false',
  AUTH_SECRET: authSecret,
  AUTH_SESSION_TTL_SECONDS: '604800',
  KEYCLOAK_BASE_URL: keycloakUrl,
  KEYCLOAK_REALM: 'catastrophic-club',
  KEYCLOAK_CLIENT_ID: 'catastrophic-club-web',
  KEYCLOAK_CLIENT_SECRET: keycloakClientSecret,
  KEYCLOAK_ADMIN_USERNAME: 'admin',
  KEYCLOAK_ADMIN_PASSWORD: 'admin',
  KEYCLOAK_SCOPE: 'openid profile email',
  KEYCLOAK_ADMIN_REALM: 'master',
  KEYCLOAK_ADMIN_CLIENT_ID: 'admin-cli',
  AUTO_RUN_MIGRATIONS: 'false',
  AUTH_RATE_LIMIT_MAX_ATTEMPTS: '10',
  AUTH_RATE_LIMIT_WINDOW_SECONDS: '60',
  HOSTNAME: '127.0.0.1',
  PORT: String(appPort),
  NODE_ENV: 'production',
};

function logStep(message) {
  console.log(`[smoke] ${message}`);
}

function createEnvBlock(env) {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appDir,
      stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...options.env,
      },
    });
    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} failed with code ${code}\n${stdout}\n${stderr}`.trim(),
        ),
      );
    });
  });
}

async function waitForHttp(url, attempts = 90, sleepMs = 2_000) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: 'no-store' });

      if (response.ok) {
        return;
      }
    } catch {
      // Wait and retry.
    }

    await delay(sleepMs);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function extractSessionCookie(response) {
  const rawSetCookie = response.headers.get('set-cookie');

  if (!rawSetCookie) {
    return null;
  }

  const sessionCookie = rawSetCookie
    .split(/,(?=[^;]+?=)/)
    .find((item) => item.startsWith('catastrophic_club_session='));

  if (!sessionCookie) {
    return null;
  }

  return sessionCookie.split(';', 1)[0] ?? null;
}

async function requestJson(pathname, options = {}, expectedStatus = 200) {
  const response = await fetch(`${appBaseUrl}${pathname}`, {
    redirect: 'manual',
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.headers ?? {}),
    },
  });

  assert.equal(
    response.status,
    expectedStatus,
    `${pathname} returned ${response.status} instead of ${expectedStatus}`,
  );

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return { response, data: null };
  }

  return {
    response,
    data: await response.json(),
  };
}

async function requestPage(pathname, expectedStatus = 200) {
  const response = await fetch(`${appBaseUrl}${pathname}`, {
    redirect: 'manual',
    cache: 'no-store',
  });

  assert.equal(
    response.status,
    expectedStatus,
    `${pathname} returned ${response.status} instead of ${expectedStatus}`,
  );

  const body = await response.text();
  assert.match(body, /<html/i, `${pathname} did not return HTML`);
}

let appProcess = null;

async function cleanup() {
  if (appProcess && !appProcess.killed) {
    appProcess.kill('SIGTERM');
    await new Promise((resolve) => {
      appProcess.once('exit', resolve);
      setTimeout(resolve, 5_000);
    });
  }

  try {
    await runCommand('docker', [
      'compose',
      '-p',
      composeProject,
      '-f',
      'docker-compose.local.yml',
      'down',
      '-v',
    ]);
  } catch (error) {
    console.error('[smoke] cleanup failed:', error instanceof Error ? error.message : error);
  }
}

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(130);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(143);
});

async function main() {
  writeFileSync(smokeEnvFile, `${createEnvBlock(appEnv)}\n`, 'utf8');

  if (!existsSync(buildIdPath)) {
    logStep('build output missing, running npm run build');
    await runCommand('npm', ['run', 'build'], {
      env: appEnv,
      stdio: 'inherit',
    });
  }

  logStep('starting local postgres + keycloak');
  await runCommand('docker', [
    'compose',
    '-p',
    composeProject,
    '-f',
    'docker-compose.local.yml',
    'up',
    '-d',
  ]);

  try {
    logStep('waiting for keycloak');
    await waitForHttp(keycloakUrl);

    logStep('configuring keycloak client');
    await runCommand('./scripts/configure-keycloak.sh', [
      '--local',
      '--env-file',
      smokeEnvFile,
    ], {
      env: {
        COMPOSE_PROJECT_NAME: composeProject,
      },
    });

    logStep('running migrations');
    await runCommand('npm', ['run', 'db:migrate'], {
      env: appEnv,
      stdio: 'inherit',
    });

    logStep('starting app');
    appProcess = spawn('npm', ['start'], {
      cwd: appDir,
      env: {
        ...process.env,
        ...appEnv,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let appStdout = '';
    let appStderr = '';

    appProcess.stdout?.on('data', (chunk) => {
      appStdout += chunk.toString();
    });

    appProcess.stderr?.on('data', (chunk) => {
      appStderr += chunk.toString();
    });

    appProcess.on('exit', (code) => {
      if (code && code !== 0) {
        console.error('[smoke] app exited unexpectedly');
        console.error(appStdout);
        console.error(appStderr);
      }
    });

    logStep('waiting for app health');
    await waitForHttp(`${appBaseUrl}/api/health`);

    logStep('checking public routes');
    await requestPage('/');
    await requestPage('/leaderboard');
    await requestPage('/battles');
    await requestPage('/favorites');

    const health = await requestJson('/api/health', {}, 200);
    assert.equal(health.data?.ok, true, 'health check did not report ok');

    const username = `smoke-${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'smoke-pass-123';

    logStep('registering test user');
    const register = await requestJson('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }, 201);
    let sessionCookie = extractSessionCookie(register.response);
    assert.ok(sessionCookie, 'register did not set session cookie');

    logStep('checking authenticated favorites');
    const favoritesBefore = await requestJson('/api/favorites', {
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert.ok(Array.isArray(favoritesBefore.data), 'favorites list is not an array');

    logStep('loading battle pair');
    const pairResponse = await requestJson('/api/battles');
    assert.equal(pairResponse.data?.pair?.length, 2, 'battle pair did not include two cats');
    const [firstCat, secondCat] = pairResponse.data.pair;
    assert.ok(firstCat?.id && secondCat?.id, 'battle pair is missing ids');

    logStep('saving favorite');
    await requestJson('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        id: firstCat.id,
        imageUrl: firstCat.imageUrl,
      }),
    }, 201);

    const favoriteState = await requestJson(`/api/favorites?id=${encodeURIComponent(firstCat.id)}`, {
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert.equal(favoriteState.data?.isFavorite, true, 'favorite flag was not persisted');

    logStep('submitting battle vote');
    const battleResult = await requestJson('/api/battles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        winnerId: firstCat.id,
        loserId: secondCat.id,
      }),
    });
    assert.ok(battleResult.data?.historyEntry?.id, 'battle result did not return history entry');

    const privateHistory = await requestJson('/api/battles/history?scope=mine', {
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert.ok(
      privateHistory.data?.items?.some((item) => item.id === battleResult.data.historyEntry.id),
      'private battle history did not include submitted vote',
    );

    logStep('logging out');
    const logout = await requestJson('/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: sessionCookie,
      },
    });
    sessionCookie = extractSessionCookie(logout.response) ?? '';

    await requestJson('/api/favorites', {
      headers: {
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      },
    }, 401);

    logStep('logging back in');
    const login = await requestJson('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    sessionCookie = extractSessionCookie(login.response);
    assert.ok(sessionCookie, 'login did not set session cookie');

    const favoritesAfterLogin = await requestJson('/api/favorites', {
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert.ok(Array.isArray(favoritesAfterLogin.data), 'favorites list after login is not an array');

    logStep('smoke checks passed');
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error('[smoke] failed');
  console.error(error);
  process.exitCode = 1;
});
