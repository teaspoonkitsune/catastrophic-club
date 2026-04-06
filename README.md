# CATastrophic Club

CATastrophic Club is a small cat-themed web app built with `Next.js 16`, `React 19`, `PostgreSQL`, and `Kysely`.

The project includes:
- a home page with a random cat image and cat fact
- personal favorites
- cat battles with score updates
- a leaderboard based on battle results
- inline login and registration backed by Keycloak

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `PostgreSQL`
- `Kysely`
- `Keycloak` for authentication

## Project Structure

- `src/app` — App Router pages, layouts, error boundaries, and route handlers
- `src/entities` — domain entities for cats, favorites, and battles
- `src/features` — user actions such as toggling favorites
- `src/widgets` — larger UI blocks used across pages
- `src/shared` — auth, database, migrations, helpers, and shared UI
- `docs` — local setup notes
- `infra/keycloak` — local Keycloak configuration

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment files

Create a local app env file from the example:

```bash
cp .env.example .env
```

Create a local Keycloak env file if you want to run auth locally:

```bash
cp infra/keycloak/.env.example infra/keycloak/.env
```

### 3. Configure application env

Minimum app env values:

```env
DATABASE_URL=postgres://user:password@host:5432/database
AUTH_SECRET=replace-with-a-long-random-string
AUTH_SESSION_TTL_SECONDS=604800
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=change-me-for-local-dev
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
# Optional defaults:
# KEYCLOAK_SCOPE=openid profile email
# KEYCLOAK_ADMIN_REALM=master
# KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
```

`DATABASE_URL` must point to a running PostgreSQL database before migrations can run. The repository does not currently include a local PostgreSQL compose file.

### 4. Start local Keycloak

```bash
cd infra/keycloak
podman compose up -d
```

More details are available in [docs/keycloak-local.md](./docs/keycloak-local.md).

### 5. Run migrations

```bash
npm run db:migrate
```

### 6. Start the app

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run seed:battle-cats
```

## Notes For GitHub

Keep these files local and do not commit them:

- `.env`
- `.env.local`
- `infra/keycloak/.env`
- `node_modules/`
- `.next/`

Use only the example env files in the repository:

- `.env.example`
- `infra/keycloak/.env.example`

## Auth

Authentication uses Keycloak behind inline login and registration forms. Auth route handlers live under `src/app/api/auth/*`, and the app stores its own encrypted session cookie after a successful Keycloak login.

For local development, the Keycloak client must allow direct access grants. The provided realm import already enables this for `catastrophic-club-web`.

## Database

Database migrations are stored in `src/shared/api/migrations`.
