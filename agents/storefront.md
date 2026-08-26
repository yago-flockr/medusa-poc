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

## `/vendor` — vendor panel (deleted once, then reinstated)

This app hosts a vendor-facing UI at `src/app/(vendor)/vendor/**` (login,
Shopify connection, staff-parity profile, own orders/statements) plus its
supporting code under `src/vendor/**` (`forms/`, `hooks/{queries,mutations}/`,
`lib/`, `stores/`, `components/`). It was deleted once — Sensus's answers
initially confirmed a vendor manages their own catalogue through their own
Shopify store, not through us — then reinstated once hands-on testing of the
Shopify OAuth flow showed the connection step is unavoidably vendor-driven
(only someone with access to the *installing* store's own org can complete a
custom-distribution app install, so staff can't do this step on a vendor's
behalf). See `docs/plan.md` Decisions, "A full vendor panel is back", for the
full history. **This is not a return to manual catalogue entry**: the
panel's job is connection management (a vendor connects and picks what to
import from their own Shopify) and viewing its own orders/statements — a
Shopify-connected product's own data (title, price, images, variants) still
comes from Shopify only, never edited by hand on either side.
`src/vendor/lib/contract-client.ts` (a ts-rest client built from
`@dtc/api-contracts/vendor/contract`) is the current convention for every
`/vendors/*` call — `src/vendor/lib/client.ts`'s older `request()` helper
still exists only for the one endpoint not in that contract
(`/auth/vendor/emailpass`, a core Medusa auth route, not a custom
`/vendors/*` resource); don't add new `/vendors/*` calls through it.

## Patterns to follow when extending

1. Always send `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (SDK config). Missing key causes opaque store API failures.
2. Prefer URL-driven listing/filter state for shareable facet UX.
3. Keep brand tokens out of core cart/checkout logic when you introduce a config layer.
4. **Mandatory:** never import backend models or `InferTypeOf` of models. Use JS SDK / `HttpTypes` for core commerce; for `/vendors/*` resources use `@dtc/api-contracts` (`packages/api-contracts/README.md`) via `src/vendor/lib/contract-client.ts` — never hand-copy a response type into a hook file again.

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
