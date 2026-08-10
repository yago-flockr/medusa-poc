# medusa-poc

Medusa v2 monorepo **chassis** for multi-vendor marketplace projects. Clone it, keep the shared commerce engine, swap brand config, and ship the next client (see [`docs/plan.md`](./docs/plan.md)).

Based on the Medusa DTC starter.

## Packages

### Backend (`@dtc/backend`) [Read Docs](./apps/backend/README.md)

Medusa application: Store/Admin APIs, workflows, modules, Admin UI at `/app`.

### Storefront (`@dtc/storefront`) [Read Docs](./apps/storefront/README.md)

Next.js customer storefront talking to the Medusa Store API (port 8000).

## How the packages relate

The storefront is a headless client of the backend. One Medusa backend is the system of record for catalogue, cart, checkout, and orders.

## Tech stack

- **Medusa v2**: `apps/backend` (commerce API + admin at `/app`)
- **Next.js**: `apps/storefront` (customer storefront, port 8000)
- **PostgreSQL 16 + Redis 7**: root `docker-compose.yml`
- **pnpm + Turborepo**: workspace at repo root

## Project structure

```text
.
├── apps/
│   ├── backend/           # Medusa application
│   └── storefront/        # Next.js storefront
├── agents/                # AI engineering context
├── docs/
│   └── plan.md            # Roadmap (draft)
├── docker-compose.yml     # Local Postgres + Redis
└── AGENTS.md              # AI router
```

## AI context

This repo ships machine-readable documentation for AI coding assistants (`AGENTS.md` and the `agents/` folder). You do not need to maintain it by hand: those files describe how the project works and instruct assistants to update the context in-session when they learn something worth keeping. If you use Cursor, thin routers in `.cursor/rules/` (local, gitignored) point the IDE at these files; other tools use their own local adapter the same way. Start from `AGENTS.md` if you want an overview.

## Requirements

- Node.js 20–24 (LTS)
- pnpm 10+ (this repo uses pnpm 11)
- Docker Desktop (WSL integration on Windows) for Postgres and Redis

## Getting started

1. Install tooling (Ubuntu / WSL):

```bash
pnpm run setup
```

Or: `bash scripts/setup.sh`

2. Install dependencies:

```bash
pnpm install
```

3. Start databases:

```bash
docker compose up -d
```

4. Configure backend env:

```bash
cp apps/backend/.env.template apps/backend/.env
```

`DATABASE_URL` and `REDIS_URL` in the template match Docker Compose.

5. Migrate (from `apps/backend`):

```bash
cd apps/backend
pnpm exec medusa db:migrate
```

6. Create an admin user:

```bash
pnpm exec medusa user -e admin@example.com -p supersecret
```

7. Start the backend (terminal 1):

```bash
cd apps/backend
pnpm run dev
```

Admin: http://localhost:9000/app

8. Configure the storefront:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from Admin → Settings → Publishable API keys (or run `pnpm exec medusa exec ./src/scripts/sync-publishable-key.ts` from `apps/backend` if that script is present).

9. Start the storefront (terminal 2):

```bash
cd apps/storefront
pnpm run dev
```

Storefront: http://localhost:8000

Backend and storefront are **separate processes**. Running `pnpm run dev` only under `apps/backend` does not start port 8000.

From the repo root you can use:

```bash
pnpm run backend:dev
pnpm run storefront:dev
```

## Useful docs in this repo

- [`docs/plan.md`](./docs/plan.md) — roadmap (draft)
- [`docs/pre-start.md`](./docs/pre-start.md) — short local checklist

## External resources

- [Medusa documentation](https://docs.medusajs.com)
- [Medusa Cloud](https://cloud.medusajs.com)
