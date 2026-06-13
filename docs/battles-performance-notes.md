# Battles Performance Notes

The `battles` area is already in acceptable shape for normal use.

Current behavior:

- the page server-renders the initial pair
- private history loads only when needed
- history refresh is throttled
- history pagination uses cursors instead of offset-only paging

What may still matter later:

- multiple open tabs can still duplicate polling work
- battle history depends on the expected database indexes staying in place
- migration checks still exist on some request paths

This is not a release blocker. It is follow-up optimization work only if usage grows.
