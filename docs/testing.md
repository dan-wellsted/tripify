# Testing

## Strategy
- API tests are integration-first and hit a real Postgres database.
- Web tests are component-level (Vitest + Testing Library).
- End-to-end is deferred until core flows stabilize.

## API
- Requires a running Postgres and `DATABASE_URL` set (see `prisma/.env.example`).
- Run migrations before tests: `pnpm --filter api prisma migrate dev`.
- Run tests: `pnpm --filter api test`.
- `pnpm test` runs all workspace tests; `pnpm test:ci` forces CI mode.
- We intend to make DB-backed tests fail fast when DB is unavailable (tracked in 0013).

## Web
- Run tests: `pnpm --filter web test`.

## CI placeholder
- `scripts/ci-test.sh` runs the test suite with `CI=true`.
