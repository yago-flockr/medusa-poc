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
├── bruno/                 # Bruno API collection
├── docs/
│   ├── plan.md            # What we're building; fixed vs open choices
│   ├── features/          # Capability briefs: what each area must do
│   ├── study/             # Medusa study plan and notes
│   ├── spikes/            # Experiments that de-risk a direction before building it
│   └── sensus/            # First client's RFP + our proposal (reference, not a spec)
├── docker-compose.yml     # Local Postgres + Redis
└── AGENTS.md              # AI router
```

## AI context

This repo ships machine-readable documentation for AI coding assistants (`AGENTS.md` and the `agents/` folder). You do not need to maintain it by hand: those files describe how the project works and instruct assistants to update the context in-session when they learn something worth keeping. If you use Cursor, thin routers in `.cursor/rules/` (local, gitignored) point the IDE at these files; other tools use their own local adapter the same way. Start from `AGENTS.md` if you want an overview.

## Requirements

- Node.js 22–24 (LTS)
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

6. Seed identity and catalogue data (from `apps/backend`):

```bash
pnpm run seed
```

Creates demo store/catalogue data, an admin user (`qwe@flockr.com` / `qwe`, override with `ADMIN_EMAIL`/`ADMIN_PASSWORD`), and several demo vendors with vendor users and vendor products. See [Seeding](#seeding) below.

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

Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from Admin → Settings → Publishable API keys (or run `pnpm exec medusa exec ./seeds/sync-publishable-key.ts` from `apps/backend` if that script is present).

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

## Seeding

`pnpm run seed` (from `apps/backend`) chains three scripts, in order, all living in `apps/backend/seeds/` (not `src/` — this is demo/test data, not application source):

- **`seed:catalog`** (`seed-catalog.ts`) runs first: store, regions, shipping, product categories/options, and demo catalogue products. One-shot — it assumes a fresh DB and errors if run twice (unique product handles, duplicate regions, etc.).
- **`seed:identity`** (`seed-identity.ts`) runs second and is idempotent: creates the admin user, skipping if it already exists. Run this part alone with `pnpm run seed:identity`.
- **`seed:vendors`** (`seed-vendors.ts`) runs third and is idempotent: creates several demo vendors, each with a vendor user and 2–3 vendor products (each with 2–3 priced variants), skipping anything (vendor/vendor user/product) that already exists by handle/email. A vendor user's password is generated once, at creation, and only ever printed that one time — re-running after it exists just logs a reminder, not a new password. It needs the shipping profile and sales channel `seed:catalog` creates, so it can't run before it. Run this part alone with `pnpm run seed:vendors`.

If you do need a true clean slate (e.g. the catalogue step above already ran and you want to redo it), `pnpm run db:reset` (repo root) drops and recreates the database schema, migrates, and reseeds everything from zero. Requires Docker running. This is the occasional full-reset option, not something to reach for between every feature — `pnpm run seed` alone covers that.

## Useful docs in this repo

- [`docs/plan.md`](./docs/plan.md) — what we're building, what is fixed, and what is deliberately still open
- [`docs/pre-start.md`](./docs/pre-start.md) — short local checklist
- [`docs/features/`](./docs/features) — what a feature should do, in business language
- [`docs/study/README.md`](./docs/study/README.md) — Medusa learning path with done criteria

## External resources

- [Medusa documentation](https://docs.medusajs.com)
- [Medusa Cloud](https://cloud.medusajs.com)
