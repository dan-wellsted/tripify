# 0013 — Backend Testing Strategy (reliability)

## Goal
Decide and implement a stable backend testing approach for the API.

## Scope
- Evaluate current Vitest + Supertest setup for reliability.
- Optionally switch to a different runner or database strategy if needed.
- Define testing conventions and minimal coverage targets.
- Ensure tests fail fast when the database is unreachable (no silent skips), or provide a dedicated test database workflow.
- Document local setup for DB-backed tests (env vars, migrations, seed strategy).

## Acceptance criteria
- Tests run reliably via `pnpm --filter api test`.
- Documented approach in `docs/` (short note is fine).
- At least one representative test per core flow (auth + trips).

## Outcome
- Enforced single-threaded Vitest execution for API tests to avoid DB cross-test interference.
- API tests read `DATABASE_URL_TEST` from `prisma/.env` and use the test database by default.
- Test DB reset script skips seeding to keep fixtures clean.
- Added required time zone fields in tests where start/end times are set.
- Updated web auth tests and routing to keep login/register forms mounted during auth refresh.
