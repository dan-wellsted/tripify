# 0001 — Repo scaffold (monorepo + basic tooling)

## Goal
Create a pnpm-workspace monorepo skeleton for:
- `apps/api` (Node.js + TS ESM)
- `apps/web` (React + Vite + TS)
- `packages/shared` (shared Zod schemas/types)

This ticket is structure + minimal runnable setup, not full features.

## Constraints
- TypeScript `strict: true`
- Backend uses ES modules (ESM)
- Prefer minimal dependencies; do not add auth, DB schema, or UI frameworks beyond Vite/React
- Root-level scripts should delegate to workspace packages

## Scope
### Must create
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- Root `package.json` with scripts:
  - `dev` (optional but nice)
  - `lint`
  - `typecheck`
  - `test` (may be stubbed initially if no tests yet)

### apps/api
- Minimal server that can start on a port:
  - `src/index.ts` starts server
  - `src/app.ts` exports configured app instance
  - `src/health.ts` basic health route (no DB yet)
- Choose one web framework and be consistent (Express or Fastify). Keep it minimal.

### apps/web
- Vite + React + TS basic app that runs and loads.

### packages/shared
- Basic TS package exporting something from `src/index.ts` (e.g., a `hello` constant) to verify workspace wiring.

## Acceptance criteria
- `pnpm install` works at repo root
- `pnpm --filter api dev` starts API server
- `pnpm --filter web dev` starts Vite dev server
- `pnpm --filter shared build` (or `typecheck`) works (define whichever makes sense)
- Root scripts run without errors:
  - `pnpm typecheck`
  - `pnpm lint` (can be added now or stubbed if you choose to add ESLint in this ticket)

## Verification
From repo root:
- `pnpm install`
- `pnpm --filter api dev`
- `pnpm --filter web dev`
- `pnpm typecheck`
- `pnpm lint` (if implemented)

## Notes
Keep diffs small and focused. No Prisma yet. No auth yet.

## Proposal (Updated)
- Root: add workspace scripts (`dev`, `lint`, `typecheck`, `test`) and base TS config, ensure workspace globs include `apps/*` and `packages/*`.
- `apps/api`: use Express; create minimal `src/index.ts` (server bootstrap), `src/app.ts` (app instance), `src/health.ts` (health handler), and `src/routes.ts` (router wiring). Use `node --watch --import tsx/esm` for dev to avoid tsx IPC in restricted environments.
- `packages/shared`: export a simple value from `src/index.ts` to validate workspace wiring.
- `apps/web`: Vite + React + TS app and add Chakra UI (install deps, wire provider/theme in `src/main.tsx`, simple Chakra-based `src/app.tsx`).
- `apps/web` dev script uses `vite --host 127.0.0.1 --port 5174` to avoid sandbox bind restrictions on default IPv6 localhost.
- Lint/typecheck: minimal config or stubs so `pnpm typecheck` passes at root.
