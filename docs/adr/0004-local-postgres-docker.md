# ADR 0004: Local Postgres and Redis via Docker Compose

- Status: accepted
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

## Context

Local development often runs on WSL2 with Docker Desktop on Windows. Installing Postgres or Redis via apt inside WSL is not the preferred path for this team.

## Decision

Provide Postgres 16 and Redis 7 through root `docker-compose.yml` (`medusa-poc-postgres`, `medusa-poc-redis`). Backend connects with `DATABASE_URL` and `REDIS_URL` (see `apps/backend/.env.template`).

## Consequences

- Docker Desktop must be running (WSL integration enabled) before `pnpm`/`medusa` DB commands.
- Do not assume a host `psql` client exists; use `docker compose exec` when SQL inspection is needed.
- Production on Medusa Cloud (or self-host) uses managed Postgres/Redis; compose is local-only.
- If `REDIS_URL` is missing, Medusa falls back to in-memory fake Redis (fine for tiny local tries, not for jobs/events).
