# What to learn about Medusa (senior TS map)

You already know Nest/Node, Next, ORMs, AWS, SSR/SEO. Medusa is not "another Nest". Treat it as a **commerce application framework**: opinionated modules, workflows, and admin, with escape hatches that look familiar.

## Mental model (map your stack)

- **Nest modules / providers** → Medusa **modules** (domain + service + data models)
- **Prisma/Drizzle schemas** → Medusa **data models** + module migrations (Medusa owns the query layer for its models)
- **Nest CQRS / Temporal-ish orchestration** → **workflows** and **steps** (preferred place for business logic)
- **Event emitters / queues** → **subscribers** + jobs (and real Redis in production)
- **Nest controllers** → **file-based API routes** under `src/api`
- **Admin panel** → Medusa Admin + `src/admin` extensions (React)
- **Headless storefront** → any; here Next.js + JS SDK (like Storefront API clients you already know)
- **Shopify Plus (old plan)** → Medusa backend as system of record (ADR 0001)

## Study in this order

1. **Commerce building blocks**  
   Products, variants, regions/currencies, carts, line items, checkouts, orders, fulfillments, payments, customers. Skim official commerce module docs; do not memorize every endpoint.

2. **Framework fundamentals** (do these hands-on in `apps/backend`)  
   - Modules and data models  
   - Module links  
   - Workflows and steps  
   - API routes (store vs admin)  
   - Subscribers  
   - `medusa-config.ts` and feature modules

3. **Admin customization**  
   Widgets, routes, how the dashboard loads custom UI. Needed for Sensus admin portal work.

4. **Storefront integration**  
   Publishable API keys, JS SDK, cart/checkout cookies/CORS, multi-region. Then plan house-grouped basket on top.

5. **Marketplace-shaped gaps** (Sensus-specific; this is the real study)  
   Multi-vendor split, commission, payouts, vendor isolation, vendor portal auth. Medusa does not hand you Sensus MoR for free. Spike early (ADR 0002 / RFP 7.9).

6. **Ops**  
   Medusa Cloud (`mcloud`) vs self-host (Postgres, Redis, S3, server + worker). DDP/tax/shipping providers as integrations, not core rewrites.

## What you can skip early

- Rebuilding auth, cart, or checkout from scratch
- Deep dive into every payment provider
- Treating Medusa like a generic HTTP toolkit (fight the framework and you lose time)

## Docs worth bookmarking

- Framework: https://docs.medusajs.com/learn  
- Commerce modules: https://docs.medusajs.com/resources/commerce-modules  
- Storefront / publishable keys: https://docs.medusajs.com/resources/storefront-development  
- Cloud: https://docs.medusajs.com/cloud  
- Agentic skills / MCP: linked from root `AGENTS.md` history and Medusa "build with LLMs" docs

## How this repo expects you to work

- Load Medusa agent skills / MCP when available before inventing APIs.
- Prefer extending modules and workflows over parallel services.
- Product truth: `sensus.md` + `docs/adr/` + `agents/overview.md`.
