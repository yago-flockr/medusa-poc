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

- **Medusa v2 is the commerce foundation.** Catalogue, pricing, cart, checkout,
  orders, customers, stock, payments and fulfilment are its job. We build around
  it, never a second commerce system beside it.
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

Where it is hosted, and by whom · who processes payments · who pays vendors · who
calculates tax and duty · which carrier prints labels · where editorial content is
authored · which search service · who sends email · which UI component library ·
how many countries a clone opens in.

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

- When does a vendor become eligible to be paid, and how long do we hold funds?
- How are shipping, discounts, payment fees, refunds and chargebacks divided
  between us and the vendor?
- What does the customer pay for shipping when one basket becomes several parcels?
- Who is the legal seller in each country a clone opens in, and who handles import
  duties?
- Where do returns go, who inspects them, and when is the customer refunded?
- Does a vendor's catalogue arrive by hand, by upload, or by connecting a store it
  already runs elsewhere?
- Do vendors share stock with other sales channels? If so, who is right when two
  systems disagree?

## Decisions

- **ESLint + Prettier** for lint and format (keep `@medusajs/eslint-plugin`; no Biome).
- **Backend first.** Frontend tooling is a separate track and does not gate
  progress on the commerce model.
- **The order container is still open** — one order per vendor, or one order holding
  a record per vendor. This is the decision everything downstream inherits, so it
  gets settled by experiment rather than argument:
  `docs/spikes/multi-vendor-order.md`.
