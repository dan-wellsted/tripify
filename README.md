# Trip Planner

Trip / experience planning web application (mobile later).
Think Wanderlog-style planning: trips, itineraries, places, activities.

## Stack
- Backend: Node.js + TypeScript (ESM), Prisma, Postgres
- Frontend: React + Vite + TypeScript
- Package manager: pnpm workspace

## Repo structure
- apps/api — backend API
- apps/web — web frontend
- packages/shared — shared Zod schemas and types
- prisma — database schema and migrations
- docs — architecture, domain notes, tickets

## Domain concepts
- Trip
- TripDay (date-based, ordered)
- Place
- City
- Activity
- TripDayPlace (attach places to days)
- TripDayCity (attach cities to days)
- TripDayActivity (attach activities to days)

## Engineering principles
- Domain-first modules
- Shared API contracts via Zod
- API designed for future mobile clients
- Small, ticket-based changes

## Codex usage
- Read AGENTS.md before making changes
- Work from docs/tickets
- Keep diffs small
- Update tests and schemas when behavior changes

## Local dev checklist
- `pnpm install`
- Start Postgres locally and create the database referenced by `DATABASE_URL`
- Create `prisma/.env` from `prisma/.env.example`
- `pnpm --filter api prisma migrate dev`
- `pnpm dev` (or run `pnpm --filter api dev` and `pnpm --filter web dev` in separate terminals)
