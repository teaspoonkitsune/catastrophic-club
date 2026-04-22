# Local Setup

## Overview

To run the project locally, you need the Next.js app itself, PostgreSQL, and Keycloak. The repository includes files for local Keycloak, but not for a local PostgreSQL container.

## Prerequisites

- Node.js compatible with `Next.js 16`
- `npm`
- PostgreSQL
- Keycloak

## Installation

```bash
npm install
cp .env.example .env
```

## Environment Variables

Use `.env.example` as the base file.

Minimum setup:

```env
DATABASE_URL=postgres://user:password@host:5432/database
DATABASE_SSL=false
AUTH_SECRET=replace-with-a-long-random-string
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=change-me-for-local-dev
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

Useful optional values:

```env
AUTH_SESSION_TTL_SECONDS=604800
KEYCLOAK_SCOPE=openid profile email
KEYCLOAK_ADMIN_REALM=master
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
AUTO_RUN_MIGRATIONS=false
AUTH_RATE_LIMIT_MAX_ATTEMPTS=10
AUTH_RATE_LIMIT_WINDOW_SECONDS=60
```

## Database Setup

Point `DATABASE_URL` at a running PostgreSQL instance.

Before development, apply migrations:

```bash
npm run db:migrate
```

The codebase can also auto-run migrations through repositories. That behavior is controlled by `AUTO_RUN_MIGRATIONS`, but it is still a good idea to run migrations explicitly before starting work.
By default, the app now expects explicit migrations. Turn on `AUTO_RUN_MIGRATIONS=true` only if you deliberately want request-time migration attempts.

## Keycloak Setup

For local Keycloak instructions, see [keycloak-local.md](./keycloak-local.md).

The expected local baseline is:

- app: `http://localhost:3000`
- Keycloak: `http://localhost:8080`

If the Keycloak admin console still complains about HTTPS on localhost, also apply the local `master` realm override described in `docs/keycloak-local.md`. The application realm already allows HTTP, but the built-in admin realm may not.

## Start Development Mode

```bash
npm run dev
```

## Useful Commands

```bash
npm run lint
npm run build
npm run seed:battle-cats
```

`npm run seed:battle-cats` runs `src/script.ts`.

## Typical Problems

### Missing `DATABASE_URL`

You will get:

- `DATABASE_URL is not set`

Source:

- `src/shared/api/database.ts`

### Missing auth settings

You can hit errors such as:

- `AUTH_SECRET is not set`
- missing `KEYCLOAK_*` values

Source:

- `src/shared/auth/config.ts`

### Broken Keycloak admin credentials

Symptom:

- registration fails even if the app itself starts

Source:

- `src/shared/auth/keycloak.ts`

### Migration problems

Symptom:

- normal page loads or API requests fail because repository access triggers migrations

Recommendation:

- keep `AUTO_RUN_MIGRATIONS` unset or `false`
- run `npm run db:migrate` manually before starting the app
## Suggested Smoke Check

After setup:

1. run `npm run lint`
2. run `npm run build`
3. open `/`
4. open `/favorites`
5. open `/battles`
6. open `/leaderboard`
7. check `/api/health`
