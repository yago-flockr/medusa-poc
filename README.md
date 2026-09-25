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

Creates the store setup plus demo staff, vendors, affiliates, categories, collections, products and orders. Every login's password is `123`. See [Seeding](#seeding) below.

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

`pnpm run seed` (from `apps/backend`) seeds everything. **To change what gets seeded, edit `apps/backend/seeds/seed-config.ts`**. That file holds every count and range (vendors, products per vendor, orders per affiliate, …). Nothing else needs to change.

| Logins (password `123`) |                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Staff (`/app`)          | `admin@staff.com`                                                                   |
| Vendors                 | `main@vendor.com`, `qwe@vendor.com`, `asd@vendor.com`, `zxc@vendor.com`             |
| Affiliates              | `main@affiliate.com`, `qwe@affiliate.com`, `asd@affiliate.com`, `zxc@affiliate.com` |

A login is `<name>@<role>.com`, taken from the `staff` / `vendors` / `affiliates` lists in the config. Add a name to add a login.

How it fits together:

- `seed-config.ts` — the knobs.
- `seed-plan.ts` — `buildSeedPlan(config)` turns them into concrete fixtures, using faker seeded with `randomSeed`. Same config → same data every run. Throws if the ranges contradict each other.
- `seed-<entity>.ts` — each one creates its slice of the plan through the app's real workflows. Order: catalog → categories → collections → identity → vendors → affiliates → orders. Each also runs alone with `pnpm run seed:<entity>`.
- Every step except `seed:catalog` is idempotent (it skips anything that already exists by handle/email). Orders are skipped once any exist.

After changing the config, run `pnpm run db:reset`. Re-seeding on top of old data mixes the two datasets.

If you do need a true clean slate (e.g. the catalogue step above already ran and you want to redo it), `pnpm run db:reset` (repo root) drops and recreates the database schema, migrates, reseeds everything from zero, and re-syncs the storefront's publishable API key (seeding always generates a new one, so the storefront would otherwise be left pointing at a key that no longer exists). Requires Docker running; prompts for confirmation unless run as `pnpm run db:reset -- -y`. This is the occasional full-reset option, not something to reach for between every feature — `pnpm run seed` alone covers that.

## Testing

Three tiers. Only the first is wired into `pnpm test`, because the other two are slow and need Docker running.

| Command                 | What it runs                                                                       | Roughly |
| ----------------------- | ---------------------------------------------------------------------------------- | ------- |
| `pnpm test`             | Backend unit tests — pure functions, no DB                                         | ~12s    |
| `pnpm test:integration` | Backend HTTP tests — real app boot, real temp Postgres, real requests              | ~3min   |
| `pnpm e2e`              | Playwright browser tests — drives the real storefront and vendor panel in Chromium | ~4min   |

`pnpm e2e` is self-contained: it resets and seeds its own `medusa_e2e` database, then starts a backend on port 9100 and a storefront on port 8100 and stops them when it finishes. It never touches your dev database or your dev ports, so you can leave `pnpm dev` running. Use `pnpm e2e:quick` while writing a test to re-run the specs without reseeding, and `pnpm --filter @dtc/e2e run test:e2e:ui` to step through a failing one in Playwright's UI. Failure screenshots, videos and traces land in `e2e/test-results/`.

The browser tests need Chromium installed once: `cd e2e && pnpm exec playwright install chromium`.

## Useful docs in this repo

- [`docs/plan.md`](./docs/plan.md) — what we're building, what is fixed, and what is deliberately still open
- [`docs/pre-start.md`](./docs/pre-start.md) — short local checklist
- [`docs/features/`](./docs/features) — what a feature should do, in business language
- [`docs/study/README.md`](./docs/study/README.md) — Medusa learning path with done criteria

## External resources

- [Medusa documentation](https://docs.medusajs.com)
- [Medusa Cloud](https://cloud.medusajs.com)
