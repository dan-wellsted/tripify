# Testing

## Strategy
- API tests are integration-first and hit a real Postgres database.
- Web tests are component-level (Vitest + Testing Library).
- End-to-end is deferred until core flows stabilize.

## API
- Requires a running Postgres and `DATABASE_URL_TEST` set (see `prisma/.env.example`).
- API tests read `DATABASE_URL_TEST` and set `DATABASE_URL` automatically during Vitest runs.
- Run migrations for tests: `pnpm test:db` (resets without seeding).
- Run tests: `pnpm --filter api test` or `pnpm test:api`.
- `pnpm test` runs all workspace tests; `pnpm test:ci` forces CI mode.
- Tests will fail fast in CI or when `TEST_DB_REQUIRED=true` if the DB is unreachable.

## Web
- Run tests: `pnpm --filter web test`.

## CI placeholder
- `scripts/ci-test.sh` runs the test suite with `CI=true`.
