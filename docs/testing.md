# Testing

## API
- Requires a running Postgres and `DATABASE_URL` set (see `prisma/.env.example`).
- Run migrations before tests: `pnpm --filter api prisma migrate dev`.
- Run tests: `pnpm --filter api test`.
- Current tests skip if the DB is unreachable; ticket 0013 will tighten this.

## Web
- Run tests: `pnpm --filter web test`.
