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

## `/vendor` — the vendor actor type's UI, not a separate app

`src/app/vendor/**` is the vendor-facing surface for the `vendor` actor type
(`agents/backend.md`, "Vendor isolation cannot come from Admin") — register a
vendor, log in, manage its own products, view its own orders. It is
deliberately isolated from the customer routes and, just as deliberately,
built differently from the rest of this app:

- **Not under `[countryCode]`.** A back-office tool has no region. `src/middleware.ts` excludes `/vendor` from the region-redirect entirely.
- **SPA-style, not the storefront's normal pattern.** Every other data-fetching flow here uses Server Actions and an `httpOnly` cookie (`lib/data/customer.ts`, `lib/data/cookies.ts`) — server-to-server, no CORS. `/vendor` instead uses plain browser `fetch` (`src/app/vendor/api.ts`) and a JWT in `localStorage`. This is intentional, not an oversight: see `docs/plan.md` Decisions for why (portability to a standalone deploy later without rewriting the auth/data layer) and its accepted costs (`VENDOR_CORS` on the backend; the token is readable by any JS on the page, unlike an `httpOnly` cookie).
- **Auth guard is client-side**, per page (`getVendorToken()` checked in a `useEffect`, redirect via `router.replace` if missing) — there is a brief unauthenticated render before the check runs, same as any client-rendered app; this is accepted for now.
- Do not import `lib/data/*` (the Server Action / `_medusa_jwt` cookie helpers) into anything under `src/app/vendor/` or vice versa — the two auth systems must never touch.

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
