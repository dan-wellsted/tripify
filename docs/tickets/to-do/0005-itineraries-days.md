# 0005 — Itineraries + Days (basic models)

## Goal
Introduce itinerary and day models so trips can hold ordered days.

## Scope
- Add Prisma models: Itinerary, TripDay.
- Define shared Zod schemas for itinerary/day.
- Add minimal API endpoints for listing/creating days within a trip.

## Constraints
- Ordering must be deterministic and stable.
- Dates stored in UTC; display handled client-side.

## Acceptance criteria
- Can create days for a trip and list them in order.
- Shared schemas in `packages/shared`.
- Basic API tests for create/list.
