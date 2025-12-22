# 0004 — Global City Library

## Status
Accepted

## Context
Cities are shared concepts (e.g., Tokyo) that should not be duplicated per user.
We want a common library usable across all trips and users.

## Decision
Model `City` as a global table with no `ownerId`. Enforce uniqueness on
`(name, country)` to reduce duplicate entries.

## Consequences
- Cities can be reused across users.
- Future normalization (aliases, admin edits) can be added later.
