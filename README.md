# CATastrophic Club

CATastrophic Club is a cat-themed web app built with `Next.js 16`, `React 19`, `PostgreSQL`, `Kysely`, and `Keycloak`.

The app currently includes:
- a localized home page with a random cat image and cat fact
- personal favorites
- cat battles with score tracking
- a leaderboard based on battle results
- inline login and registration backed by Keycloak

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `PostgreSQL`
- `Kysely`
- `Keycloak`

## Project Structure

- `src/app` - App Router pages, layouts, error boundaries, and route handlers
- `src/entities` - domain entities such as cats, favorites, and battles
- `src/features` - user-facing actions such as toggling favorites
- `src/widgets` - larger UI building blocks
- `src/shared` - auth, database, i18n, helpers, and shared UI
- `docs` - project documentation
- `infra/keycloak` - local Keycloak setup

## Documentation

- [docs/local-setup.md](./docs/local-setup.md) - local development setup
- [docs/keycloak-local.md](./docs/keycloak-local.md) - local Keycloak setup
- [docs/deploy.md](./docs/deploy.md) - deployment requirements and rollout checklist
- [docs/operations.md](./docs/operations.md) - operational notes, backups, and incident basics

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create the app env file:

```bash
cp .env.example .env
```

3. Start PostgreSQL and Keycloak for local development.

4. Run migrations:

```bash
npm run db:migrate
```

5. Start the app:

```bash
npm run dev
```

For the complete local flow, use [docs/local-setup.md](./docs/local-setup.md).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run seed:battle-cats
```

## Environment

The canonical example environment file is:

- [.env.example](./.env.example)

Local-only Keycloak container variables live in:

- [infra/keycloak/.env.example](./infra/keycloak/.env.example)

Do not commit:

- `.env`
- `.env.local`
- `infra/keycloak/.env`
- `.next`
- `node_modules`

## Notes

- The repository includes local Keycloak infrastructure, but not a local PostgreSQL compose setup.
- Authentication uses the app's own encrypted session cookie after successful Keycloak login.
- The app currently supports `ru` and `en` and chooses the initial locale from a saved cookie or the request language.
