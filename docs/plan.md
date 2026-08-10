# Project roadmap: medusa-poc

> **Draft.** Update as you learn. Not binding architecture.

**Objective:** Medusa chassis for real client work. Study the framework; ship coherent paths.

Day-to-day context: `agents/`. Study path: `docs/study/README.md`.
Feature intents: `docs/features/`. Experiments: `docs/spikes/`.

## Now

- [ ] Reliable local boot (Docker, env, migrate, seed, publishable key)
- [ ] Seeded catalogue
- [ ] Storefront: browse → cart → checkout
- [ ] Order visible in Admin
- [ ] Study plan blocks A and B: module, link, workflow, route, subscriber

## Next

- [ ] Multi-vendor spike (`docs/spikes/multi-vendor-order.md`), then decide the order model
- [ ] Scaling block: worker mode + Redis infrastructure modules
- [ ] DX stack (Biome, shadcn, i18n, Zustand, TanStack Query) when you want it

## Later

- [ ] Package marketplace support as an optional module or plugin
- [ ] Clone-and-swap / brand config
- [ ] Onboarding scripts
- [ ] API contract (GraphQL vs REST + BFF) when pain is real

## Decisions

- **Marketplace is optional, not core.** It lives in the base repo but a clone
  must be able to boot without it. Intent: `docs/features/multi-vendor-marketplace.md`.
- **Biome replaces ESLint + Prettier** for lint and format, once the study
  blocks are moving. Not started.
- **Backend first.** Frontend work (shadcn, TanStack, i18n) is a separate track
  and does not gate Medusa study.
