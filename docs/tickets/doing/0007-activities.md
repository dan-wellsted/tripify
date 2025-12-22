# 0007 — Activities (basic CRUD)

## Goal
Add activity records (e.g., tours, bookings, notes) and attach them to trip days.

## Scope
- Prisma model: Activity.
- Shared Zod schemas.
- API endpoints for create/list/get/update/delete (auth required).
- Wire activities to trip days (ordered).
- Activities can optionally reference a Place.

## Acceptance criteria
- Activities CRUD works for the current user.
- Trip days can include activities in a stable order.
- Tests for create/list/get/update/delete and day attachment.
