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

**Connecting.** Staff invite and approve the vendor, same as any onboarding. The
vendor then connects their own Shopify store from inside their own panel — not a
public, self-service signup (nobody gets in without being invited first), but the
connection action itself is the vendor's to take, not staff's. This is a hard
constraint, not a design preference: a private-distribution Shopify app can only be
created by someone with access to the *installing* store's own organization, so
staff was never able to do this step on the vendor's behalf.

**Bringing the catalogue in.** Once connected, the vendor sees their Shopify catalogue
and chooses what to bring across — this isn't an all-or-nothing dump of everything in
their store. Whatever they choose to import goes through the same review before
customers can see it (see "Approval" below).

**Staying current.** A Shopify-connected product's price and stock are refreshed (a)
whenever the vendor logs into their panel, (b) on a periodic schedule regardless of
whether the vendor logs in, and (c) live, right before a customer's payment for it is
taken — this last check is what actually protects against a sale racing a stock
change, not the other two. Full mechanics: `docs/plan.md` Decisions.

**Who can change what.** A product's own data — title, price, images, variants —
always comes from wherever it was created and never from the other side. If it
started on Shopify, it can only be edited on Shopify and re-synced; the vendor's
panel lets them turn it on or off here, and layer a markup or discount on top of the
synced price, but never rewrite the price itself. If it was created directly with us
(no connection, or before one existed), it behaves as it always has — fully editable
here. This is what keeps there from being two conflicting sources of truth for the
same product.

**Approval.** A synced-in product lands as `proposed`, held back from customers by
default, the same as a manually entered product. **Reversed from the original
design:** review is no longer staff-only — the vendor can approve (publish) their
own product themselves, from their own `/vendor/products` page, without waiting on
staff. Staff can still review from Admin too; that path wasn't removed, it's just no
longer the only one. The source of the data still doesn't change the rule: import or
re-sync, the review step (whoever performs it) is identical either way.

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
- **The review step applies identically regardless of where a product came from,
  or who performs it.** A product landing at `proposed` behaves the same whether it
  arrived via sync or by hand, and whether it's the vendor or staff who moves it to
  `published`.
- **Returns and payouts are never sent back to a vendor's Shopify.** Those stay
  entirely on our side, start to finish.
- **A vendor keeps selling on their own Shopify at the same time as through us.** Both
  places must agree about what's actually in stock.
- **A vendor is invited by staff, but connects their own store themselves.** Nobody
  reaches the connection step without being invited first; nobody but the vendor can
  take the connection step itself, since staff has no access to the vendor's own
  Shopify organization to do it for them.
- **A Shopify-sourced product's core data is never editable on our side.** Title,
  price, images and variants stay one-directional from Shopify. The vendor's own
  control here is limited to visibility (on/off) and a markup or discount applied on
  top of the synced price — never a rewrite of the price itself.

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

- **Answered in shape, not yet built: what happens when a sale on our marketplace and
  a sale on the vendor's own Shopify race for the same last unit?** A live check
  against Shopify runs immediately before payment is taken, so the race is caught at
  the one moment it actually matters rather than relying on however fresh our synced
  copy happens to be. See `docs/plan.md` Decisions for the full mechanics.
- **Newly open, a product decision — what happens when that live check finds the
  price has moved since the customer saw it in their cart?** Block checkout and ask
  them to reconfirm, or silently honor the new price.
- **Can we ever show a different price than the vendor's own Shopify says, or must
  their price always be what the customer pays?** Unconfirmed with the client. The
  markup/discount layered on top of the synced price (see "Who can change what"
  above) is our internal answer to "how would this work if we could" — it doesn't
  by itself resolve whether the client actually allows us to. Same question as
  `docs/features/multi-vendor-marketplace.md`'s "does a vendor get its own pricing,"
  specific to the Shopify case.
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
