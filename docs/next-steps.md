# Next Steps

Nothing here blocks normal use. These are simply the most reasonable follow-ups.

## High Value

- add lightweight browser e2e coverage for the main auth and navigation flows
- tighten production env validation before deploy starts
- keep improving runtime logging and operational visibility

## If Usage Grows

- move rate limiting and similar state out of process memory
- remove migration checks from request paths
- revisit `battles` polling and history load only if real traffic makes it necessary
