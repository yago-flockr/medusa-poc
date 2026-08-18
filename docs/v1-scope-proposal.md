# Spine first — a path to a 3-month marketplace v1

> Scope proposal for client discussion, not an engineering spec. Written
> against `docs/plan.md` and the feature briefs in `docs/features/` — every
> simplification below is something those documents already treat as
> deferrable, not a new cut invented for this proposal. Also published as a
> designed artifact for sending by email/PDF; this file is the same content
> in plain form for future discussions.

Three months won't fit the whole marketplace spec at full depth, and it
shouldn't try to. This maps a v1 that keeps every promise the spec actually
requires, and simplifies only the parts the spec itself treats as gradual —
or that need the client's answer before we can build them at all. Nothing
below is a workaround. Each simple path is the foundation the fuller version
reads from later, not something that gets torn up.

## 1. What's already solid

The part of a marketplace that has no shortcut — vendor identity, isolation,
and the order actually splitting per vendor — is built and holding up under
testing. This was the real risk. It's behind us.

- **Vendor isolation is structural, not a filter.** Every vendor query
  derives its scope from the authenticated actor, never from an id the
  request supplies — verified by deliberately trying to reach another
  vendor's product and getting a clean 404, not a data leak.
- **A vendor can list a real, sellable product.** Options, per-variant
  pricing, per-variant images and thumbnails, SKUs — tested end to end, not
  just the happy path.
- **One basket, one payment, splits per vendor.** Proven in a working spike:
  two vendors in one cart, one payment, two independent order-parts —
  including safety against a retried or duplicated payment.

## 2. Simplify safely for v1

For each area: what the full spec eventually wants, the simple version we'd
ship first, and why shipping it simple doesn't cost us anything later.

### Commission & payouts — Simplify

- **Full version:** scheduled, automatic payout runs per vendor, held back
  for a return window, reconciled against refunds.
- **V1 path:** record what each vendor earned the moment an order is placed
  — a ledger entry, not a payment. Pay vendors outside the system: a monthly
  export, a bank transfer someone runs by hand.
- **Why this is safe:** the spec's own acceptance test says a simulated
  payment is enough — the point is that the numbers are right and
  reproducible, not that money actually moved. A real payout engine later
  just reads the ledger we're already building; nothing gets rebuilt.

### Vendor onboarding — Simplify

- **Full version:** vendor applies or is invited by email, self-serve
  acceptance, branded onboarding flow.
- **V1 path:** staff creates the vendor account directly — already built and
  working. "Invited, not self-registered" is satisfied by a person doing the
  inviting, no invite email or UI required yet.
- **Why this is safe:** a future invite flow is a thin layer in front of
  account creation, which doesn't change.

### Product approval — Simplify

- **Full version:** a dedicated approval queue, revision requests back to
  the vendor, notifications.
- **V1 path:** already built — a vendor's product lands as "proposed," staff
  flips it to "published" from the ordinary admin product list, which
  already doubles as the approval queue.
- **Why this is safe:** no new data model needed later — just a nicer queue
  view in front of the same status field.

### Shipping & fulfillment — Simplify

- **Full version:** real carrier integration, labels generated on our
  account, live tracking handed to the customer automatically.
- **V1 path:** manual fulfillment — a person marks a part "shipped" and
  types in a tracking number. No carrier API.
- **Why this is safe:** the commerce engine's fulfillment step is built to
  be provider-swappable — this is an intended seam, not a corner we're
  inventing.

### Returns & refunds — Simplify

- **Full version:** customer-facing return request, vendor inspection step,
  per-vendor return windows.
- **V1 path:** staff processes returns by hand, refunding the correct
  vendor's part directly. "One refund never touches another part" already
  holds — it's native behavior on an order that's already split.
- **Why this is safe:** a self-service return flow would sit on exactly this
  same per-vendor order data. We're deferring the front door, not the
  mechanism behind it.

### Tax & duty — Simplify

- **Full version:** a real-time tax and duty calculation service, aware of
  per-country rules.
- **V1 path:** flat, manually configured rates per region — supported
  natively, no extra work to wire up.
- **Why this is safe:** which tax provider we'd use was always an open,
  swap-later decision, not something v1 was ever going to settle.

### Vendor catalogue import — Simplify

- **Full version:** a vendor connects a store or feed it already runs
  elsewhere; the catalogue syncs on its own.
- **V1 path:** manual entry only — already built and tested, full variant,
  pricing and image support.
- **Why this is safe:** how a vendor's catalogue arrives was already an open
  question, not a settled requirement we're walking back.

### Stock & inventory per vendor — Simplify, but watch this one

- **Full version:** each vendor's stock counted separately, held on order,
  released on cancel, live availability shown before and after checkout.
- **V1 path:** everything sells as available-to-order. A rare oversell is
  handled by hand — apologize, refund that line.
- **This one's different:** it's not technically harder to build later —
  it's the one item here with a real customer-facing cost *today* if a
  vendor genuinely sells out. Fine while vendor count and volume are small
  and vendors self-track their own stock; worth a real answer sooner than
  the others if the marketplace is expected to scale past a handful of
  vendors quickly.

## 3. Decisions only the client can make

A few of the paths above can only go as far as a flat, placeholder version
until these are answered — not because the engineering is hard, but because
the answer is commercial. Guessing risks building the wrong shape twice.

1. **How is a sale actually divided?** Commission rate, and who absorbs
   shipping cost, discounts, payment fees and chargebacks — vendor or us.
2. **When does a vendor actually get paid?** On dispatch, on delivery, or
   after the return window closes — and how long do we hold funds first?
3. **Who's the legal seller, market by market?** And who's responsible for
   import duties where that applies.
4. **What's the return window, and who approves one?** Can it differ by
   vendor, and who inspects a returned item before a refund goes out.
5. **Does a vendor set its own price, or sell at ours?** Changes whether
   pricing is a vendor permission or a catalogue rule we enforce.

**The ask:** short, plain answers — even rough placeholders — not a finished
policy. A rough answer now beats a precise one after we've already built
against a guess.

## 4. What never moves, however far down this list we cut

None of the simplifications above touch the promises the spec treats as
non-negotiable. These hold today, unaffected by anything on this page.

- Two vendors, provably unable to see each other's data.
- One basket, one payment, however many vendors are in it.
- A refund against one vendor's part never touches another's.
- The same basket can never produce two orders.
- Every money-moving action can be traced back afterwards.

---

Every path on this page is additive: the fuller version is a system built
*on top of* what v1 ships, reading the same data, never a rewrite of it.
Cutting scope here means choosing what stays manual for now — not choosing
what we'll have to undo.
