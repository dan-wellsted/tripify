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
