# Feature: a vendor's Shopify store as its catalogue

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`. Parent brief: `docs/features/multi-vendor-marketplace.md`.
> Technical shape and feasibility work: `docs/spikes/vendor-shopify-sync.md`.

**Status:** agreed in principle, unproven
**Scope:** optional per clone — a clone with no Shopify-connected vendors doesn't need it; a vendor without a connected store still works via manual entry

## What we want

A vendor's own product catalogue, imagery, variants and stock reach our marketplace
straight from the Shopify store they already run, without anyone at the vendor or on
our staff re-typing it into us. The moment we sell one of their items, their own
Shopify reflects the reduced stock and holds a record of that sale ready for them to
pick, pack and ship — exactly as if the sale had happened on their own store.

## Why

A vendor already maintains their catalogue somewhere. Asking them to also keep a
second copy of it current inside our system by hand duplicates their work, drifts out
of date fast, and was, in the client's own words, the single most-requested capability
from the brands they've already talked to. It also removes an entire piece of work
from our side: a vendor-facing catalogue-management screen we would otherwise have had
to build, and then keep supporting, disappears — the vendor already has one, on
Shopify.

## How it must work

**Connecting.** During onboarding, staff generate a private connection for that
vendor. The vendor authorises it from inside their own Shopify — this is not a public,
self-service install; a vendor cannot connect themselves without a link staff gave
them.

**Bringing the catalogue in.** Once connected, the vendor's existing products,
variants, images and stock start appearing in our system automatically, exactly as if
they had been entered by hand — including going through the same review before
customers can see them (see "Approval" below).

**Staying current.** Any change the vendor makes on their own Shopify — new stock, a
new product, a price change, a new variant, taking something down — arrives here
without staff or the vendor doing anything extra to trigger it.

**Approval.** A synced-in product is held back from customers until staff review it,
the same review a manually entered product already goes through. The source of the
data changes; the review step does not.

**Selling.** When a customer buys one of that vendor's items through us, their Shopify
stock drops by the quantity sold and a record of the sale appears there for the vendor
to fulfil — the same place they'd see an order from any other channel they sell
through.

**Fulfilling.** The vendor dispatches from their own Shopify as they normally would.
Dispatch and tracking information they record there reaches us and the customer
without anyone asking for it.

**Disconnecting.** If a vendor's connection breaks or is revoked, staff can see which
vendor and since when. What we already showed customers from that vendor does not
silently disappear or go blank; it simply stops being kept current until the
connection is restored.

## Rules we already know

- **The vendor's Shopify is the source of truth for their own product data, imagery,
  variants and stock.** We never overwrite it with our own view of the truth.
- **We only ever tell a vendor's Shopify that a sale happened** — a quantity sold, an
  order to fulfil. We never push our own stock count into their store.
- **Staff approval applies identically regardless of where a product came from.**
  Nothing about the review step changes because a product arrived via sync instead of
  by hand.
- **Returns and payouts are never sent back to a vendor's Shopify.** Those stay
  entirely on our side, start to finish.
- **A vendor keeps selling on their own Shopify at the same time as through us.** Both
  places must agree about what's actually in stock.
- **Connecting a vendor is staff-driven, not self-service.** A vendor cannot connect
  their own store without a link staff generated for them during onboarding.

## What each audience sees

**Vendor** — nothing new to learn. They keep running their Shopify store exactly as
before; our sales just show up there as orders like any other channel.

**Customer** — no visible difference. Buying a Shopify-connected vendor's product
looks identical to buying anything else in the marketplace.

**Our staff** — which vendors are connected, whether each connection is currently
healthy, and the same approval queue they already work for every vendor's products,
regardless of source.

## When it goes wrong

- **A vendor's Shopify connection breaks or is revoked.** Sync pauses; staff can see
  which vendor and since when; what customers already see from that vendor stays as
  it last was rather than vanishing.
- **Someone buys the last unit through us at nearly the same moment someone else buys
  it on the vendor's own Shopify.** This is a known risk with no agreed answer yet —
  see Open Questions.
- **A vendor's synced product is missing something we require** (for shipping, duty,
  or accessibility). It doesn't reach customers, exactly as a manually entered
  incomplete product wouldn't.
- **A vendor changes a product after a customer already bought it.** Unaffected by
  this feature — it governs catalogue and stock, not orders already placed.

## Open questions

- **Blocking — what happens when a sale on our marketplace and a sale on the vendor's
  own Shopify race for the same last unit?** No agreed answer yet: a short hold, or
  accepting the rare double sale and refunding one side.
- **Can we ever show a different price than the vendor's own Shopify says, or must
  their price always be what the customer pays?** Unconfirmed with the client. The
  same question as `docs/features/multi-vendor-marketplace.md`'s "does a vendor get
  its own pricing," specific to the Shopify case.
- **Does every vendor actually connect this way, or does some initial catalogue keep
  arriving by spreadsheet as an ongoing alternative, not a one-time convenience?**

## How we know it works

A vendor's real Shopify store is connected once. Their existing catalogue appears here
awaiting approval without anyone typing it in. Approving it makes it visible to
customers. Buying one of those items reduces stock on the vendor's actual Shopify and
produces a record they can fulfil from. The vendor changing their own stock updates
what we show, without staff touching an admin screen to make that happen.

## Out of scope

Bringing in a vendor's historical orders, customers or discounts from Shopify.
Anything about how a vendor runs their own Shopify beyond what crosses this boundary.
Generalising this to any commerce platform other than Shopify — revisit only if a real
vendor needs a different one.

## Related

- `docs/features/multi-vendor-marketplace.md`
- `docs/features/commission-and-payouts.md` — why a sale's money never crosses this
  boundary either
- `docs/spikes/vendor-shopify-sync.md` — feasibility work and the technical shape
- `docs/plan.md` — Decisions (the auth model and sync direction are already settled
  there)
