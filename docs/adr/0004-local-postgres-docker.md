# ADR 0004: Local Postgres via Docker Compose

- Status: accepted
- Date: 2026-08-06
- Deciders: engineering (PoC)

## Context

Local development runs on WSL2 with Docker Desktop on Windows. Installing Postgres via apt inside WSL is not the preferred path for this team.

## Decision

Provide Postgres 16 through root `docker-compose.yml` (`medusa-poc-postgres`). Backend connects with `DATABASE_URL` (see `apps/backend/.env.template`).

## Consequences

- Docker Desktop must be running (WSL integration enabled) before `pnpm`/`medusa` DB commands.
- Do not assume a host `psql` client exists; use `docker compose exec` when SQL inspection is needed.
- Production on Medusa Cloud (or self-host) uses managed Postgres; compose is local-only.
