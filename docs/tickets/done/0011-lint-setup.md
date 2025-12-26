# 0011 — Lint Setup

## Goal
Add ESLint setup across the workspace.

## Scope
- Configure ESLint for API, web, and shared packages.
- Wire `pnpm lint` to run real checks.

## Acceptance criteria
- `pnpm lint` runs and reports issues.
- No breaking rule noise on existing code.
