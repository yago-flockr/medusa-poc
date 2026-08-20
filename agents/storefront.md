# Storefront (`apps/storefront`)

> Context for AI agents in the Next.js customer storefront. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file and the package README if setup/run changes.

## Overview

Next.js App Router storefront from the Medusa DTC starter. Talks to the Medusa Store API. Port default: **8000**.

This is the **customer** surface only. Brand/theme config is a later concern.

**Next.js and server rendering are fixed** (`docs/plan.md`, Fixed): discovery matters too much to ship a client-rendered store. Default to server rendering and treat a client component as a decision to justify. The **UI component library is not decided** — do not introduce one without asking.

## Architecture and flow

- Next.js 15 + React 19
- Medusa JS SDK (`@medusajs/js-sdk`) with publishable key
- Tailwind-based UI from the starter

## `/vendor` — removed

This app used to host a vendor-facing UI at `src/app/vendor/**` (register/log
in, manage its own products, view its own orders, SPA-style with a
`localStorage` JWT). It's deleted — Sensus's answers confirmed a vendor
manages their own catalogue through their own Shopify store, not through
us, so there was never a real need for a vendor to log into anything of
ours to manage products. See `docs/plan.md` Decisions for the full
reasoning (including why it was built SPA-style in the first place) and
what's replacing it (Shopify sync). `src/middleware.ts` still excludes
`/vendor` from the region-redirect as a harmless no-op, in case a vendor
panel comes back later as a deliberate alternative to Shopify — not
because anything currently lives there.

## Patterns to follow when extending

1. Always send `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (SDK config). Missing key causes opaque store API failures.
2. Prefer URL-driven listing/filter state for shareable facet UX.
3. Keep brand tokens out of core cart/checkout logic when you introduce a config layer.
4. **Mandatory:** never import backend models or `InferTypeOf` of models. Use JS SDK / `HttpTypes` for core commerce; for custom resources use the HTTP contract (`api/.../contract.ts` or a shared contracts package), never a second hand-copied type.

## Environment variables

`apps/storefront/.env.local` (gitignored), from `.env.template`:

- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (local default `http://localhost:9000`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (`pk_...`)
- `NEXT_PUBLIC_DEFAULT_REGION` (seed default often `gb`)

## Scripts / commands

From `apps/storefront`:

- `pnpm run dev` → Next on port 8000
- `pnpm run build` / `pnpm run start`
- `pnpm run lint` → `next lint` today

## Gotchas and notes

- Confirm `apps/storefront/` exists before storefront-only tasks.
- Do not commit `.env.local`.
- Backend and storefront are separate processes; backend-only `dev` does not start port 8000.
