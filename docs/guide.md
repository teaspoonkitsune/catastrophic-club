# Guide

This is the practical setup guide for `CATastrophic Club`.

## 1. Requirements

You need:

- `Node.js` compatible with `Next.js 16`
- `npm`
- a container runtime with Compose support

`Docker Compose` is the default path in this repository. On systems like `NixOS`, a compatible `Podman` setup also works if Compose support is available.

## 2. Download

```bash
git clone https://github.com/teaspoonkitsune/catastrophic-club.git
cd catastrophic-club
npm install
```

## 3. Fast Local Setup

The shortest path is:

```bash
./scripts/bootstrap-local.sh
npm run dev
```

Then open:

- `http://localhost:3000`
- `http://localhost:8080`

The bootstrap script:

- creates `.env` if needed
- generates auth secrets
- starts PostgreSQL and Keycloak
- configures the Keycloak client
- runs database migrations

## 4. Manual Local Setup

If you want to do it step by step, use the local compose file and `.env.example`.

Start infrastructure:

```bash
docker compose -f docker-compose.local.yml up -d
```

Run migrations:

```bash
npm run db:migrate
```

Start the app:

```bash
npm run dev
```

Important local env values:

```env
DATABASE_URL=postgres://catastrophic_club:catastrophic_club@127.0.0.1:5432/catastrophic_club
DATABASE_SSL=false
AUTH_SECRET=replace-with-a-long-random-string
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=catastrophic-club-local-dev-secret
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

## 5. Demo Data

If you want a fuller leaderboard and battles page locally:

```bash
npm run seed:battle-cats
```

This pulls cats from `cataas.com`, so it needs network access.

## 6. Checks

Use these before shipping changes:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run smoke
```

What they cover:

- `test` - node-level tests
- `lint` - ESLint
- `typecheck` - TypeScript validation
- `build` - production Next.js build
- `smoke` - local stack smoke flow with app, database, and auth

## 7. Production Deploy

Use the production bootstrap on the target server:

```bash
./scripts/bootstrap-prod.sh --app-domain example.com --keycloak-hostname auth.example.com
```

The production flow is built around these files:

- `docker-compose.prod.yml`
- `docker/production.env.example`
- `scripts/bootstrap-prod.sh`
- `scripts/deploy-prod.sh`
- `scripts/configure-keycloak.sh`
- `scripts/check-prod.sh`
- `scripts/logs-prod.sh`

What bootstrap does:

- prepares production env values
- generates secrets
- starts the stack
- configures the Keycloak client
- runs health checks

What it does not do:

- DNS
- reverse proxy
- TLS
- external hostname routing

Those parts must be configured separately.

## 8. Auth Model

Users do not get redirected to a Keycloak login page.

The visible auth flow stays inside the app UI, while Keycloak handles:

- user credentials
- sessions
- registration backend

Registration also needs working Keycloak admin credentials.

## 9. If Something Breaks

Start with:

```bash
npm run build
npm run smoke
```

Then verify:

- PostgreSQL is reachable
- Keycloak is reachable
- env values are present
- the Keycloak client secret matches the app env
