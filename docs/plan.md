# Project roadmap: medusa-poc

> **Draft.** Not set in stone. Update when priorities or evidence change.

**Objective:** A reusable Medusa commerce chassis. Near-term: stakeholder-ready value and enough framework understanding to scale without a messy codebase.

Day-to-day context: `agents/`. Working decisions: `docs/adr/`.

## Now (few weeks)

Stakeholder demo and learning. Single-merchant vertical slice must work. Multi-vendor is a controlled spike, not on the demo critical path.

- [ ] Reliable local boot (Docker, env, migrate, seed, publishable key)
- [ ] Seeded catalogue (regions/currencies from `apps/backend/src/lib/markets.ts`)
- [ ] Storefront path: browse → cart → checkout (system payment OK for demo)
- [ ] Order visible in Medusa Admin; can explain Store API + publishable key
- [ ] One small end-to-end Medusa extension (module / workflow / subscriber) for learning
- [ ] Time-boxed two-house multi-vendor spike (findings → ADR 0002). Do not merge half-broken split into the demo path

**Out of scope for Now:** Biome/shadcn/Zustand/TanStack/i18n overhaul, house portal UI, commission/payouts, brand factory, GraphQL vs BFF.

## Next (after demo is green)

Productize what the spike proved. Then harden DX.

- [ ] House on product/order (or equivalent Medusa model from spike)
- [ ] Consignments / fulfillment split without multiple checkouts
- [ ] Commission model (once consignments are real)
- [ ] DX stack: Biome, shadcn/ui, i18next, Zustand, TanStack Query, asset/icon pipeline

## Later (chassis scale)

- [ ] Clone-and-swap / template deployment for a new client
- [ ] Brand config layer (colors, copy, images outside core logic)
- [ ] Data onboarding scripts from third parties
- [ ] API contract choice (Medusa GraphQL vs REST + BFF) when fetch pain is real
- [ ] Auth standard across Customer, House, and Admin
- [ ] CMS and search provider defaults

## Success criteria for Now

- Stakeholder can complete a purchase flow without excuses
- You can explain Medusa’s extension model from something you built
- Docs separate draft vs decided; this file matches reality
- Multi-vendor risk is spike-validated or explicitly open with evidence
