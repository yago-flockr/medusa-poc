# Storefront (`apps/storefront`)

> Context for AI agents in the Next.js customer storefront. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`.

## Overview

Next.js App Router storefront from the Medusa DTC starter. Talks to the Medusa Store API. Port default: **8000**.

This is the **customer** surface only. House portal is separate (ADR 0003).

## Architecture

- Next.js 15 + React 19
- Medusa JS SDK (`@medusajs/js-sdk`) with publishable key
- Tailwind-based UI from the starter (Sensus design system arrives via Figma later)

## Patterns when extending

1. Always send `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (SDK config). Missing key causes opaque store API failures.
2. Faceted listing state should live in the URL (RFP 5.3 / 5.4) as we customize IA.
3. Basket UX must eventually group by house (RFP 5.1); starter cart is single-merchant shaped until we extend it.
4. Editorial/CMS blocks that embed products must resolve live commerce data at render time (RFP 5.2 / 7.6).

## Environment

`apps/storefront/.env.local` (gitignored):

- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (local default `http://localhost:9000`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (`pk_...`)

## Scripts

From `apps/storefront`:

- `pnpm run dev` → Next on port 8000
- `pnpm run build` / `pnpm run start`
- `pnpm run lint` → `next lint` today

## Gotchas

- Confirm `apps/storefront/` exists before storefront-only tasks (it does in this PoC).
- Do not commit `.env.local`.
- Starter SEO/search are baselines; Sensus needs stronger facet canonical rules and structured data (RFP 5.5).
