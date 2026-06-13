# Known Issues

## External Dependencies

- Cat images come from `cataas.com`.
- Cat facts come from `catfact.ninja`.
- Error illustrations come from `http.cat`.

If those services are slow or unavailable, the app falls back where it can, but it cannot be fully independent from them yet.

## Runtime Limits

- auth rate limiting is process-local
- favorites cache is browser-local
- registration needs Keycloak admin credentials
- some repository paths can still trigger migration checks during requests

These are acceptable for a small self-hosted project, but they are not ideal for a larger multi-instance deployment.

## Deploy Scope

The production bootstrap helps with:

- env generation
- stack startup
- Keycloak client wiring
- health checks

It does not handle:

- DNS
- reverse proxy
- TLS
- public infrastructure layout

## Testing Scope

The repository includes:

- node tests
- lint
- typecheck
- production build validation
- local stack smoke flow

There is still no browser e2e layer.
