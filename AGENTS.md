# AGENTS.md

## Project
Trip / experience planning web app (mobile later).

## Stack
- Node.js + TypeScript (ESM)
- Prisma + Postgres
- React + Vite
- pnpm workspace

## Core rules
- Domain-first: trips, itineraries, days, places, activities
- Shared Zod schemas live in `packages/shared`
- API modules live in `apps/api/src/modules`
- Frontend features live in `apps/web/src/features`
- No breaking API changes without updating shared schemas

## Data rules
- Trips belong to users (and later groups)
- Itinerary ordering must be deterministic and stable
- Dates are stored in UTC; display in user timezone

## Definition of done
- Tests updated
- Typecheck passes
- Lint passes

## Workflow
- Create a new git branch at the start of each ticket.
- Push changes at the end of each ticket.
- Use commit messages with a prefix:
  - `feat:` new user-facing behavior
  - `fix:` bug fix
  - `docs:` documentation only
  - `chore:` tooling, config, or cleanup
  - `refactor:` code changes without behavior change
  - `test:` tests only
  - `style:` formatting/UI polish (no logic)
- Add ADRs for noteworthy architecture or data model decisions.
- Keep docs up to date as changes land (README + domain + testing + ADRs).

## Testing notes
- API tests require Postgres and `DATABASE_URL` set (see `prisma/.env.example`).
- Run API migrations before tests: `pnpm --filter api prisma migrate dev`.
