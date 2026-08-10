# Storefront (`apps/storefront`)

> Context for AI agents in the Next.js customer storefront. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file and the package README if setup/run changes.

## Overview

Next.js App Router storefront from the Medusa DTC starter. Talks to the Medusa Store API. Port default: **8000**.

This is the **customer** surface only. Brand/theme config is a later concern (`docs/plan.md`).

## Architecture and flow

- Next.js 15 + React 19
- Medusa JS SDK (`@medusajs/js-sdk`) with publishable key
- Tailwind-based UI from the starter

## Patterns to follow when extending

1. Always send `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (SDK config). Missing key causes opaque store API failures.
2. Prefer URL-driven listing/filter state for shareable facet UX.
3. Keep brand tokens out of core cart/checkout logic when you introduce a config layer.

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
