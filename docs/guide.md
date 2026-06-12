# Guide

This is the single setup and deployment guide for `CATastrophic Club`.

It covers:

- downloading the repository
- local development
- local infrastructure
- demo data
- verification
- production deployment
- server-side helper scripts
- Keycloak client bootstrap

For project shape and risks, see the companion files:

- [architecture.md](./architecture.md)
- [known-issues.md](./known-issues.md)

## 1. Requirements

You need:

- Node.js compatible with `Next.js 16`
- `npm`
- Docker with the Compose plugin for the repo-provided local and production stacks

The repository uses `npm` as the package manager and already includes `package-lock.json`.

## 2. Download and Install

Clone the repository and install dependencies:

```bash
git clone https://github.com/teaspoonkitsune/catastrophic-club.git
cd catastrophic-club
npm install
```

## 3. Recommended Bootstrap Paths

### Local one-script path

```bash
./scripts/bootstrap-local.sh
npm run dev
```

This script:

- generates `.env`
- generates `AUTH_SECRET`
- generates `KEYCLOAK_CLIENT_SECRET`
- starts PostgreSQL and Keycloak
- updates the Keycloak client to match the generated secret
- runs DB migrations

### Production-oriented one-script path

```bash
./scripts/bootstrap-prod.sh --app-domain example.com --keycloak-hostname auth.example.com
```

This script:

- creates a production `app.env`
- generates database and auth secrets
- runs the deploy flow
- configures the Keycloak client to match the generated production secret and app origin
- runs the production health check

## 4. Manual Local Development

### Environment

The committed `.env.example` matches the local Docker Compose baseline.

Core local values:

```env
DATABASE_URL=postgres://catastrophic_club:catastrophic_club@127.0.0.1:5432/catastrophic_club
DATABASE_SSL=false
AUTH_SECRET=replace-with-a-long-random-string
AUTH_SESSION_TTL_SECONDS=604800
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=catastrophic-club-local-dev-secret
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

Useful optional values:

```env
KEYCLOAK_SCOPE=openid profile email
KEYCLOAK_ADMIN_REALM=master
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
AUTO_RUN_MIGRATIONS=false
AUTH_RATE_LIMIT_MAX_ATTEMPTS=10
AUTH_RATE_LIMIT_WINDOW_SECONDS=60
```

### Local Infrastructure

Bring up PostgreSQL and Keycloak:

```bash
docker compose -f docker-compose.local.yml up -d
```

This starts:

- PostgreSQL on `127.0.0.1:5432`
- Keycloak on `127.0.0.1:8080`

### Migrations

Apply migrations before the first run:

```bash
npm run db:migrate
```

The repositories can still call `ensureDatabaseMigrated()` during request paths, but the intended workflow is explicit migrations first.

### Start the App

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:8080`

### Local Auth Notes

The visible auth flow is embedded directly in the app UI:

- users log in from the site itself
- users register from the site itself
- Keycloak still powers the credentials and user management behind the scenes

If the Keycloak admin console complains about HTTPS on localhost, the built-in `master` realm may still need a local-only override:

```bash
podman exec catastrophic-club-keycloak /bin/sh -lc '/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin >/tmp/kcadm-login.log && /opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE'
```

That override is for local development only.

## 5. Demo Data

If you want a fuller local battles and leaderboard experience, seed extra cats:

```bash
npm run seed:battle-cats
```

This script:

- fetches candidate cats from `cataas.com`
- skips IDs already known in `battle_cats`
- inserts up to roughly `400` new rows

Because it depends on an external service, it is not fully deterministic or offline-safe.

## 6. Verification

Static verification:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Manual smoke check:

1. open `/`
2. open `/favorites`
3. register a user
4. log in
5. log out
6. open `/battles`
7. open `/leaderboard`
8. check `/api/health`

## 7. Production Deployment

### Production Files

The repo contains:

- `Dockerfile`
- `docker-compose.prod.yml`
- `docker/production.env.example`
- `scripts/bootstrap-prod.sh`
- `scripts/deploy-prod.sh`
- `scripts/configure-keycloak.sh`
- `scripts/check-prod.sh`
- `scripts/logs-prod.sh`

### Production Environment

Use `docker/production.env.example` as the baseline and supply real values for:

```env
APP_DOMAIN=example.com
KEYCLOAK_HOSTNAME=auth.example.com
POSTGRES_SUPERUSER=postgres
POSTGRES_SUPERPASSWORD=change-me
APP_DB_NAME=catastrophic_club
APP_DB_USER=catastrophic_club
APP_DB_PASSWORD=change-me
KEYCLOAK_DB_NAME=keycloak
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=change-me
DATABASE_SSL=false
AUTO_RUN_MIGRATIONS=false
AUTH_SECRET=replace-with-a-long-random-string
AUTH_SESSION_TTL_SECONDS=604800
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=replace-with-a-production-secret
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=change-me
AUTH_RATE_LIMIT_MAX_ATTEMPTS=10
AUTH_RATE_LIMIT_WINDOW_SECONDS=60
```

### Important Production Limitation

The committed Keycloak realm import is intentionally local-oriented as a baseline import.

The repo now automates the app-side and client-side Keycloak bootstrap, but you still need to make sure your surrounding infrastructure is correct:

- DNS
- reverse proxy
- TLS
- reachable app and auth hostnames

### Server Layout

The scripts assume a layout like:

```text
/srv/catastrophic-club/
  app/   <- this repository
  env/
    app.env
```

### Deploy

From the repository root on the server:

```bash
./scripts/deploy-prod.sh
```

By default the script uses:

- `ENV_FILE=../env/app.env`
- `COMPOSE_FILE=./docker-compose.prod.yml`
- `HEALTH_URL=http://127.0.0.1:3000/api/health`

You can override them:

```bash
ENV_FILE=/path/to/app.env \
COMPOSE_FILE=/path/to/docker-compose.prod.yml \
HEALTH_URL=http://127.0.0.1:3000/api/health \
./scripts/deploy-prod.sh
```

The deploy script does this:

1. `git pull --ff-only`
2. build `app` and `migrate`
3. start PostgreSQL and Keycloak
4. run migrations
5. start the app
6. call the health endpoint

### Configure Keycloak Separately

If you need to re-run Keycloak client setup without regenerating env files:

Local:

```bash
./scripts/configure-keycloak.sh --local --env-file ./.env
```

Production:

```bash
ENV_FILE=/path/to/app.env ./scripts/configure-keycloak.sh --prod --env-file /path/to/app.env
```

### Check and Logs

Inspect the deployed stack:

```bash
./scripts/check-prod.sh
```

Tail logs for the main services:

```bash
./scripts/logs-prod.sh
```

Or target specific services:

```bash
./scripts/logs-prod.sh app
./scripts/logs-prod.sh keycloak postgres
```

## 8. Troubleshooting

### `DATABASE_URL is not set`

Check:

- `.env` locally
- `ENV_FILE` on the server

Relevant file:

- `src/shared/api/database.ts`

### Registration fails while the app itself starts

This usually means Keycloak admin credentials are wrong or incomplete.

Relevant file:

- `src/shared/auth/keycloak.ts`

### Requests fail because migrations are triggered during runtime

Keep `AUTO_RUN_MIGRATIONS=false` and run:

```bash
npm run db:migrate
```

### Home page content looks less fresh than expected

The home page depends on:

- `cataas.com`
- `catfact.ninja`

It now has a graceful fallback, but freshness still depends on those providers being available.
