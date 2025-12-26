# 0003 — Trips CRUD (create/list/get/update/delete)

## Goal
Implement the first real domain feature: trips CRUD with ownership.
A user can create trips and manage only their own trips.

## Constraints
- All endpoints require authentication.
- Validate all inputs with Zod schemas in `packages/shared`.
- Keep API responses stable and typed.
- No collaboration/sharing yet (single-owner only).
- Dates stored as ISO strings in API; DB stored in UTC timestamps.

## Data model (Prisma)
Add (or extend) schema with:
- `Trip`:
  - id
  - ownerId (FK -> User)
  - title
  - description (optional)
  - startDate (optional)
  - endDate (optional)
  - createdAt, updatedAt
- Index: `(ownerId, createdAt)` for listing

## API endpoints
- `POST /trips`
  - body: `{ title, description?, startDate?, endDate? }`
  - returns created trip
- `GET /trips`
  - returns trips for current user (latest first)
- `GET /trips/:tripId`
  - returns trip if owned by current user
- `PATCH /trips/:tripId`
  - body: partial updates for fields above
- `DELETE /trips/:tripId`
  - deletes trip if owned by current user

## Acceptance criteria
- Only owners can access/modify their trips (403 or 404; choose and be consistent)
- Request validation in shared schemas:
  - `packages/shared/src/schemas/trip.ts`
- Integration tests (API + DB) for:
  - create trip
  - list trips returns only owner’s trips
  - cannot access another user’s trip
  - update trip
  - delete trip
- Web app: minimal UI to prove integration (can be very basic)
  - list trips
  - create trip
  - click into a trip page (even if empty)

## Verification
From repo root:
- `pnpm --filter api prisma migrate dev`
- `pnpm test`
- Manual:
  - login
  - create trip
  - list shows it
  - open trip
  - update title
  - delete

## Notes
Do not introduce itinerary/day models yet. This ticket is strictly trips CRUD.
