# Local Keycloak

## Overview

The repository includes a minimal local Keycloak setup under `infra/keycloak`. The confirmed local entry point is `infra/keycloak/podman-compose.yml`.

## Files

| Path | Purpose |
| --- | --- |
| `infra/keycloak/podman-compose.yml` | local Keycloak container definition |
| `infra/keycloak/.env.example` | bootstrap admin credentials |
| `infra/keycloak/realm-import/catastrophic-club-realm.json` | imported realm configuration |

No committed local `docker-compose.yml` for Keycloak is present in the current tree.

## Default Local Settings

From `infra/keycloak/.env.example`:

```env
KC_BOOTSTRAP_ADMIN_USERNAME=admin
KC_BOOTSTRAP_ADMIN_PASSWORD=admin
```

From `infra/keycloak/podman-compose.yml`:

- image: `quay.io/keycloak/keycloak:26.5.5`
- command: `start-dev --import-realm --hostname=http://localhost:8080`
- port mapping: `8080:8080`

## App Settings That Should Match

Your application `.env` should point to that Keycloak instance:

```env
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=change-me-for-local-dev
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

## Running It

If you use Podman Compose, the expected command is:

```bash
podman compose -f infra/keycloak/podman-compose.yml up -d
```

There is no npm script for this in `package.json`.

## HTTP on Localhost

For the imported application realm, HTTP is already allowed in `infra/keycloak/realm-import/catastrophic-club-realm.json`:

- `"sslRequired": "NONE"`
- client URLs point to `http://localhost:3000`

One extra local detail matters: the built-in `master` realm still defaults to stricter SSL requirements, and that can block admin login over plain `http://localhost:8080`.

To allow local HTTP access for the admin realm, run this once against the local container:

```bash
podman exec catastrophic-club-keycloak /bin/sh -lc '/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin >/tmp/kcadm-login.log && /opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE'
```

You can verify it with:

```bash
podman exec catastrophic-club-keycloak /bin/sh -lc '/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin >/tmp/kcadm-login.log && /opt/keycloak/bin/kcadm.sh get realms/master --fields realm,sslRequired'
```

Expected result:

```json
{
  "realm" : "master",
  "sslRequired" : "none"
}
```

This is a local-development convenience only. Do not mirror it into production.

## How the App Uses Keycloak

Keycloak is involved in:

- login in `src/app/api/auth/login/route.ts`
- registration in `src/app/api/auth/register/route.ts`
- OAuth callback handling in `src/app/api/auth/callback/route.ts`
- admin-side user creation and finalization in `src/shared/auth/keycloak.ts`

## Suggested Verification

Once Keycloak is up:

1. start the app with `npm run dev`
2. open `/favorites`
3. register a user
4. log in with that user
5. log out

## What to Keep in Mind

- registration needs working admin credentials, not just client credentials
- the visible UI uses direct login and registration forms
- OAuth callback support exists in code, but a visible OAuth-start flow was not confirmed
