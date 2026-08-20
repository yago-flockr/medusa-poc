# What we are building

> **Draft.** What the product has to do, and what is already settled. Not a
> progress tracker — work in flight is tracked outside this repo.

**Objective:** one commerce base, cloned per brand. Each clone keeps the shared
engine and swaps what is brand-specific.

This file says **what** and **what is fixed**. How to build it in this repo:
`agents/`. Learning path: `docs/study/README.md`. Detail per capability:
`docs/features/`.

## Fixed

Non-negotiable. Either Medusa requires it, or there is no alternative that meets a
requirement we cannot drop. Everything else is shaped around these, so an agent
should treat them as constraints rather than choices.

- **Medusa v2 is the commerce foundation for our own marketplace storefront**
  — cart, checkout, orders, customers, payments, and the aggregated
  marketplace catalogue a customer actually shops. This is narrower than it
  used to read: for a Shopify-connected vendor, **their own Shopify store is
  the source of truth for that vendor's product data, imagery, variants and
  stock** — Medusa syncs it in (read) and pushes a sale back out (write) via
  the Shopify Admin API, the same way any other upstream system feeds a
  cache. This doesn't reopen "never a second commerce system": Medusa still
  owns every commercial fact *our* storefront and checkout depend on: our
  own pricing/curation layer, the aggregated availability we show, the
  order split per vendor, commission. What changed is that a vendor's own
  catalogue/stock is no longer typed into ours by hand or by a bespoke
  vendor panel — it arrives via sync, same as this file's own "Not decided"
  question about catalogue arrival always said it might. See Decisions
  below.
- **TypeScript on Node.** Follows from Medusa; the backend has no other language.
- **PostgreSQL.** Medusa's requirement, not a preference.
- **A Redis-compatible service in production**, for events, background queues,
  caching and locking. Medusa's built-in defaults are in-memory and only work in a
  single process, which is not what production looks like.
- **Web and background work run as separate processes in production.** Scheduled
  work and event handling must not share a process with customer traffic. This is
  Medusa's scaling model, not a tuning option.
- **The commerce engine is the source of truth for anything commercial.** Anything
  else holding product or price data is a cache or a presentation layer, and is
  never trusted for a final price or an availability answer.
- **Next.js for the storefront, server-rendered.** Discovery matters too much to
  ship a client-rendered store. (The underlying non-negotiable is server-rendered
  HTML; Next.js is our settled way of getting it, and we are not revisiting it.)
- **Every surface talks to the commerce engine over its API.** Storefronts, portals
  and back-office extensions are clients. Nothing reaches around the engine into
  the database.
- **We never touch raw card data.** Card capture happens inside a compliant
  provider's boundary. Which provider is open; this is not.
- **Nothing non-essential runs before the customer consents.** A legal requirement
  in the markets we care about, so it is a constraint on how the storefront is
  built, not a feature to add later.
- **Marketplace support is optional.** It lives in this base, but a clone that does
  not sell through vendors must still boot and work.

## Not decided

Naming any of these now buys nothing and costs rework. Keep the code neutral: no
host-specific setup, and no provider assumption leaking past the boundary where it
belongs.

Who processes payments · who pays vendors · who calculates tax and duty · which
carrier prints labels · where editorial content is authored · which search
service · who sends email · which UI component library · how many countries a
clone opens in.

Hosting itself is no longer on this list — see Decisions below. What stays
open per clone is only the account/billing specifics (custom domains, plan
tier), not the platform.

The distinction that matters: a fixed item has no real substitute, while everything
here has several good ones and swapping later should cost a day, not a rewrite.

## What we need

Each area is a capability, not a task. Detail and business rules live in the linked
brief. No clone needs all of it — this exists so a clone can be scoped honestly
instead of discovering the hard parts late.

Grouped by priority, not alphabetically. The spine has no substitute and has to be
proven before anything else is worth building on top of it. The customer-facing
layer is what actually differentiates one clone from another, and can start
simple. Trust, operations and insight harden what already works, and can mature
after launch. A short deadline changes how far down this list a clone gets, never
the order — cut scope from the bottom, not by skipping the spine to reach the
surface faster.

### The marketplace spine — prove this first

**A brand sells through us, and other brands sell through it too.**
Vendors register, are approved, list their own products, and sell alongside
everyone else under one storefront. Each keeps a share of the sale; we keep a
commission. → `docs/features/multi-vendor-marketplace.md`

