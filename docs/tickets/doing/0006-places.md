# 0006 — Places (basic CRUD)

## Goal
Add place records (points of interest) and wire them into itineraries.

## Scope
- Prisma model: Place.
- Shared Zod schemas.
- API endpoints for create/list/get/update/delete (auth required).
- Wire places to itinerary days.
- UI: places list/search with inline create, ready to act as a picker for itinerary days (Option C).

## Notes
- Place represents a point of interest (POI), not a city. Cities will be modeled separately.

## Acceptance criteria
- Places CRUD works for the current user.
- Places can be attached to itinerary days.
- Tests for create/list/get/update/delete and day attachment.
