# Spike (research, not implementation): should we adopt Mercur instead of our own Vendor/Consignment build?

> Research only — no code changed for this. Triggered by a context change (see
> `docs/plan.md` Decisions): Sensus is no longer the client; the team is
> continuing the project on its own initiative. That reopens a question that
> was previously moot: are we hand-building something Medusa's own ecosystem
> already solved well?

## The question

Is our custom `Vendor`/`VendorUser` module (+ custom actor type) a workaround
for something Medusa already provides — and separately, should we adopt
[Mercur](https://mercurjs.com) (an open-source, Medusa-based marketplace
platform) instead of continuing to hand-build vendor/commission/payout
features ourselves?

## Finding 1 — our Vendor/VendorUser module is not a workaround

Confirmed via `ask_medusa_question` against current docs. Medusa's own
Commerce Modules list (Auth, Cart, Order, Payment, Product, Pricing,
Promotion, Region, Sales Channel, Stock Location, Store, Tax, User, ...) has
**no** Vendor/Seller/Marketplace module. Medusa's own [marketplace
recipe](https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors)
says explicitly: *"you can create a marketplace module that implements
custom data models, such as vendors... Medusa supports creating custom actor
types."* That is exactly our shape (`src/modules/vendor`, `authenticate("vendor", ...)`).
Not a workaround — Medusa's own documented, recommended pattern.

## Finding 2 — Mercur is real, and Medusa's own team promotes it

[medusajs.com/marketplace](https://medusajs.com/marketplace) and a Medusa
blog post ("Get started with Mercur 2.0 on Cloud") point to Mercur as *the*
marketplace platform built on Medusa. MIT-licensed, actively maintained
(2.3.0 released 2026), built by a dedicated team — not a hobby project.

## Finding 3 — Mercur's staff/admin tooling is more complete than ours today

This was Yago's specific worry (does Mercur give staff enough control?). It
doesn't hold up — Mercur's Admin Panel (separate from its Vendor Panel) has:

- Role-based access control for staff roles.
- A global, cross-vendor order view (vendors see only their own line items).
- Dispute management (buyer/vendor claims, evidence, structured resolution).
- Commission rule configuration (min/max per item, tax-inclusive toggle),
  with commission lines trackable per order.
- Seller management: suspend/activate, view all their data, edit vendor
  details.
- A request-handling queue: vendor registrations, product approvals,
  returns, reviews, cancellations — a generalized version of the single
  product-approval gate we've built so far.

None of this is a reason to avoid Mercur. If anything it's ahead of where
our own admin tooling is today.

## Finding 4 — Mercur's order-splitting is a different foundational bet, not a better version of ours

Mercur still splits a cart into **child orders**, one per seller, "linked
under one order group with a shared display id" — the same shape
`docs/spikes/multi-vendor-order.md` tested and rejected after finding real
bugs (missing stock reservations, promo codes not forwarded, refunds
no-op'ing on a payment-less child order).

The likely reason it works for Mercur: sellers "connect payment accounts"
and payouts are tracked per seller — real per-seller payment splitting
(Stripe Connect-shaped), which is exactly the missing piece that made child
orders break for us. Mercur's shape only holds together *because* it made a
different bet than we did: **per-seller payment from day one**, vs. our
**centralized payment, scheduled payout** (a Sensus requirement — see
`docs/plan.md`, "Money that can always be explained" / payout timing).

This means adopting Mercur isn't "swap one module for a better one" — it's
adopting a different payment architecture. Worth knowing before committing,
since centralized payment was previously a fixed requirement, not a
preference; that constraint may or may not still apply now that Sensus is
gone (open question, not yet decided — see `docs/plan.md`).

## Finding 5 — unresolved: can Mercur be added to an existing app, or is it a rewrite?

Genuinely unclear from the docs, and I won't guess on something this
consequential:

- Mercur's own README and install docs push everyone toward
  `bun create mercur-app@latest` — scaffolding a **new** project.
- A plugin-style config exists (`{ resolve: '@mercurjs/b2c-core', options: {} }`
  in `medusa-config.ts`, Medusa's normal plugin mechanism), which suggests
  it *might* be addable to an existing app.
- Nothing documents what happens when that plugin meets an app that already
  has its own custom Vendor module and real data — our exact situation.

## Recommendation — spike it before deciding, don't guess from docs

Matches this project's own established method (`docs/spikes/` exists for
exactly this reason): before committing to either "stay" or "migrate,"
spend a short, timeboxed (half-day to one day) spike — add `@mercurjs/core`
to a throwaway Medusa app and see concretely what it creates, whether it
conflicts with a pre-existing custom Vendor module, and what a real
migration would actually cost. Decide from that evidence, not from
marketing pages or README framing.

## Decision (this session) — not now

Per Yago: finish the current workflows/routes refactor this week; next week
is storefront/UI work (markets, influencer discovery/onboarding). Whether to
continue the project at all is still open. **If** it continues, a Mercur
migration is on the table as a deliberate future decision — not something to
start now, and not something to let block current work. Revisit this file
when that question actually comes up again; re-verify everything in it
first, since Mercur ships fast (already on 2.3.0) and this could go stale.