**One basket, one payment, however many vendors.**
The customer shops across vendors, pays once, and tracks one purchase. Behind that,
the order divides into one part per vendor, and each part lives its own life: one
may ship today, another may be made to order, a third may turn out to be
unavailable — and none of that disturbs the others.
→ `docs/features/multi-vendor-marketplace.md`

**Money that can always be explained.**
Every sale splits into what the vendor earns, what we keep, and what covers
shipping, discounts and fees. Vendors are paid on a schedule, not the moment a
customer checks out, so refunds and returns settle first. Any balance we ever
showed a vendor must still be reproducible months later.
→ `docs/features/commission-and-payouts.md`

**Vendors see their own business and nothing else.**
A vendor manages its catalogue and stock, works its own orders, prints labels and
reads its own statements, and can never reach another vendor's orders, customers or
performance. → `docs/features/multi-vendor-marketplace.md`,
`docs/features/identity-and-access.md`

**We control what gets published.**
Vendors create products; we approve them before customers see them. Changes that
affect what a customer was promised go back for review; routine stock updates do
not. A vendor may be limited in how many products it can list at once.
→ `docs/features/multi-vendor-marketplace.md`

**Stock that is honest.**
Each vendor's stock is tracked separately, held when an order is placed, and
released when it is cancelled. The customer is told the truth about availability
when adding to the basket and again at checkout, with a defined path for when the
answer changes in between. → `docs/features/multi-vendor-marketplace.md`

**Shipping the customer can understand.**
One basket may become several parcels. The customer needs to know what they are
paying and why their order arrives in pieces. Labels are produced centrally on our
account so we keep control of cost and tracking — vendors pack, they do not choose
couriers. → `docs/features/multi-vendor-marketplace.md`

**Returns and refunds that stay contained.**
A customer returns one item, not an order. We decide eligibility, where it goes,
who inspects it, and when the money goes back. A partial refund never disturbs the
rest of the order, and we recover from the vendor separately.
→ `docs/features/multi-vendor-marketplace.md`

**Knowing who someone is, and what they may touch.**
A customer, a vendor's staff, and our own staff are three separate identities with
three separate proofs of who they are. A vendor is invited, never self-registered,
and proves itself more strongly than a shopper because of what it can see. A
vendor's isolation from every other vendor is structural, not a filter someone
remembers to apply. → `docs/features/identity-and-access.md`

### The customer-facing layer — differentiates each clone

**Content that sells without owning the truth.**
Editors compose pages from blocks and write editorial that can reference real,
purchasable products, so a customer can buy from within a story. Content never owns
price, stock or availability. → `docs/features/content-and-editorial.md`

**Discovery that works.**
Search with suggestions and sensible empty results, filters that reflect how the
catalogue is actually cut, and a way to feature and pin things by hand. Filtered
pages must be linkable, shareable and crawlable, and legible to search engines and
AI shopping assistants alike. → `docs/features/search-and-discovery.md`

**Staying in touch when a customer isn't ready yet.**
A customer who cannot buy something now — out of stock, an event at capacity — can
leave their interest and be told when that changes. A customer who bought
something can leave a review that honestly carries whether they actually bought it.
→ `docs/features/notifications-and-capture.md`

### Trust, operations and insight — harden after the spine works

**Trust and compliance.**
Consent asked before anything non-essential runs, granular, withdrawable and
recorded, geo-aware where regimes differ, and carried across the seam into a
hosted checkout. Accessibility treated as a requirement, not a pass at the end.
Public forms protected from abuse. A stated position on what we keep, for how
long, and how a customer gets their data or has it erased.
→ `docs/features/consent-and-privacy.md`, `docs/features/identity-and-access.md`

**Operations we can run without engineers.**
Staff can see what happened to an order, spot an exception, and correct it
themselves. Financial and operational actions leave an audit trail. Alerting points
at what actually breaks here: order splitting, payment runs, stock accuracy, and
failures at the boundary with someone else's system.

**Numbers the business can act on.**
What sells, which vendors perform, whether the way we cut the catalogue really
drives discovery, how often baskets span vendors and what that does to cost, and
whether vendors dispatch on time. → `docs/features/analytics-and-reporting.md`

## What "working" means for the marketplace

The hard part is unproven, so it is worth being exact about what would convince us.
All of it is stated as behaviour, so it stays true whatever we build it with.

Two vendors exist and cannot see each other's data. Each one's stock is counted and
held separately. One basket spans both and takes a single customer payment, and the
order then divides into one part per vendor. The status the customer sees is worked
out from those parts rather than kept beside them, so it can never contradict them.
One vendor accepts while the other cannot supply: that line is refunded and the
rest of the order carries on untouched. Cancelling releases the stock it was
holding. A refund against one part leaves the other part's money alone. Each
vendor's earnings are recorded the moment the order is placed, a payment run
settles them, and a later refund adjusts what they are owed next. Paying for the
same basket twice cannot produce a duplicate order. And afterwards, someone can
read the history of all of it and understand what happened.

