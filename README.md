# Sensus Collective × Medusa PoC

Medusa v2 monorepo (backend + Next.js storefront) for **Sensus Collective**: a curated multi-vendor marketplace (houses are hand-picked; one customer basket may span many houses).

Product outcomes: [`sensus.md`](./sensus.md). Delivery / feasibility: [`docs/feasibility-sensus-medusa.md`](./docs/feasibility-sensus-medusa.md). Decisions: [`docs/adr/`](./docs/adr/).

Based on the Medusa DTC starter. Platform choice is Medusa (not Shopify Plus); see ADR 0001.

## Tech stack

- **Medusa v2**: `apps/backend` (commerce API + admin at `/app`)
- **Next.js**: `apps/storefront` (customer storefront, port 8000)
- **PostgreSQL 16 + Redis 7**: root `docker-compose.yml`
- **pnpm + Turborepo**: workspace at repo root
- **Markets**: UK / EU / US (`apps/backend/src/lib/sensus-markets.ts`); Launch default country `gb`

## Project structure

```text
.
├── apps/
│   ├── backend/           # Medusa application
│   └── storefront/        # Next.js storefront
├── agents/                # AI engineering context
├── docs/                  # ADRs, markets, pre-start, feasibility
├── docker-compose.yml     # Local Postgres + Redis
├── sensus.md              # Product RFP / outcomes
└── AGENTS.md              # AI router
```

## AI context

Machine-readable docs live in `AGENTS.md` and `agents/`. Start at `agents/overview.md`. Assistants should update those files when they learn something durable. Cursor users keep thin local routers under `.cursor/` (gitignored).

## Requirements

- Node.js 20–24 (LTS)
- pnpm 10+ (this repo uses pnpm 11)
- Docker Desktop (WSL integration on Windows) for Postgres and Redis

## Getting started

1. Install dependencies:

```bash
pnpm install
```

2. Start databases:

```bash
docker compose up -d
```

3. Configure backend env:

```bash
cp apps/backend/.env.template apps/backend/.env
```

`DATABASE_URL` and `REDIS_URL` in the template match Docker Compose.

4. Migrate and seed (from `apps/backend`):

```bash
cd apps/backend
pnpm exec medusa db:migrate
```

5. Create an admin user:

```bash
pnpm exec medusa user -e admin@example.com -p supersecret
```

6. Start the **backend** (terminal 1):

```bash
cd apps/backend
pnpm run dev
```

Admin: http://localhost:9000/app

7. Configure the storefront:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from Admin → Settings → Publishable API keys (or run `pnpm exec medusa exec ./src/scripts/sync-publishable-key.ts` from `apps/backend` if that script is present). Keep `NEXT_PUBLIC_DEFAULT_REGION=gb`.

8. Start the **storefront** (terminal 2):

```bash
cd apps/storefront
pnpm run dev
```

Storefront: http://localhost:8000 (redirects to `/gb/...`)

Backend and storefront are **separate processes**. Running `pnpm run dev` only under `apps/backend` does not start port 8000.

From the repo root you can use:

```bash
pnpm run backend:dev
pnpm run storefront:dev
```

## Useful docs in this repo

- [`docs/pre-start.md`](./docs/pre-start.md) — short local checklist
- [`docs/markets.md`](./docs/markets.md) — UK / EU / US regions
- [`docs/feasibility-sensus-medusa.md`](./docs/feasibility-sensus-medusa.md) — CAN / MAYBE / CAN'T and Launch vs v2
- [`docs/adr/`](./docs/adr/) — architecture decisions

## External resources

- [Medusa documentation](https://docs.medusajs.com)
- [Medusa Cloud](https://cloud.medusajs.com)
