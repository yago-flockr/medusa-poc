# ADR 0006: Serious commerce quality bar

- Status: accepted
- Date: 2026-08-09
- Deciders: engineering / product owner

## Context

This repo is a chassis for real client marketplaces, not a toy demo of Medusa defaults. Starter kits and framework recipes often leave broken happy paths (for example guest checkout email that does not become a loginable customer, duplicate customers for one email, orders invisible after register). Calling that "normal" or "how Medusa works" is not acceptable for anything we ship or show as ready.

## Decision

1. **Never normalize nonsense.** If a flow would force clients or end users into manual sync, order-ID transfer as the happy path, duplicate accounts for one email, or blank checkout while logged in with known profile data, treat it as a **defect**, not documentation of expected behavior.
2. **One customer per email** in the store. Guest purchase and later register/login with the same email must end as **one** customer identity with prior orders attached. Manual per-order transfer is recovery only, never the product story.
3. **Logged-in checkout must use the customer.** Name, email, and saved addresses in region must pre-fill; the user is not a stranger after login.
4. **"Medusa default" is not a product decision.** Defaults are a starting point. If the default fails the bar, we extend Medusa (workflows, auth link, storefront) until the happy path is coherent.
5. **Agents and humans** must not excuse broken UX with "common in ecommerce" or "fine for a PoC" when the stated goal is a serious chassis. Flag, fix, or explicitly park with a defect label in `docs/plan.md`. Do not teach workarounds as the path.

## Consequences

- Guest → account linking and checkout pre-fill are **mandatory** before calling the vertical slice client-ready (`docs/plan.md` Now).
- Spike and demo language must distinguish "works enough to learn" from "ready to sell." Only the latter may be presented to stakeholders as the product.
- New features inherit this bar: multi-vendor, house portal, and factory flows are invalid if they rely on nonsense happy paths.