Two independent outside parties specified this same loop before we did, which is
the best evidence available that it is the right bar.

## Open questions

Commercial decisions, not technical ones. Each belongs to a clone, and each changes
what gets built.

Most of these have now been answered by Sensus specifically — see
`docs/sensus/Sensus Questions.md` for the full text of each answer. Kept here
in short form, with what's genuinely still open flagged as such:

- **Vendor catalogue arrival — answered.** By connecting the vendor's own
  Shopify store, not by hand or upload. Two-way sync (product, stock, order,
  fulfilment-status) is treated as core, not optional.
- **Stock shared with other sales channels — answered, implicitly.** A
  vendor keeps selling on their own Shopify too, so yes. Their Shopify is
  authoritative for their own stock; we sync it in read-only and never write
  a stock *level* back, only a sale's decrement.
- **Shipping/commission/fee division — answered.** Per-brand commission
  rates, applied at line level, net of refunds and chargebacks. Exact
  numbers (whether commission includes processing/FX fees) still
  commercial, not technical.
- **Returns — answered.** Customer-initiated, per-item/per-consignment,
  reason-based responsibility, brand-configurable windows. Exchanges/store
  credit are fast-follow, not launch.
- **Payout timing — answered in shape, not in exact numbers.** Scheduled/
  delayed, so refunds and chargebacks settle first. Exact timing is a
  Phase 0 item.
- **Legal seller / import duties per country — still open.** DDP is
  confirmed at checkout for UK/EU/US; who is the legal seller of record
  isn't stated yet.
- **New, still open: does every launch brand actually connect via the
  Shopify sync, or does some of the initial catalogue arrive by
  spreadsheet instead?** `Sensus Questions.md` Q17's answer says the
  initial catalogue load (~30 brands) happens "via the connector **or**
  spreadsheet templates" — phrasing that implies not every brand is
  Shopify-sync-connected, at least not from day one. If spreadsheet import
  is a one-time convenience for brands that go on to connect Shopify
  shortly after, nothing changes. If it's meant to stay an ongoing parallel
  path for brands that never connect Shopify, we still need some kind of
  bulk/manual catalogue entry capability alongside the sync — which the
  current plan assumes is fully retired. Worth a direct answer before
  assuming every brand is sync-only.
- **New, still open: what is the "house-portal" mentioned in the design
  handoff?** Q18's answer lists design deliverables as "~14 customer-facing
  templates plus the house-portal and admin templates" — naming it
  separately from "admin templates" suggests a third UI surface distinct
  from both the customer storefront and Medusa Admin. This directly
  touches the "exactly two deployables" decision below: if "house-portal"
  means custom-designed screens for Medusa Admin itself, that decision
  holds unchanged; if it means a separate staff/finance tool with its own
  templates, that's new scope not currently accounted for anywhere in this
  plan. Needs a plain definition, not an assumption either way.
- **Genuinely still open, and load-bearing: how does "Shopify Payments,
  customer-side" (the client's answer) reconcile with our own storefront and
  checkout owning the sale?** Shopify Payments is a gateway that, as far as
  we've found, only works through Shopify's own checkout — it isn't
  offered as a standalone payment API the way Stripe is. If the mandate is
  literally that gateway, our checkout may need to be a *headless Shopify
  checkout* (Shopify Storefront API / Shopify Checkout) rather than
  Medusa's own payment/order flow — which would be a materially different
  build than "Medusa processes the sale, then notifies each vendor." Needs
  resolving before the checkout architecture is settled, not discovered
  mid-build.
  - **A resolution worth proposing back, not assuming:** Sensus collects the
    customer's payment centrally, on our own storefront, through whatever
    PSP we choose — the same assumption this whole plan already made before
    "Shopify Payments" came back as an answer — and pays each vendor out
    later through the commission/payout ledger that's already planned
    (`docs/features/commission-and-payouts.md`). This keeps checkout ours to
    build, sidesteps the headless-Shopify-checkout question entirely, and
    everybody still gets paid — the vendor just gets paid by Sensus instead
    of by Shopify Payments directly. It reverses the client's given answer,
    though, so it needs their explicit sign-off, not a silent substitution.
