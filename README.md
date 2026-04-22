# CATastrophic Club

`CATastrophic Club` is a small cat-themed web app built on `Next.js 16`. It combines a public landing page with authenticated features: saved favorites, cat battles, and a leaderboard based on battle scores.

The project is a full-stack App Router application. Pages are rendered on the server, interactive parts live in client widgets, and backend logic is implemented inside the same repository through route handlers and PostgreSQL repositories.

## What the App Does

The current product surface is small and easy to map:

- `/` shows a random cat image and a cat fact
- `/favorites` shows the authenticated user's saved cats
- `/battles` lets authenticated users vote between two cats
- `/leaderboard` shows battle rankings with pagination through `offset`

Authentication is handled through Keycloak. Data is stored in PostgreSQL. The UI is localized for Russian and English.

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

## Getting Started

### Requirements

You need:

- Node.js compatible with `Next.js 16`
- `npm`
- PostgreSQL
- a Keycloak instance

The repository uses `npm` as the package manager. That is confirmed by `package-lock.json`.

### Install

```bash
npm install
cp .env.example .env
```

### Required Environment

At minimum, configure:

```env
DATABASE_URL=postgres://user:password@host:5432/database
AUTH_SECRET=replace-with-a-long-random-string
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=change-me-for-local-dev
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

See `.env.example` for the full list.

### Run Locally

```bash
npm run db:migrate
npm run dev
```

The app expects:

- the application itself on `http://localhost:3000`
- a local Keycloak baseline on `http://localhost:8080`
- database migrations to be applied explicitly with `npm run db:migrate`

## Available Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run seed:battle-cats
```

What is not present in the repo:

- no confirmed `test` script
- no confirmed standalone `typecheck` script

## Project Structure

The repository is organized by layers.

- `src/app` contains routes, layouts, route handlers, and global styles
- `src/widgets` contains page-level UI compositions
- `src/features` contains focused user actions
- `src/entities` contains domain types, entity UI, repositories, and client wrappers
- `src/shared` contains auth, database access, i18n, shared UI, and utilities
- `docs` contains project documentation
- `infra/keycloak` contains local Keycloak setup files

Important entry points:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/favorites/page.tsx`
- `src/app/battles/page.tsx`
- `src/app/leaderboard/page.tsx`
- `src/app/api/**/route.ts`

## Architecture in One Paragraph

This is a mixed server/client Next.js application. Route pages fetch initial data on the server and pass it into interactive client widgets. Database access lives in repositories under `src/entities/*/api/repository.ts`. Client-side mutations go through route handlers under `src/app/api`. There is no global state library; most state is local component state, plus a few small in-memory caches.

## Current Technical Risks

The codebase is small, but there are a few things worth knowing before changing it:

- login and registration UI are duplicated between desktop and mobile layouts
- auth includes both direct credential flows and an OAuth callback path
- repositories can auto-run migrations during request handling
- auth rate limiting is in-memory and process-local
- there is no automated test suite confirmed by code

## Documentation

- [docs/architecture.md](./docs/architecture.md) explains how the app is structured
- [docs/development.md](./docs/development.md) describes the developer workflow
- [docs/api.md](./docs/api.md) documents API routes, repositories, and auth
- [docs/local-setup.md](./docs/local-setup.md) covers local app setup
- [docs/keycloak-local.md](./docs/keycloak-local.md) covers local Keycloak
- [docs/deploy.md](./docs/deploy.md) covers the current deployment baseline
- [docs/operations.md](./docs/operations.md) lists runtime checks and operational risks
