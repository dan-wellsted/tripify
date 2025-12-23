# Testing

## Strategy
- API tests are integration-first and hit a real Postgres database.
- Web tests are component-level (Vitest + Testing Library).
- End-to-end is deferred until core flows stabilize.

## API
- Requires a running Postgres and `DATABASE_URL` set (see `prisma/.env.example`).
- Use `DATABASE_URL_TEST` for integration tests.
- Run migrations before tests: `pnpm --filter api prisma migrate dev`.
- Run tests: `pnpm --filter api test`.
- `pnpm test` runs all workspace tests; `pnpm test:ci` forces CI mode.
- Use `pnpm test:db` to reset the test database, then `pnpm test:api`.
- Tests will fail fast in CI or when `TEST_DB_REQUIRED=true` if the DB is unreachable.

## Web
- Run tests: `pnpm --filter web test`.

## CI placeholder
- `scripts/ci-test.sh` runs the test suite with `CI=true`.
