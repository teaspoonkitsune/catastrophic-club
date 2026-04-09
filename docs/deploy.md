## Deployment Guide

This document describes the production requirements for deploying CATastrophic Club. It intentionally stays provider-agnostic.

## Runtime Requirements

- Node.js runtime compatible with `Next.js 16`
- PostgreSQL database
- Keycloak instance reachable from the app
- persistent environment variable management
- a reverse proxy or hosting layer that terminates TLS
- a container runtime if you use the bundled Docker deployment files

## Required Environment Variables

Start from [.env.example](../.env.example).

Required in production:
- `DATABASE_URL`
- `DATABASE_SSL`
- `AUTH_SECRET`
- `AUTH_SESSION_TTL_SECONDS`
- `KEYCLOAK_BASE_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`
- `KEYCLOAK_ADMIN_USERNAME`
- `KEYCLOAK_ADMIN_PASSWORD`

Optional but supported:
- `AUTO_RUN_MIGRATIONS`
- `AUTH_RATE_LIMIT_MAX_ATTEMPTS`
- `AUTH_RATE_LIMIT_WINDOW_SECONDS`

Production expectations:
- `DATABASE_URL` should use the real production database and SSL where appropriate
- `DATABASE_SSL=false` is correct for the bundled internal Docker PostgreSQL service
- `AUTH_SECRET` must be long, random, and private
- Keycloak values must point to the production realm and client
- `AUTO_RUN_MIGRATIONS=false` is recommended in production; run migrations explicitly during rollout

## Build And Start

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

## Container Deployment

The repository now includes a self-hosting baseline:

- [Dockerfile](../Dockerfile)
- [docker-compose.prod.yml](../docker-compose.prod.yml)
- [docker/production.env.example](../docker/production.env.example)

Typical flow:
1. Copy `docker/production.env.example` to a private server-only env file
2. Adjust domains, database users, passwords, and Keycloak values
3. Build and start the internal services with Docker Compose
4. Run the migration container explicitly
5. Put Nginx in front of `127.0.0.1:3000` for the app and `127.0.0.1:8080` for Keycloak

## Database Rollout

Run migrations before or during rollout:

```bash
npm run db:migrate
```

When using Docker Compose:

```bash
docker compose --env-file /srv/catastrophic-club/env/app.env -f docker-compose.prod.yml run --rm migrate
```

Recommended order:
1. Provision database and Keycloak
2. Configure production environment variables
3. Run migrations
4. Build and deploy the app
5. Verify auth, favorites, battles, and leaderboard

## Health Check

The app exposes:

- `/api/health`

Current checks:
- auth-related environment validation
- database connectivity

Expected behavior:
- `200` when checks pass
- `503` when any required check fails
- `Cache-Control: no-store`

## Keycloak Requirements

The production Keycloak client must be configured for the real app origin.

At minimum, align:
- redirect URIs
- post logout redirect URIs
- allowed web origins
- client secret
- registration policy
- direct access grant usage if inline password login remains part of the product

## Validation Checklist

Before exposing the deployment publicly, verify:
- `npm run lint` passes on the release commit
- `npm run build` passes on the release commit
- auth login works
- auth registration works if enabled
- logout clears the local app session
- favorites read/write works
- battle voting works
- leaderboard renders
- localized content renders correctly for both `ru` and `en`

## Known Gaps To Address

The current repository does not yet include:
- provider-specific deployment manifests
- CI/CD definitions
- monitoring integration

Those should be handled before a serious public rollout.
