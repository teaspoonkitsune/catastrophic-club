## Local Keycloak

This document describes the local-only Keycloak setup used during development.

Canonical local origins:
- app: `http://localhost:3000`
- Keycloak: `http://localhost:8080`

Keep the auth flow consistent. Do not mix `localhost`, `127.0.0.1`, LAN IPs, or different ports in the same local session unless you intentionally reconfigure the client.

## Included Local Configuration

The repository already contains:
- realm: `catastrophic-club`
- client: `catastrophic-club-web`
- enabled self-registration
- enabled direct access grants for inline login

Client compatibility settings kept for local development:
- PKCE: `S256`
- redirect URI: `http://localhost:3000/api/auth/callback`
- post logout redirect: `http://localhost:3000/*`
- root/base URL: `http://localhost:3000`

Files:
- compose: [infra/keycloak/podman-compose.yml](../infra/keycloak/podman-compose.yml)
- realm import: [infra/keycloak/realm-import/catastrophic-club-realm.json](../infra/keycloak/realm-import/catastrophic-club-realm.json)
- container env example: [infra/keycloak/.env.example](../infra/keycloak/.env.example)
- app env example: [.env.example](../.env.example)

## Start With Podman Compose

```sh
cd infra/keycloak
cp .env.example .env
podman compose up -d
```

## Start Without Compose

```sh
cd infra/keycloak
podman volume create keycloak-data
podman run -d \
  --name catastrophic-club-keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -v "$(pwd)/realm-import:/opt/keycloak/data/import:Z" \
  -v keycloak-data:/opt/keycloak/data:Z \
  quay.io/keycloak/keycloak:26.5.5 \
  start-dev --import-realm --hostname=http://localhost:8080
```

Admin console:

```text
http://localhost:8080/admin/
```

Default local admin credentials:
- username: `admin`
- password: `admin`

These values are for local development only.

## App Environment

Create `.env` in the project root from [.env.example](../.env.example).

Minimum local auth-related values:

```env
AUTH_SECRET=replace-with-a-long-random-string
AUTH_SESSION_TTL_SECONDS=604800
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=set-this-to-the-client-secret-from-your-local-keycloak
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
# Optional defaults:
# KEYCLOAK_SCOPE=openid profile email
# KEYCLOAK_ADMIN_REALM=master
# KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
```

After the realm is imported, open the local Keycloak admin UI and verify the client secret for `catastrophic-club-web`. Keep that value in your local `.env`; do not commit real secrets.

Replace the admin credentials and client secret when using any non-local environment.

## Verification

1. Open the app at `http://localhost:3000`.
2. Log in through the inline login form or open registration.
3. Verify that `catastrophic_club_session` appears on `localhost:3000`.
4. Confirm that the header and account panel show the logged-in user.

## Reset The Local Realm

```sh
cd infra/keycloak
podman compose down -v
podman compose up -d
```

This removes the `keycloak-data` volume and reimports the bundled realm.
