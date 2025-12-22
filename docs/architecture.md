## Architecture overview

### API
- Express + Prisma (ESM).
- Modules live in `apps/api/src/modules` with route files per domain.
- Shared request/response contracts use Zod schemas from `packages/shared`.
- API base path is proxied via `/api` in the web dev server.

### Web
- React + Vite.
- Feature pages live in `apps/web/src/features`.
- API client in `apps/web/src/api` uses `/api` base path by default.

### Data
- Prisma schema and migrations live in `prisma/`.
- Trips have a single itinerary; itinerary owns ordered TripDays.
- TripDay attachments use join tables with `position`.
