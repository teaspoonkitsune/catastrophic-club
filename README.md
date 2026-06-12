# CATastrophic Club

[![CI](https://github.com/teaspoonkitsune/catastrophic-club/actions/workflows/ci.yml/badge.svg)](https://github.com/teaspoonkitsune/catastrophic-club/actions/workflows/ci.yml)

`CATastrophic Club` is a cat-themed full-stack web app built with `Next.js 16`, `PostgreSQL`, and `Keycloak`.

It combines a public landing page with interactive cat features: favorites, head-to-head battles, and a persistent leaderboard.

## Status

This is an application repository, not a reusable package. It is ready for local runs, demos, and self-hosted iteration. Production deployment is supported with bootstrap scripts for env generation, deploy, and Keycloak client setup.

## Highlights

- cat of the day with graceful fallback behavior
- embedded login and registration without redirecting users to a Keycloak login page
- authenticated favorites collection
- head-to-head cat battles with persisted scores
- leaderboard and battle history views
- Russian, English, and Ukrainian UI

## Product Surface

- `/` shows the cat of the day and a cat fact
- `/favorites` shows the signed-in user's saved cats
- `/battles` lets signed-in users vote between two cats
- `/leaderboard` shows battle rankings with pagination

Authentication is backed by Keycloak. Persistence is backed by PostgreSQL.

## Stack

- `Next.js 16.2.0`
- `React 19.2.4`
- `TypeScript 5`
- `ESLint 9`
- `PostgreSQL`
- `Kysely`
- `Keycloak`
- CSS Modules

External runtime dependencies:

- `cataas.com` for cat images
- `catfact.ninja` for cat facts
- `http.cat` for error illustrations

## Verification

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Fast Start

Local bootstrap:

```bash
./scripts/bootstrap-local.sh
npm run dev
```

Production-oriented bootstrap on a server:

```bash
./scripts/bootstrap-prod.sh --app-domain example.com --keycloak-hostname auth.example.com
```

## Demo Data

If you want a fuller battles/leaderboard demo locally, run:

```bash
npm run seed:battle-cats
```

This command fetches candidate cats from `cataas.com` and inserts new `battle_cats` rows into PostgreSQL. It depends on network access and on the external provider returning data.

## Docs

- [docs/guide.md](./docs/guide.md) covers the full path from download to local run to production deploy
- [docs/architecture.md](./docs/architecture.md) describes the codebase structure
- [docs/known-issues.md](./docs/known-issues.md) lists the current limitations
