# Known Limitations

This document lists the current constraints that should be visible to GitHub readers and deployers.

## Runtime and Infrastructure

- Auth rate limiting is process-local and stored in memory, so limits are not shared between multiple app instances.
- The favorite-state cache lives in the browser runtime and can become briefly stale across tabs or sessions.
- The home page still depends on external cat and fact services. It now falls back gracefully, but freshness and variety still depend on those providers.
- Registration depends on working Keycloak admin credentials in addition to normal client credentials.
- Production bootstrap is much smoother now, but it still assumes working DNS, reverse proxy, and TLS around the generated app and auth hostnames.

## Product and Codebase

- The test layer is still narrow. CI now runs `test`, `lint`, `typecheck`, and `build`, but coverage is focused on stable helpers and configuration logic rather than end-to-end browser flows.
- Repositories can still call `ensureDatabaseMigrated()`, so DB migration problems may surface on normal request paths if configuration drifts.
- `npm run seed:battle-cats` depends on `cataas.com` availability and network access, so demo seeding is not fully offline or deterministic.
