# Development Guide

## Overview

This guide is meant for developers joining the project. It explains how to run the app, where to look when changing a feature, and what parts of the codebase deserve extra caution.

## Local Workflow

### Installation

```bash
npm install
cp .env.example .env
```

### Infrastructure You Need

The application depends on:

- PostgreSQL
- Keycloak

The repository includes a local Keycloak setup under `infra/keycloak`, but it does not include a local PostgreSQL compose file.

### Start the App

Before the first run, apply migrations:

```bash
npm run db:migrate
```

Then start development mode:

```bash
npm run dev
```

### Verify Changes

Use these checks after code changes:

```bash
npm run lint
npm run build
```

No test script is currently confirmed by code.

## Where to Start When Changing Something

### Page-Level Changes

Begin at the route file:

- `src/app/page.tsx`
- `src/app/favorites/page.tsx`
- `src/app/battles/page.tsx`
- `src/app/leaderboard/page.tsx`

Then follow imports into:

- the corresponding widget in `src/widgets`
- shared layout pieces in `src/widgets/site-layout`
- auth/session helpers if the page depends on the signed-in user

### API Changes

Begin at the route handler in `src/app/api`.

Then inspect:

- the repository in `src/entities/*/api/repository.ts`
- the browser wrapper in `src/entities/*/api/client.ts`
- shared DB helpers in `src/shared/api`

### Auth Changes

Auth touches more files than it first appears to. Check these together:

- `src/shared/auth/config.ts`
- `src/shared/auth/session.ts`
- `src/shared/auth/keycloak.ts`
- `src/shared/auth/users.ts`
- `src/app/api/auth/*/route.ts`
- `src/widgets/auth-sidebar/ui/auth-sidebar.tsx`
- `src/widgets/site-header/ui/mobile-auth-panel.tsx`

### UI and Styling Changes

Start with:

- `src/app/globals.css`
- `src/shared/ui/page-surface`
- the local `*.module.css`
- the route-facing widget that owns the layout

## Conventions Visible in the Code

### Imports

The codebase uses the path alias from `tsconfig.json`:

```ts
@/* -> ./src/*
```

That alias is used consistently and should stay the default for application imports.

### Server and Client Responsibilities

The general pattern is:

- pages fetch initial data on the server
- client widgets own interactive state and mutations
- repositories talk directly to PostgreSQL
- route handlers expose browser-facing mutations and authenticated reads

### Forms

Forms are handled in a simple local style:

- each input is controlled
- validation happens inside the component first
- route handlers validate again before writing data
- submit logic uses `fetch()` directly

### Error Handling

Route handlers often return structured errors through `createHttpCatErrorPayload()`. Browser code turns failed responses into `HttpCatError` and renders either a dedicated error state or plain text.

## Safe Change Checklist

When making a change, this sequence works well in the current codebase:

1. find the route or widget that owns the visible behavior
2. trace the related repository, fetch wrapper, and shared helpers
3. check the types that cross the server/client boundary
4. keep the patch inside the smallest existing module set
5. run `npm run lint` and `npm run build`
6. manually verify the route if the change touches auth, DB access, or interactive UI

## Known Sources of Friction

- auth UI is duplicated between mobile and desktop
- favorite state has a small client-side cache that can become stale
- auth rate limiting is process-local
- repositories may run migrations as part of normal requests
- there is no automated test safety net

## When Documentation Should Be Updated

Documentation should be updated in the same patch if a change affects:

- route structure
- environment variables
- local setup
- API contracts
- auth flow
- deployment process
- project structure or ownership boundaries
