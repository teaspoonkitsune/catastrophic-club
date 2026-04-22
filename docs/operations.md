# Operations

## Overview

This document collects the operational details that are visible from the codebase today: health checks, database behavior, auth dependencies, and the parts of the app most likely to surprise you in production.

## Health Check

The health endpoint is:

- `/api/health`

Implementation:

- `src/app/api/health/route.ts`

It verifies:

- auth-related environment configuration
- auth rate-limit configuration parsing
- database connectivity with a simple `select 1`

The response includes:

- `ok`
- `checks.env`
- `checks.database`
- `timestamp`

## Database Operations

Migrations are run with:

```bash
npm run db:migrate
```

Relevant files:

- `src/shared/api/run-migrations.ts`
- `src/shared/api/migrator.ts`
- `src/shared/api/migrations/*`

One important detail: repositories can also trigger migrations during normal request handling through `ensureDatabaseMigrated()`.
In the current setup, automatic migrations are disabled by default and should be enabled only deliberately.

## Auth Operations

Key auth files:

- `src/shared/auth/config.ts`
- `src/shared/auth/session.ts`
- `src/shared/auth/keycloak.ts`
- `src/shared/auth/users.ts`

Operational dependencies:

- working Keycloak client settings
- working Keycloak admin credentials for registration
- a stable `AUTH_SECRET` for cookie encryption

## Runtime Risks

### In-Memory Rate Limiting

`src/shared/lib/rate-limit.ts` stores counters in a module-level `Map`.

That means:

- limits are local to a single process
- counters are lost on restart
- limits are not shared across multiple instances

### In-Memory Favorite Cache

`src/entities/favorite-cat/api/client.ts` keeps favorite state in a browser-side module cache.

That means:

- the UI can briefly hold stale favorite state
- another tab or another session can change data without this cache knowing

### Auto-Migrations on Request Paths

Repositories call `ensureDatabaseMigrated()`.

That is convenient in development, but operationally it means:

- DB migration issues can surface as normal request failures
- startup behavior depends on `AUTO_RUN_MIGRATIONS` and `NODE_ENV`

The current recommended mode is explicit migrations via `npm run db:migrate`.

### Split Auth Flow

The codebase supports both:

- direct credential login/register routes
- an OAuth callback route

That split makes auth changes a little more sensitive than they first appear.

### Local Keycloak over HTTP

For local development, the imported `catastrophic-club` realm already allows HTTP. The built-in `master` realm may still require SSL and block admin login over `http://localhost:8080`.

If that happens, update `master` locally with `sslRequired=NONE` as described in `docs/keycloak-local.md`.

## Manual Verification Checklist

After infrastructure, auth, or DB changes, the practical smoke test is:

1. `npm run lint`
2. `npm run build`
3. verify `/api/health`
4. verify login
5. verify registration
6. verify logout
7. verify `/favorites`
8. verify `/battles`
9. verify `/leaderboard`

## Limits of This Document

These things could not be confirmed from the repository itself:

- CI/CD workflow
- automated test setup
- local PostgreSQL container setup
