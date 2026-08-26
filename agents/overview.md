# medusa-poc (commerce chassis)

> Context for AI agents. Keep accurate; future sessions trust this file.

## Maintaining project documentation

Update **in the same session** when you discover:

- User preference (style, tooling, workflow)
- Recurring bug or gotcha
- Non-obvious architecture or wiring
- New module, package, folder, or script not mapped here
- Schema or persistence change → `apps/backend/docs/ER_MODEL.md`
- Useful command missing from Scripts

Do not record generic facts, obvious code, or duplicates.

**Where to update:**

- Repo-wide → `agents/overview.md`
- Scope, fixed constraints, and decisions → `docs/plan.md`
- Human onboarding → `README.md`
- Backend → `agents/backend.md`
- Storefront → `agents/storefront.md`
- Medusa mental model → `agents/medusa-learning-map.md`
- Coding-pattern rule (SOLID, clean code, DRY/KISS/YAGNI, type safety, UI state) → `agents/patterns/<topic>.md`
- Medusa study stages → `docs/study/README.md`
- What a feature should do (business intent) → `docs/features/<slug>.md`. **Behaviour only** — no technology, file paths or primitives; those go in this file or `agents/backend.md`. Shape: `docs/features/_template.md`
- Experiment protocol and results → `docs/spikes/<slug>.md`
- Backend ER model → `apps/backend/docs/ER_MODEL.md`
- Known-insecure-for-now items, mapped but deliberately not fixed yet → `docs/security-backlog.md`
- `AGENTS.md` → only when agent files are added or renamed

## Overview

Medusa v2 monorepo chassis (still close to the DTC starter). Brand-agnostic foundation to specialize per client.

Scope and fixed constraints: `docs/plan.md`. **Read its Fixed and Not decided sections before choosing any technology** — several choices are deliberately still open, and picking one silently is a mistake.

## Medusa engineering rules

Always implement the Medusa way. No workarounds.

1. Prefer modules, workflows, steps, links, subscribers, jobs, and file-based API routes.
2. Prefer core-flows (`@medusajs/medusa/core-flows`) with `runAsStep` / custom steps.
3. Routes stay thin: auth/body → workflow → response.
4. Never invent a second path that leaves the first broken.

## Engineering principles

Hard rules for how code is written, not aspirations to skim past. Sequencing
(backend before frontend) and tooling (ESLint + Prettier) are hard rules too —
`docs/plan.md` "Decisions".

Below are this project's own architectural principles (Medusa-specific: SRP
across route/workflow/module, extend-don't-fork, etc.). `agents/patterns/`
is the general-software-engineering layer underneath these — SOLID, clean
code, DRY/KISS/YAGNI, type safety, UI state — and applies to every change on
this repo the same way these do: by default, without being asked. Where a
pattern file's guidance and this section overlap (DRY in particular), this
section's wording is the one that governs for this repo.

- **Single responsibility.** A module owns one domain's data and service; a
  workflow orchestrates one business operation; a route only translates HTTP
  into a workflow call and the result back out. If a layer starts doing
  another layer's job, split it.
- **Open for extension, closed for modification.** Extend Medusa's own
  workflows with hooks and steps; never fork a core flow to add behavior —
  this is "never invent a second path" above, restated as the general
  principle it actually is.
- **DRY.** A shape is translated in exactly one place — a contract file, a
  mapper — never hand-copied into a second type because that was faster than
  importing the first. If you are about to redefine something Medusa or an
  existing contract already types, stop and import it instead.
- **KISS.** Reach for the framework primitive (module, workflow, link,
  subscriber, job) before reaching for a new abstraction. A second path next
  to a working one is not simpler — it is a second thing to keep in sync.
- **YAGNI.** Leave a `docs/plan.md` "Not decided" undecided until a clone
  actually needs the answer. Marketplace support is optional per clone for
  the same reason: do not build it into a clone that will never use it.
- **TypeScript strictness is deliberate per package, not uniform.**
  `apps/backend/tsconfig.json` enables `strictNullChecks` only; Medusa's own
  decorator-metadata shape (`emitDecoratorMetadata` / `experimentalDecorators`)
  is already switched on for the framework's sake, and full `strict` has not
  been verified against it. `apps/storefront/tsconfig.json` enables full
  `strict` — a plain Next.js app has no such conflict. Do not "fix" this into
  consistency without checking framework compatibility first; treat the gap
  as a decision, not an oversight.

## Architecture and flow

1. Customer uses `apps/storefront` (Next.js).
2. Storefront calls Medusa Store API with a publishable API key.
3. `apps/backend` is system of record for products, cart, checkout, orders, customers.
4. Staff use Medusa Admin at `/app`.
5. Local DB and Redis: Docker Compose.

## Core technologies

Fixed (no substitute — `docs/plan.md`):

- **Medusa v2**: `apps/backend`
- **Next.js, server-rendered**: `apps/storefront`
- **Postgres**, and **Redis** for events, queues, cache and locks in production: `docker-compose.yml` locally
- **TypeScript** everywhere; separate web and worker processes in production

Current but replaceable:

- **pnpm + Turborepo**: root workspace
- **Tailwind** from the starter; component library not chosen
- **Seed markets**: `apps/backend/src/lib/markets.ts`

## Module / directory breakdown

