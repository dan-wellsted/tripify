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
- Create `prisma/.env` from `prisma/.env.example`
- `pnpm --filter api prisma migrate dev`
- `pnpm --filter api dev`
- `pnpm --filter web dev`
