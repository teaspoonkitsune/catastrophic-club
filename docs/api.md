# API and Data Fetching

## Overview

This project does not have a separate backend repository. Server behavior lives inside the Next.js app through route handlers in `src/app/api`, database repositories in `src/entities/*/api/repository.ts`, and shared auth/database helpers in `src/shared`.

On the client side, browser code talks to those routes through small wrapper modules in `src/entities/*/api/client.ts`.

## API Surface

### Auth

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/auth/login` | `GET`, `POST` | login with username and password |
| `/api/auth/register` | `GET`, `POST` | create a Keycloak user and sign in |
| `/api/auth/logout` | `GET`, `POST` | clear auth cookies |
| `/api/auth/callback` | `GET` | finish OAuth code flow |

### Application Data

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/favorites` | `GET`, `POST`, `DELETE` | manage saved cats |
| `/api/battles` | `GET`, `POST` | fetch a pair and submit battle results |
| `/api/battles/history` | `GET` | fetch paginated battle history |
| `/api/cat-image` | `GET` | fetch a new random cat image for optional refreshes |
| `/api/health` | `GET` | check env and database readiness |

## How Server Data Access Is Structured

The split is simple:

- route handlers validate input and build HTTP responses
- repositories talk to PostgreSQL
- shared auth helpers manage cookies, Keycloak, and user sync

Confirmed repositories:

- `src/entities/favorite-cat/api/repository.ts`
- `src/entities/battle-cat/api/repository.ts`

Confirmed shared infrastructure:

- `src/shared/api/database.ts`
- `src/shared/api/migrator.ts`
- `src/shared/api/types.ts`
- `src/shared/auth/config.ts`
- `src/shared/auth/session.ts`
- `src/shared/auth/keycloak.ts`

## Client-Side Fetching

The browser side does not use React Query, SWR, or another dedicated data library.

Instead, it uses small wrappers such as:

- `src/entities/favorite-cat/api/client.ts`
- `src/entities/battle-cat/api/client.ts`

Those wrappers:

- call `fetch()` directly
- parse JSON locally
- throw `HttpCatError` when the response is not OK

## Auth Flow

### Session Model

Sessions are stored in encrypted cookies.

Confirmed cookie names:

- `catastrophic_club_session`
- `catastrophic_club_oauth_state`

Relevant files:

- `src/shared/auth/session.ts`
- `src/shared/auth/crypto.ts`

### Keycloak Usage

Keycloak is used in three different ways:

1. password grant for the visible login flow
2. admin API calls for registration
3. OAuth callback handling in `/api/auth/callback`

This is important when debugging auth changes: the visible UI may be using one path while another helper still exists and still needs to stay valid.

Not confirmed by code:

- a visible UI entry point that initiates the OAuth redirect flow

## Route Notes

### `/api/auth/login`

Expected payload:

```json
{
  "username": "alice",
  "password": "secret"
}
```

Behavior:

- validates presence of both fields
- rate-limits by client IP
- writes the encrypted session cookie on success

### `/api/auth/register`

Expected payload:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Behavior:

- validates email and password length
- creates the user through Keycloak admin endpoints
- immediately performs login after successful registration

### `/api/favorites`

Behavior:

- requires an authenticated session
- `GET` returns all favorites, or `isFavorite` for a specific `id`
- `POST` adds a favorite
- `DELETE` removes a favorite

### `/api/battles`

Behavior:

- `GET` fetches random cats from Cataas, ensures matching `battle_cats` rows exist, and returns the saved records
- `POST` requires auth and records a vote
- daily battle votes are capped
- success returns a refreshed random pair and a history entry

### `/api/battles/history`

Supported query params:

- `scope=global|mine`
- `offset`
- `limit`

The route caps the maximum page size at `10`.

### `/api/health`

The health check verifies:

- auth environment variables
- auth rate-limit config parsing
- database connectivity

## Error Handling

Server routes often return a structured `HttpCatErrorPayload`. The browser wrappers parse that payload and throw `HttpCatError`, which widgets convert into UI states.

This is why many screens can show both an error message and an `http.cat` illustration without duplicating the mapping logic.

## Caching and Polling

Confirmed behavior:

- most API fetches use `cache: 'no-store'`
- battle history polls every `15` seconds on the first global page
- favorite status uses a small module-level browser cache
- the home-page cat of the day is stored in PostgreSQL by UTC date

There is no confirmed shared query cache, retry layer, or refresh-token mechanism.

## Environment Variables Used Here

| Variable | Used In |
| --- | --- |
| `DATABASE_URL` | `src/shared/api/database.ts` |
| `DATABASE_SSL` | `src/shared/api/database.ts` |
| `AUTO_RUN_MIGRATIONS` | `src/shared/api/migrator.ts` |
| `AUTH_SECRET` | `src/shared/auth/config.ts`, `src/shared/auth/session.ts` |
| `AUTH_SESSION_TTL_SECONDS` | auth config, Keycloak helpers, callback route |
| `KEYCLOAK_BASE_URL` | auth config and Keycloak helpers |
| `KEYCLOAK_REALM` | auth config and Keycloak helpers |
| `KEYCLOAK_CLIENT_ID` | auth config and Keycloak helpers |
| `KEYCLOAK_CLIENT_SECRET` | auth config, Keycloak helpers, callback route |
| `KEYCLOAK_SCOPE` | auth config |
| `KEYCLOAK_ADMIN_REALM` | auth config |
| `KEYCLOAK_ADMIN_CLIENT_ID` | auth config |
| `KEYCLOAK_ADMIN_USERNAME` | auth config and Keycloak helpers |
| `KEYCLOAK_ADMIN_PASSWORD` | auth config and Keycloak helpers |
| `AUTH_RATE_LIMIT_MAX_ATTEMPTS` | auth config, auth routes, health route |
| `AUTH_RATE_LIMIT_WINDOW_SECONDS` | auth config, auth routes, health route |

## Things to Be Careful With

- registration depends on both app client credentials and admin credentials
- repositories can run migrations during normal requests
- rate limiting is in-memory, so it is not shared between instances
- auth code spans route handlers, cookie helpers, Keycloak helpers, and both auth UIs
