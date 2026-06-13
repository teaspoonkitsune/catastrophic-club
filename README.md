# CATastrophic Club

[![CI](https://github.com/teaspoonkitsune/catastrophic-club/actions/workflows/ci.yml/badge.svg)](https://github.com/teaspoonkitsune/catastrophic-club/actions/workflows/ci.yml)

`CATastrophic Club` is a small full-stack app about cats, voting, favorites, and a persistent leaderboard.

It is built as a self-hosted `Next.js` project with `PostgreSQL` and `Keycloak`, and the UI is available in `English`, `Russian`, and `Ukrainian`.

## What You Get

- cat of the day on the home page
- account login and registration directly inside the site
- personal favorites
- cat battles with saved results
- leaderboard and battle history
- local bootstrap for development
- production-oriented bootstrap for self-hosted deploys

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `PostgreSQL`
- `Kysely`
- `Keycloak`
- CSS Modules

External providers:

- `cataas.com` for cat images
- `catfact.ninja` for cat facts
- `http.cat` for error illustrations

## Quick Start

```bash
git clone https://github.com/teaspoonkitsune/catastrophic-club.git
cd catastrophic-club
npm install
./scripts/bootstrap-local.sh
npm run dev
```

Open `http://localhost:3000`.

## Deploy

Production bootstrap is prepared for a self-hosted server:

```bash
./scripts/bootstrap-prod.sh --app-domain example.com --keycloak-hostname auth.example.com
```

It prepares env values, deploys the stack, and wires the Keycloak client. DNS, reverse proxy, and TLS are still your responsibility.

## Checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run smoke
```

## Documentation

- [Guide](./docs/guide.md) - from download to local run and production deploy
- [Architecture](./docs/architecture.md) - project structure and main modules
- [Known Issues](./docs/known-issues.md) - current limits and tradeoffs
- [Next Steps](./docs/next-steps.md) - sensible follow-up work
