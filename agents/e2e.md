# e2e (Playwright browser tests)

> Context for AI agents. Keep accurate; future sessions trust this file.

Browser tests for the whole stack, in `e2e/` at the repo root — its own pnpm
workspace (`@dtc/e2e`). Third test tier, above backend unit and HTTP
integration (`agents/backend.md` "Testing"), and the only tier that touches the
storefront. **Not run in CI** (see `agents/overview.md`) — run it locally.

## Commands

From the repo root:

- `pnpm e2e` — seed a fresh database, then run every spec.
- `pnpm e2e:quick` — run against whatever is already seeded, no reset.
- `pnpm e2e:prepare` — seed only.

From `e2e/`: `pnpm run test:e2e:ui`, `test:e2e:headed`, `report`.

## Stack it boots

`playwright.config.ts` starts both servers itself via `webServer`, on their own
ports and database — it never touches the dev ones:

|            | dev          | e2e          |
| ---------- | ------------ | ------------ |
| backend    | 9000         | 9100         |
| storefront | 8000         | 8100         |
| database   | `medusa_poc` | `medusa_e2e` |

All of it is in `lib/e2e-config.ts`.

**`webServer` starts before `globalSetup` — verified, not assumed.** That is
why seeding is a separate script (`scripts/prepare-db.ts`) rather than a
`globalSetup`: the storefront needs `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` at
boot, and that key only exists after seeding. The script resets, migrates,
seeds, then writes the key to `e2e/.publishable-key`, which the config reads
before starting anything. Do not move seeding into `globalSetup`.

`seeds/seed.ts` currently runs only `seed-identity` (catalog and vendors are
commented out), so `prepare-db.ts` calls the three seed scripts explicitly.

## Conventions

- One spec per flow, `specs/<flow>.spec.ts`. Shared helpers in `lib/`.
- **Prefer the storefront's existing `data-testid`s** — the customer-facing
  store inherits ~280 from the Medusa starter. `/vendor` has none: use
  role/label locators there.
- Not every starter testid survived this repo's redesign: the store listing has
  no `product-link` (use `a[href^="/gb/products/"]`), and the cart page renders
  rows as `product-row`, not `cart-item` (that one is the nav dropdown).

## Gotchas

- **`workers: 1`, deliberately.** A Medusa server plus a Next dev server plus
  parallel Chromium workers OOM-killed an 8GB machine twice. One worker is also
  _faster_ here (2.1m vs 2.4m) because nothing contends.
- **Checkout steps are compiled on first hit**, so they get explicit long
  timeouts in `lib/store-purchase.ts` and the suite runs at `timeout: 180_000`.
  A tighter timeout fails on a cold run, not on a real bug.
- **`loginAsVendor` waits for a positive signal, not an absence.**
  `VendorAuthGate` renders `null` until mounted, so asserting the login heading
  is _hidden_ passes while nothing has rendered at all — the helper then
  returned before the token was persisted and the next hard navigation landed
  back on the login form. It now waits for the shell **and** polls
  `localStorage.vendor_token`.
- **Adding `@playwright/test` re-links Next.js.** Next declares it an optional
  peer, so installing it changed Next's pnpm peer-hash directory and broke a
  running dev server with `Cannot find module '.../jest-worker/processChild.js'`.
  Restart dev servers after an install that touches this package.
- **Never `pnpm install --filter <one-package>` here** — it prunes the other
  workspaces' `node_modules` (it removed Next entirely). Always plain
  `pnpm install` from the root.
- If Node cannot reach Postgres after a WSL restart (`Connection terminated
unexpectedly`) while `docker exec psql` works, the port mapping is stale:
  `docker compose restart postgres redis`.

## Coverage

- `smoke.spec.ts` — storefront renders the seeded catalogue.
- `store-checkout.spec.ts` — listing → product → cart → address → delivery →
  payment → confirmed order. `pp_system_default` is the only seeded provider,
  so checkout completes without Stripe.
- `vendor-panel.spec.ts` — login, panel sections, vendor sees only own products.
- `marketplace-order-routing.spec.ts` — an order reaches the owning vendor's
  panel and not the other's. Two browser contexts, two sessions.
- `error-flows.spec.ts` — 404s, cart/checkout with no cart, wrong password,
  unknown and malformed email, logged-out vendor route, cleared token.
