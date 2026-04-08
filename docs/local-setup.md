## Local Setup

This guide covers the expected local development flow for CATastrophic Club.

## Requirements

- Node.js compatible with the project toolchain
- npm
- PostgreSQL
- Podman with `podman compose` if you want to run the bundled local Keycloak setup

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Environment Files

App env:

```bash
cp .env.example .env
```

Optional local Keycloak env:

```bash
cp infra/keycloak/.env.example infra/keycloak/.env
```

## 3. Configure The App Environment

At minimum, configure:

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
```

Notes:
- `DATABASE_URL` must point to a working PostgreSQL instance.
- The repository does not currently include a local PostgreSQL compose file.
- `AUTH_SECRET` should be long and random even in development.

## 4. Start Local Keycloak

Use [keycloak-local.md](./keycloak-local.md) for the exact flow.

Quick start:

```bash
cd infra/keycloak
podman compose up -d
```

## 5. Run Database Migrations

```bash
npm run db:migrate
```

## 6. Start The App

```bash
npm run dev
```

## 7. Optional Seed Data

If you need battle data:

```bash
npm run seed:battle-cats
```

## Verification Checklist

- `npm run lint` passes
- `npm run build` passes
- the app opens on `http://localhost:3000`
- home, favorites, battles, and leaderboard render
- auth works against the local Keycloak realm
- database-backed pages work after migrations
