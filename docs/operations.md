## Operations

This document covers the minimum operational expectations for running CATastrophic Club in a shared or production-like environment.

## Backups

Back up at least:
- PostgreSQL data
- Keycloak realm configuration and relevant user data
- environment variable definitions stored outside the repository

Recommended baseline:
- scheduled database backups
- tested restore flow
- documented retention policy

## Restore Readiness

Be able to restore:
- application database
- Keycloak client and realm configuration
- app environment variables

Do not assume that having backups is enough. A restore procedure should be tested.

## Release Checks

For every release candidate:
- run `npm run lint`
- run `npm run build`
- run `npm run db:migrate` in the target environment
- verify auth, favorites, battles, and leaderboard

## Incident Basics

If the app fails after deployment, check in this order:
1. app process startup and runtime logs
2. database connectivity
3. Keycloak connectivity
4. environment variable correctness
5. migration state
6. cookie and auth behavior over HTTPS

## Authentication Notes

The app stores its own encrypted session cookie after successful Keycloak login.

Current cookie properties:
- `httpOnly`
- `sameSite=lax`
- `secure` in production

Operationally, watch for:
- mismatched app and Keycloak origins
- broken redirect URIs
- incorrect client secret
- stale `AUTH_SECRET` rotation without rollout planning

## Observability Gaps

The repository currently does not include:
- centralized error monitoring
- request tracing
- structured application logs
- alerting

These are not blockers for local development, but they are real gaps for production support.
