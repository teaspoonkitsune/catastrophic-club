# Architecture

## Overview

The project is a layered `Next.js` app:

```text
src/app        routes, layouts, API handlers
src/widgets    page-level UI composition
src/features   focused user actions
src/entities   domain models, API wrappers, entity UI
src/shared     auth, db, i18n, shared UI, utilities
```

Dependency direction:

```text
app -> widgets -> features -> entities -> shared
app -> entities -> shared
widgets -> entities -> shared
```

## Main Routes

- `/` - cat of the day and cat fact
- `/favorites` - saved cats for the signed-in user
- `/battles` - cat voting and recent battle history
- `/leaderboard` - ranked battle cats

## Main Backend Pieces

- `src/app/api/auth/*` - login, register, logout
- `src/app/api/favorites` - favorites CRUD
- `src/app/api/battles` - fetch pair and submit vote
- `src/app/api/battles/history` - battle history feed
- `src/app/api/health` - health check

## Data and Auth

- `PostgreSQL` stores app data
- `Kysely` handles database access
- `Keycloak` handles accounts and credentials
- app sessions are managed in `src/shared/auth`

The site keeps the login and registration UI inside the app instead of redirecting the user to a separate Keycloak page.

## Frontend Shape

- server components load initial page data
- client components handle interactions
- styling uses CSS Modules plus `src/app/globals.css`
- translations live in `src/shared/i18n`

## Useful Entry Points

- `src/app/layout.tsx` - root shell and providers
- `src/app/page.tsx` - home page
- `src/app/battles/page.tsx` - battles page
- `src/widgets/featured-cat` - home hero block
- `src/widgets/favorites-browser` - favorites UI
- `src/widgets/battle-history` - recent battles UI
- `src/shared/api` - database and migrations
- `src/shared/auth` - auth/session/config helpers
