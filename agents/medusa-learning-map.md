# What to learn about Medusa (chassis study map)

Treat Medusa as a **commerce application framework**: opinionated modules, workflows, and admin, with escape hatches that look familiar if you know Nest/Node and Next.

This file is the **mental model**. The ordered stages, exercises, and done criteria live in `docs/study/README.md` — keep them there, not here.

## Mental model (map your stack)

- **Nest modules / providers** → Medusa **modules** (domain + service + data models)
- **Prisma/Drizzle schemas** → Medusa **data models** + module migrations (Medusa owns the query layer for its models)
- **Nest CQRS / Temporal-ish orchestration** → **workflows** and **steps** (preferred place for business logic)
- **Event emitters / queues** → **subscribers** + jobs (and real Redis in production)
- **Nest controllers** → **file-based API routes** under `src/api`
- **Admin panel** → Medusa Admin + `src/admin` extensions (React)
- **Headless storefront** → Medusa allows any; **here it is Next.js + JS SDK, and that is fixed** (`docs/plan.md`)
- **GraphQL selection set / Prisma `include`** → API `fields` on Query (`query.graph`): opt-in columns and relations (same-module *and* module links). Not link-only. Operators: bare list replaces route defaults; `+` / `-` amend defaults; `*relation` or `relation.*` expands a relation. Custom links (e.g. `brand`) almost never sit in defaults, so you ask for them explicitly (`+brand.*` or `*brand`).

## Where the difficulty actually is

- **Commerce vocabulary** is broad but shallow: skim it, do not memorize endpoints.
- **The extension model** (modules, links, workflows, routes, subscribers) is the part that pays off; everything custom is built from those five.
- **Marketplace-shaped gaps** are the real study for this chassis. Medusa does not hand you merchant-of-record marketplace mechanics: multi-vendor split, commission, payouts, vendor isolation, and vendor portal auth are ours to build. Spike before productizing.
- **Ops** is mostly about *who operates* the pieces, not which pieces. Postgres, a Redis-compatible service, file storage, and separate web and worker processes are required either way (`docs/plan.md`, Fixed); a managed host provides them, self-hosting means assembling them. Tax and shipping providers are integrations, not core rewrites.

## What you can skip early

- Rebuilding auth, cart, or checkout from scratch
- Deep dive into every payment provider
- Treating Medusa like a generic HTTP toolkit (fight the framework and you lose time)

## Docs worth bookmarking

- Framework: https://docs.medusajs.com/learn
- Architecture in one page: https://docs.medusajs.com/learn/introduction/architecture
- Commerce modules: https://docs.medusajs.com/resources/commerce-modules
- Storefront / publishable keys: https://docs.medusajs.com/resources/storefront-development
- Cloud: https://docs.medusajs.com/cloud

## How this repo expects you to work

- Load Medusa agent skills / MCP when available before inventing APIs.
- Prefer extending modules and workflows over parallel services.
- Direction of travel: `docs/plan.md` + `agents/overview.md`.
