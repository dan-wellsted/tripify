#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL_TEST:-}" ]]; then
  echo "DATABASE_URL_TEST is required." >&2
  exit 1
fi

export DATABASE_URL="$DATABASE_URL_TEST"

pnpm --filter @tripplanner/api prisma migrate reset --force --skip-generate
pnpm --filter @tripplanner/api prisma generate
