# 0005 — Itineraries + Days (basic models)

## Goal
Introduce itinerary and day models so trips can hold ordered days.

## Scope
- Add Prisma models: Itinerary, TripDay.
- Define shared Zod schemas for itinerary/day.
- Add minimal API endpoints for listing/creating days within a trip.
- Auto-generate trip days from start/end dates on trip create/update.
- UI: dedicated itinerary view at `/trips/:tripId/itinerary` with a basic day list (no manual add flow yet).

## Constraints
- Ordering must be deterministic and stable.
- Dates stored in UTC; display handled client-side.

## Acceptance criteria
- Days are generated from trip start/end dates and listed in order.
- Manual day creation API remains available for future use.
- Shared schemas in `packages/shared`.
- Basic API tests for create/list.
