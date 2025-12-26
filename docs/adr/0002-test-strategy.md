# 0002 — Test Strategy (Initial)

## Status
Accepted

## Context
We need a reliable testing approach for API and web as the app grows.

## Decision
- API: Vitest + Supertest integration tests against a real Postgres test database.
- Web: Vitest + React Testing Library for component-level tests.

## Rationale
- Keeps tooling consistent across packages.
- Provides realistic API coverage with database constraints.
- Frontend tests stay lightweight and fast.

## Consequences
- Requires `DATABASE_URL_TEST` and migrations before API tests.
- Test database resets skip seeding to avoid cross-test interference.
