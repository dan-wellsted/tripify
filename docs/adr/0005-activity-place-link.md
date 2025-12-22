# 0005 — Activities Can Reference Places

## Status
Accepted

## Context
Activities often occur at a specific place (e.g., dinner reservation).
We want to preserve that relationship while keeping activities usable without
a place.

## Decision
Add an optional `placeId` foreign key on `Activity`. If the linked Place is
deleted, the activity remains and `placeId` is set to null.

## Consequences
- Activities can attach to Places without requiring them.
- Deleting a Place will not delete Activities; references are cleared.
