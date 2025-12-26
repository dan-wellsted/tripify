#!/usr/bin/env bash
set -euo pipefail

if [[ -f "prisma/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "prisma/.env"
  set +a
fi

if [[ -z "${DATABASE_URL_TEST:-}" ]]; then
  echo "DATABASE_URL_TEST is required." >&2
  exit 1
fi

export DATABASE_URL="$DATABASE_URL_TEST"

pnpm --filter @tripplanner/api prisma migrate reset --force --skip-generate --skip-seed
pnpm --filter @tripplanner/api prisma generate
