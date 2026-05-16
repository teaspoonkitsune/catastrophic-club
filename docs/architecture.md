# Architecture

## Overview

The project follows a layered structure close to Feature-Sliced Design. It is not enforced by tooling, but the import graph in the codebase is fairly consistent:

```text
app -> widgets -> features -> entities -> shared
app -> entities -> shared
widgets -> entities -> shared
```

In practice this means:

- pages and route handlers live in `src/app`
- page composition lives in `src/widgets`
- focused interactions live in `src/features`
- domain logic and reusable entity UI live in `src/entities`
- infrastructure and shared building blocks live in `src/shared`

## Layers

### `src/app`

This layer owns routing and server entry points.

What lives here:

- route pages such as `src/app/page.tsx`
- route handlers such as `src/app/api/favorites/route.ts`
- root layout in `src/app/layout.tsx`
- error boundaries
- global styles in `src/app/globals.css`

What should not drift here:

- reusable entity components
- client-side business logic that belongs in `features` or `widgets`
- direct database work inside client components

### `src/widgets`

Widgets assemble the UI for a route or a large section of a route.

Examples:

- `src/widgets/featured-cat`
- `src/widgets/favorites-browser`
- `src/widgets/battles-workspace`
- `src/widgets/battle-history`

Widgets usually combine:

- shared UI primitives
- entity cards
- focused features such as favorite toggling

### `src/features`

This layer is small right now. The confirmed feature is:

- `src/features/toggle-favorite`

The pattern is straightforward: one focused action, with its own hook and small UI wrapper.

### `src/entities`

Entities hold domain-specific building blocks.

Examples:

- `src/entities/cat`
- `src/entities/favorite-cat`
- `src/entities/battle-cat`

Typical contents:

- `model/types.ts`
- `api/repository.ts` for server-side database access
- `api/client.ts` for browser fetch wrappers
- entity UI such as cards

### `src/shared`

This layer contains the app-wide infrastructure:

- auth and session handling in `src/shared/auth`
- database connection and migrations in `src/shared/api`
- localization in `src/shared/i18n`
- shared UI primitives in `src/shared/ui`
- generic helpers in `src/shared/lib`

## Rendering Model

The application is not a pure SPA. It mixes server-rendered pages with client-side interactive widgets.

Server-side responsibilities:

- route pages load initial data
- the root layout loads the current locale and auth session
- route handlers perform auth checks and mutations
- repositories talk to PostgreSQL

Client-side responsibilities:

- login and registration forms
- favorites toggling
- image viewer state
- battle voting
- battle history polling

## Route Layout

Main routes:

| Route | Purpose | Source |
| --- | --- | --- |
| `/` | home page with cat of the day and fact | `src/app/page.tsx` |
| `/favorites` | authenticated favorites browser | `src/app/favorites/page.tsx` |
| `/battles` | battle arena and history | `src/app/battles/page.tsx` |
| `/leaderboard` | ranked battle results | `src/app/leaderboard/page.tsx` |

API routes:

| Route | Purpose | Source |
| --- | --- | --- |
| `/api/auth/login` | password login | `src/app/api/auth/login/route.ts` |
| `/api/auth/register` | registration and auto-login | `src/app/api/auth/register/route.ts` |
| `/api/auth/logout` | logout | `src/app/api/auth/logout/route.ts` |
| `/api/auth/callback` | OAuth callback | `src/app/api/auth/callback/route.ts` |
| `/api/favorites` | favorites CRUD | `src/app/api/favorites/route.ts` |
| `/api/battles` | fetch pair and submit vote | `src/app/api/battles/route.ts` |
| `/api/battles/history` | paginated battle history | `src/app/api/battles/history/route.ts` |
| `/api/cat-image` | fetch a fresh cat image | `src/app/api/cat-image/route.ts` |
| `/api/health` | env and DB health check | `src/app/api/health/route.ts` |

Confirmed routing details:

- there are no dynamic route segments
- `/leaderboard` reads `offset` from `searchParams`
- `/api/battles/history` reads `scope`, `offset`, and `limit`
- `/favorites`, `/battles`, and `/leaderboard` are `force-dynamic`

## Layout Composition

The root layout in `src/app/layout.tsx` builds the common shell:

- locale and translated messages are loaded first
- the auth session is resolved in parallel
- the app is wrapped in `I18nProvider`
- header and footer are rendered around the page body

The visible page frame is split between:

- `SiteLayoutFrame` for the global frame and page tone
- `SitePageGrid` for the main column and sidebar
- `AuthSidebar` as the desktop auth block

## State Management

There is no global state library in the repository.

The app mostly relies on:

- local `useState`
- i18n context for locale/messages
- a few module-level caches

Confirmed caches and local persistence:

- favorite state cache in `src/entities/favorite-cat/api/client.ts`
- auth rate-limit buckets in `src/shared/lib/rate-limit.ts`

This keeps the app simple, but it also means there is no shared, durable client state model.

## Data Flow by Feature

### Home Page

`src/app/page.tsx` fetches the cat of the day and a random fact on the server. The cat of the day is stored in `cat_of_the_day`, is keyed by UTC date, and tries to avoid reusing cats across days. `FeaturedCatWidget` then handles optional random photo refreshes on the client without changing the stored daily cat.

### Favorites

`src/app/favorites/page.tsx` checks the auth session first. If the user is signed in, it loads favorites from the repository and passes them to `FavoritesBrowser`. From there, add/remove actions go through `/api/favorites`.

### Battles

`src/app/battles/page.tsx` loads the current pair and the initial history on the server. The battle pair is sourced from random Cataas responses and then synchronized into `battle_cats`; existing rows keep their stored score and metadata, while missing rows are inserted with default values. The client widget submits votes to `/api/battles`, updates the pair, and keeps the recent history view warm by polling `/api/battles/history`.

### Leaderboard

`src/app/leaderboard/page.tsx` parses `offset`, loads one page of ranked cats from the repository, and renders navigation through pager controls.

## Forms and Interaction Patterns

The codebase uses a direct, local pattern for forms:

- controlled inputs with `useState`
- inline validation inside the component
- final validation in the route handler
- direct `fetch()` calls on submit

This is visible in both auth UIs:

- `src/widgets/auth-sidebar/ui/auth-sidebar.tsx`
- `src/widgets/site-header/ui/mobile-auth-panel.tsx`

No form library or schema validation library was confirmed by code.

## Styling

Styling is based on:

- CSS Modules for component-level styles
- `src/app/globals.css` for shared variables and global rules
- reusable visual primitives in `src/shared/ui/page-surface`

No Tailwind, styled-components, SCSS framework, or component library was confirmed.

## Weak Spots and Inconsistencies

The architecture is coherent, but a few rough edges are visible:

- login and registration logic are duplicated between mobile and desktop UI
- auth includes both password grant and OAuth callback support, but the visible flow is centered on direct credential submission
- repositories can trigger migrations during request handling
- in-memory caches and rate limiting are fine for local development, but not ideal for multi-instance deployments
- no automated test suite was confirmed
