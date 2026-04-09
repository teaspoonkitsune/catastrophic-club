## Deployment Guide

This document describes the production requirements for deploying CATastrophic Club. It intentionally stays provider-agnostic.

## Runtime Requirements

- Node.js runtime compatible with `Next.js 16`
- PostgreSQL database
- Keycloak instance reachable from the app
- persistent environment variable management
- a reverse proxy or hosting layer that terminates TLS

## Required Environment Variables

Start from [.env.example](../.env.example).

Required in production:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_SESSION_TTL_SECONDS`
- `KEYCLOAK_BASE_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`
- `KEYCLOAK_ADMIN_USERNAME`
- `KEYCLOAK_ADMIN_PASSWORD`

Optional but supported:
- `AUTH_RATE_LIMIT_MAX_ATTEMPTS`
- `AUTH_RATE_LIMIT_WINDOW_SECONDS`

Production expectations:
- `DATABASE_URL` should use the real production database and SSL where appropriate
- `AUTH_SECRET` must be long, random, and private
- Keycloak values must point to the production realm and client

## Build And Start

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

## Database Rollout

Run migrations before or during rollout:

```bash
npm run db:migrate
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
- container build files
- CI/CD definitions
- monitoring integration

Those should be handled before a serious public rollout.
