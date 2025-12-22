# 0002 — Test Strategy (Initial)

## Status
Accepted

## Context
We need a reliable testing approach for API and web as the app grows.

## Decision
- API: Vitest + Supertest integration tests against a real Postgres database.
- Web: Vitest + React Testing Library for component-level tests.

## Rationale
- Keeps tooling consistent across packages.
- Provides realistic API coverage with database constraints.
- Frontend tests stay lightweight and fast.

## Consequences
- Requires `DATABASE_URL` and migrations before API tests.
- May add a dedicated test database later for isolation.