- `apps/backend/` → `agents/backend.md`
- `apps/storefront/` → `agents/storefront.md`. Hosts a vendor-facing UI at
  `/vendor` (login, Shopify connection, staff-parity profile, own
  orders/statements) — this was deleted once, then reinstated; see
  `docs/plan.md` Decisions "A full vendor panel is back — superseding 'no
  vendor-facing panel for v1'... and the earlier deletion of `/vendor`" for
  the full history. It is **not** a return to manual catalogue entry: a
  vendor connects their own Shopify and picks what to import, never types a
  product in by hand. Any new UI surface goes inside the storefront as an
  isolated route segment (own token, own layout, never sharing session
  state with other actor types) unless a real requirement rules that out —
  exactly two deployables (backend+Admin, storefront) is the standing rule.
- `packages/` → shared workspace packages consumed by more than one app
  (`pnpm-workspace.yaml`). Currently one: `api-contracts`
  (`packages/api-contracts/README.md`) — ts-rest + Zod contracts for
  backend↔frontend HTTP boundaries, one domain per `src/<domain>/`
  subfolder (currently just `vendor`, covering every `/vendors/*` route),
  the single source of truth for request/response types on both
  `apps/backend` and `apps/storefront`. See its own README for the pattern,
  when a route needs an entry here, and what stays out of scope (core
  Medusa resources, and anything that's a Module Link rather than an HTTP
  boundary — see `agents/backend.md` "Patterns to follow when extending").
- `docs/plan.md`: what the product must do, what is **Fixed** and **Decided**, and what is **Not decided** — read before assuming a host or a provider (hosting itself is decided; see Decisions)
- `docs/study/`: Medusa study stages with done criteria; notes per stage
- `docs/features/`: intent briefs (what we want + likely Medusa primitives); `_template.md` is the shape
- `docs/spikes/`: experiments that prove a direction before productizing
- `docs/security-backlog.md`: known-insecure-for-now items across the whole marketplace feature, mapped but deliberately not fixed yet — check before any real vendor or customer data touches this chassis
- `docs/v1-scope-proposal.md`: client-facing scope proposal (not an engineering spec) mapping which marketplace areas can ship simple for a short-deadline v1 vs. which commercial decisions block further building
- `bruno/`: Bruno `.bru` collection at repo root. `admin/` gets its JWT from a `folder.bru` pre-request script (one shared admin credential). `vendors/` is a step-by-step practice flow instead (create vendor → create vendor user → login → list/create/update products) — staff-driven end to end, no public self-registration — because each vendor mints its own token. Run `vendors/isolation/` afterwards to see two vendors fail to see or edit each other's data.
- `docker-compose.yml`: local Postgres and Redis

## Conventions

- Package manager: **pnpm only**
- Lint / format: ESLint + Prettier; Medusa rules via `@medusajs/eslint-plugin` (`docs/plan.md`)
- Code artifacts in English
- No secrets in git; document new vars in `.env.template`

## Environment variables

- Backend: `apps/backend/.env` from `.env.template`
- Storefront: `apps/storefront/.env.local`
- Never print secret values in chat or commits

If deploying this monorepo to **Medusa Cloud**: set Project root to `apps/backend` and Storefront root to `apps/storefront`. Cloud provides `DATABASE_URL`, `REDIS_URL`, `MEDUSA_WORKER_MODE`, and storefront `NEXT_PUBLIC_*` URLs/keys — do not set the reserved ones (dashboard or `medusa-config.ts`). Do not set `projectConfig.databaseUrl`, `projectConfig.databaseDriverOptions`, or `projectConfig.redisUrl`; `defineConfig` injects them when `EXECUTION_CONTEXT=medusa-cloud`. Explicit `process.env.DATABASE_URL` / `REDIS_URL` in config overrides those defaults with `undefined` at build time and breaks deploy. You must set `JWT_SECRET` and `COOKIE_SECRET` (runtime, not build). CORS is auto-configured when the storefront is hosted on Cloud. Local `.env` still supplies `DATABASE_URL` via `defineConfig` defaults.

## Scripts

- `pnpm run setup`
- `pnpm run backend:dev` → http://localhost:9000 (admin `/app`)
- `pnpm run storefront:dev` → http://localhost:8000 (customer storefront)
- `docker compose up -d`

From `apps/backend`: `pnpm exec medusa db:migrate`, `pnpm exec medusa user -e ... -p ...`

## Gotchas

- pnpm 11: `trustLockfile` / `allowBuilds` in `pnpm-workspace.yaml`. Medusa Cloud defaults to Node 20.x; pnpm 11 fails there (`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`). Keep pnpm 11 and set `engines.node` to `>=22` so Cloud uses Node 22. Do not downgrade pnpm.
- Storefront without publishable key fails opaquely
- Redis may fall back to in-memory fake Redis locally
- Medusa Cloud: leaving Project root empty makes the build look at the repo root (no `medusa-config.ts`) and fail. Missing `JWT_SECRET` / `COOKIE_SECRET` fails **start**, not `medusa build`. Setting `databaseUrl` / `redisUrl` in `medusa-config.ts` also fails Cloud build/migrate — omit them.
- Uploaded file URLs (products, vendor uploads) point at Cloud's auto-provisioned S3 bucket in production, not a relative path — if the storefront ever renders them through Next.js's `<Image>` component, that S3 domain must be added to `next.config`'s `images.remotePatterns` or image loading breaks with an opaque error. No code change needed for `uploadFilesWorkflow` itself — same call works unchanged against local disk (dev) and Cloud's S3 (prod), the File Module provider swap is transparent — this is specifically about the frontend consuming the resulting URLs, not the upload path.
