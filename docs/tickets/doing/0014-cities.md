# 0014 — Cities (trip day regions)

## Goal
Add cities as higher-level locations that can be assigned to trip days, separate from POI places.

## Scope
- Prisma model: City (name, optional country/region, optional lat/lng).
- Join model to attach cities to trip days (ordered).
- Shared Zod schemas.
- API endpoints to CRUD cities and attach/detach them from trip days.
- UI: basic city library + day-level city picker.

## Acceptance criteria
- Cities CRUD works for the current user.
- Trip days can have one or more cities in a stable order.
- Tests for city CRUD + day attachment.