- **Sync scope — answered, corrected from an earlier draft of this
  question.** `Sensus Questions.md` Q1/Q2 already cover this: two-way sync
  means product import (incl. pricing, since the brand's Shopify is source
  of truth for "product data"), stock, order and fulfilment-status —
  **returns and payouts are explicitly handled Sensus-side and are not
  synced back into a brand's Shopify.** Confirmed separately via Shopify's
  own docs that there's no prescribed standard either way for
  restock-on-cancellation (the mechanics exist — `orderCancel`'s `restock`
  flag — but using them is the integrator's call) — moot here since Sensus
  already ruled out syncing returns back at all.
- **Public Shopify app vs. a private link per vendor — decided internally,
  not a question for Sensus.** See Decisions below: v1 uses a private
  custom-app install link per vendor, generated by staff during onboarding.
  Not raised with the client because their original proposal already
  implied manual install and they raised no objection — bringing a public
  App Store submission into scope now, on a build we haven't scoped or
  timed, would be introducing risk nobody asked for.

## Decisions

- **ESLint + Prettier** for lint and format (keep `@medusajs/eslint-plugin`; no Biome).
- **Backend first.** Frontend tooling is a separate track and does not gate
  progress on the commerce model.
- **The order container is still open** — one order per vendor, or one order holding
  a record per vendor. This is the decision everything downstream inherits, so it
  gets settled by experiment rather than argument:
  `docs/spikes/multi-vendor-order.md`.
- **Deploy on Medusa Cloud. Exactly two deployables: the backend (which
  includes Admin) and the storefront.** This was already assumed in
  `medusa-config.ts` and `agents/backend.md` (`EXECUTION_CONTEXT=medusa-cloud`,
  the Node 22 pin for it, the storefront-root setting) well before it was
  written down here — this entry just makes it a stated decision instead of
  an implicit one. Concretely, Cloud hosts one Medusa application (server +
  Admin dashboard, bundled — Admin is never a separate deploy) plus one
  Next.js storefront, both built from this monorepo via push-to-deploy, with
  automatic CORS/env-var wiring and a preview environment per PR for each.
  **Any new UI surface that comes up (a vendor portal, a partner-facing page,
  anything) is built as an isolated route segment inside the existing
  storefront app first** — isolation between actor types (customer, vendor,
  staff) is enforced in code (separate auth cookie, separate layout, never a
  shared session), not by standing up a separate deployable. Only reach for a
  genuinely separate app if a real, specific requirement rules this out (a
  need for a different framework Cloud doesn't support as a storefront, a
  hosting requirement one surface has that the others can't share) — never by
  default. This directly reverses an earlier session's choice to build a
  standalone `apps/vendor-portal` Vite SPA for testing the vendor actor type;
  that app was deleted and its functionality now lives at `/vendor` inside
  `apps/storefront`.
- **Superseded — kept for the reasoning, not the outcome.** The `/vendor`
  route segment (vendor-facing product/order management UI) described below
  was built, then deleted once Sensus's answers confirmed each vendor
  manages their own catalogue through their own Shopify store, not through
  us. A vendor never needs a panel from us for that; see the new Shopify
  sync decision below for what replaces it.
- **The `/vendor` route segment is built SPA-style on purpose: plain
  browser-side `fetch`, JWT in `localStorage`, no Server Actions, no
  server-fetched data.** Considered and rejected first: MercurJS's actual
  production pattern (a second React SPA — its Vendor Panel — built and
  bundled into the _backend's_ build output, served by the same Medusa
  process at its own path, same origin as the API, no CORS). That's the more
  conceptually correct shape long-term — a vendor back office belongs with
  the engine, not the swappable per-brand storefront — but Medusa core has no
  built-in mechanism for a second bundled dashboard; Mercur built that
  static-bundling infrastructure themselves, and replicating it here would be
  new custom infrastructure for a feature that isn't past the spike stage.
  Building `/vendor` SPA-style instead of using the storefront's normal
  Server Action / httpOnly-cookie pattern is deliberate, for the _same_
  reason: if `/vendor` is ever promoted to Mercur's shape (or any standalone
  deploy), a real SPA needs client-side `fetch` and a client-readable token
  too — so the data/auth layer already matches what that migration needs
  today, and only the wrapping project (Next.js route vs. a separate app)
  would ever need to change, not the logic inside it. The accepted costs of
  this choice, now: `/vendors/*` needs its own CORS handling
  (`VENDOR_CORS`, `src/api/vendors/cors.ts`) since the browser calls it
  cross-origin; and the vendor's JWT sits in `localStorage`, readable by any
  JS on the page (weaker than an `httpOnly` cookie against XSS) — acceptable
  while the vendor portal has no invite flow or approval flow yet, worth
  revisiting (shorter-lived tokens, a refresh flow) once it's closer to real
  production use. A third cost surfaced in practice, not anticipated up
  front: a vendor creating or publishing a product happens entirely outside
  the Next.js server, so it can never call `revalidateTag`/`revalidatePath`
  — the customer-facing product listing's cache has no way to know a vendor
  product now exists. Fixed by bounding that one fetch's staleness instead
  (`lib/data/products.ts`, `revalidate: 60`) rather than inventing a
  cross-app invalidation signal.
- **V1 connects a vendor's Shopify with a private custom-app install link,
  generated by staff per vendor — not a public Shopify app.** Installing
  one app across many stores without a per-store link only works natively
  when those stores belong to one Shopify Plus organization (confirmed via
  Shopify's distribution docs); our vendors are independent, unrelated
  merchants, so that shortcut doesn't apply. The other documented path,
  building this as a public app and going through Shopify's App Store
  review, would let a vendor self-install without staff — but that review
  timeline is unknown to us and sits on the critical path of a 3-month
  build, and self-serve install isn't even a goal here: onboarding is
  already staff-driven, not self-service (see the onboarding entry above).
  A private link is just Shopify's version of the manual onboarding step
  already planned, at zero extra build cost. This wasn't put to Sensus as a
  question — their original proposal already implied a manual install and
  they raised no objection, so there's nothing to ask. Revisit only if
  vendor onboarding volume ever makes staff generating a link per vendor
  the actual bottleneck, not before.
- **A vendor's catalogue and stock arrive via Shopify sync, not a vendor
  panel — the biggest single change from Sensus's answers.** Each vendor
  runs their own, independent Shopify store; we don't build or touch its
  UI. Our Next.js storefront stays our own build (confirmed both by the
  client's answer and by the team's own preference for it) and remains the
  actual marketplace shopping experience a customer uses — this is not
  Shopify's own storefront/theme. What changes is where a vendor's product
  data comes from: read in via the Shopify Admin API/webhooks
  (`products/update`, `inventory_levels/update` — Shopify's own documented
  pattern for exactly this "feed a centralized system" use case, not
  something we're improvising), written back out with `inventoryAdjustQuantities`
  and an `orderCreate`/`draftOrderCreate` when we sell one of their items,
  so their own stock and fulfilment queue reflect the sale. Connecting a
  vendor is an OAuth app install per store (`@shopify/shopify-api`), **not**
  a single shared API key — Shopify's terms forbid the simpler
  one-token-per-store "custom app" method across more than one merchant,
  so this needs a proper (if privately-distributed) OAuth app, not a
  shortcut. Staff approval before a synced-in product is customer-visible
  still holds and needs no new mechanism — the existing `ProductStatus`
  `proposed`/`published` gate already built for the vendor panel applies
  identically to a synced-in product; only the source of the data changes,
  not the review step. The vendor-facing product/order CRUD API and its
  storefront UI, built before this answer came back, are deleted — see the
  superseded entry above. Vendor/VendorUser as a data model, and the
  order-splitting/commission work, are unaffected: a marketplace still
  needs to know who owns a product and how to split an order and its
  payout regardless of where the catalogue came from.
- **Evaluated and rejected `@rx-ventures/medusa-plugin-shopify-sync`
  (a real, actively-maintained npm package listed on
  `medusajs.com/integrations`) as a base for the sync above — building our
  own module instead.** Checked directly against the npm registry and
  GitHub's API rather than trusting the listing: it's real and current (17
  versions since 2026-04-28), but its claimed GitHub source 404s, doesn't
  turn up in GitHub's own search, and its own `package.json` lists
  `"internal"` as a keyword — reads as an agency's internal tool that
  reached public npm, not an auditable open-source project, which matters
  for something that would hold live vendor credentials. It's also the
  wrong shape regardless of that: a single config row per Medusa instance
  (one store, not one per independent vendor), **one-way only**
  (Shopify → Medusa, no push-back of a sale — exactly the direction this
  file already decided is core), authenticated with a manually pasted
  static Admin API token (the kind Shopify has stopped issuing to new
  custom apps, not the private-per-vendor OAuth install decided above), and
  its historical-order import writes raw SQL directly against order tables
  — which this project's own "never a workaround, always the Medusa way"
  rule already rules out. Its resumable job-tracking model and its
  handling of a vendor adding a new variant option after the initial sync
  are worth reusing as technique, not as code. Full evaluation and the
  technical shape to build against: `docs/spikes/vendor-shopify-sync.md`.
