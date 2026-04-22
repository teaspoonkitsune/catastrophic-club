# Build and Deployment

## Overview

The repository contains a practical baseline for self-hosting:

- a multi-stage `Dockerfile`
- `docker-compose.prod.yml`
- a production env example in `docker/production.env.example`

What is not confirmed by code:

- CI/CD
- staging configuration
- deploy automation on merge

## Dockerfile

The `Dockerfile` has four stages:

| Stage | Purpose |
| --- | --- |
| `deps` | install dependencies with `npm ci` |
| `builder` | build the app |
| `tools` | run migrations |
| `runner` | serve the standalone Next.js build |

Important details:

- the build uses `output: 'standalone'`
- placeholder env values are set in the build stage so `next build` can complete
- the runtime container exposes port `3000`

## Production Compose Setup

`docker-compose.prod.yml` defines four services.

### `postgres`

This service stores both the app database and the Keycloak database. Initialization scripts are mounted from `docker/postgres/init`.

### `keycloak`

Keycloak runs from `quay.io/keycloak/keycloak:26.5.5`, imports the realm from `infra/keycloak/realm-import`, and binds to `127.0.0.1:8080`.

### `migrate`

This service is built from the `tools` stage and is intended to run migrations against the application database.

### `app`

This is the Next.js production container built from the `runner` stage. It binds to `127.0.0.1:3000`.

## Production Environment

The sample file is `docker/production.env.example`.

Confirmed variables:

- `APP_DOMAIN`
- `KEYCLOAK_HOSTNAME`
- `POSTGRES_SUPERUSER`
- `POSTGRES_SUPERPASSWORD`
- `APP_DB_NAME`
- `APP_DB_USER`
- `APP_DB_PASSWORD`
- `KEYCLOAK_DB_NAME`
- `KEYCLOAK_DB_USER`
- `KEYCLOAK_DB_PASSWORD`
- `DATABASE_SSL`
- `AUTO_RUN_MIGRATIONS`
- `AUTH_SECRET`
- `AUTH_SESSION_TTL_SECONDS`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`
- `KEYCLOAK_ADMIN_USERNAME`
- `KEYCLOAK_ADMIN_PASSWORD`
- `AUTH_RATE_LIMIT_MAX_ATTEMPTS`
- `AUTH_RATE_LIMIT_WINDOW_SECONDS`

## Deployment Flow Implied by the Repo

The files suggest this order:

1. prepare env values from `docker/production.env.example`
2. build the images
3. start PostgreSQL and Keycloak
4. run the `migrate` profile
5. start the app
6. verify `/api/health`

## What Should Be Verified After Deployment

At minimum:

- `/api/health`
- login
- registration
- favorites loading
- battle voting
- leaderboard pagination

## Gaps

The repository does not confirm:

- reverse proxy configuration
- TLS termination strategy
- staging rollout flow
- CI/CD pipeline files
