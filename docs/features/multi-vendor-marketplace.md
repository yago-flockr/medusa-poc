# Feature: multi-vendor marketplace (brands selling on our store)

> Intent brief. Plain language first, Medusa mechanics second. Not binding
> architecture. Template: `docs/features/_template.md`.

**Status:** studying
**Scope:** optional module — the base chassis boots without it; a clone enables it

## What we want

Several brands sell their products through our store. Each brand manages its own
catalogue and sees its own sales, but the customer sees one storefront, pays
once, and receives one confirmation. We handle shipping and customer service,
and money is split between us and the brand according to an agreed percentage.

## Why

It lets one deployment serve many brands instead of one store per brand, and it
is the hardest thing Medusa does not give us for free — so it is the feature that
decides whether this chassis is worth building.

## Rules we already know

- A brand manages **its own products** and sees **only its own orders**.
- The customer completes **one checkout** even when the cart mixes brands.
- **We ship.** Fulfilment is ours, not the brand's.
- A **percentage** splits the sale between us and the brand.
- Unknown: who is merchant of record, and therefore who receives the money first
  and who is refunded from. See open questions.
- Unknown: what happens to the split on partial refund, return, or cancellation.
- Unknown: whether brands need their own portal, or Admin access is enough.

## Medusa building blocks we probably need

### 1. A custom module for the brands

Medusa has no vendor concept. We own the table.

```ts
// src/modules/marketplace/models/vendor.ts
const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  admins: model.hasMany(() => VendorAdmin, { mappedBy: "vendor" }),
})
```

The service extends `MedusaService({ Vendor, VendorAdmin })`, which generates
`createVendors`, `listVendors`, and the rest. Register the module in
`medusa-config.ts`, then `medusa db:generate marketplace` and `db:migrate`.

### 2. Module links to core data

Modules are isolated, so we never add a `vendor_id` column to Medusa's product
or order tables. We declare a link and Medusa creates the join table.

```ts
// src/links/vendor-product.ts
export default defineLink(
  MarketplaceModule.linkable.vendor,
  { linkable: ProductModule.linkable.product.id, isList: true }
)
```

Afterwards Query reads across the boundary in one call:
`query.graph({ entity: "product", fields: ["vendor.*"] })`.

### 3. A workflow that splits the order at checkout

The recipe's shape: complete the cart into one **parent order**, group the line
items by vendor, and create one **child order** per vendor linked back to it.

```ts
const { id: orderId } = completeCartWorkflow.runAsStep({ input: { id: cart.id } })
const { vendorsItems } = groupVendorItemsStep({ cart })
const { orders, linkDefs } = createVendorOrdersStep({ parentOrder, vendorsItems })
createRemoteLinkStep(linkDefs)
```

The child orders carry `metadata.parent_order_id`, and the step's compensation
function cancels them with `cancelOrderWorkflow` if anything fails. The
storefront calls our route (`POST /store/carts/:id/complete-vendor`) instead of
Medusa's complete-cart endpoint.

### 4. Locking and idempotency

Checkout can be retried or double-clicked. The recipe wraps the flow in
`acquireLockStep` / `releaseLockStep` and guards the split with a `when` that
checks whether vendor-order links already exist. Skipping this produces
duplicated child orders under load, which is very hard to unwind later.

### 5. A custom actor type for brand users

Brand staff are neither `admin` nor `customer`.

```ts
authenticate("vendor", ["session", "bearer"], { allowUnregistered: true })
```

Registration goes through `/auth/vendor/emailpass/register`, and the
create-vendor workflow attaches the identity with `setAuthAppMetadataStep`.
Routes under `/vendors/*` then resolve `req.auth_context.actor_id` and scope
every query to that vendor. Note that Medusa Admin is for super admins only, so
a brand-facing portal would be a separate application.

### 6. Commission and payouts

Not covered by the recipe — this is our part. Likely shape: a second module
owning a `CommissionRule` (linked to a vendor, maybe overridden per product) and
a payout ledger row written when an order is placed or fulfilled, plus a
scheduled job that settles them. Compute the split inside the order workflow so
it is stored as a fact, not recalculated later from prices that may have changed.

## Open questions

- **Blocking — who takes the commission?** The phrasing so far is that the brand
  receives a commission, which means we are the seller and the brand is a
  consignor (we hold the money, we refund, we pay the brand out). The recipe
  assumes the opposite direction. This decides payouts, refunds, and tax.
- **Blocking — is the child order the right container?** One parent plus child
  orders is the recipe's answer. The alternative is a single order with one
  fulfilment and one consignment record per brand, which fits "we ship
  everything" better. Both are legitimate in Medusa.
- Do brands hold their own stock, or do we? That decides whether each brand gets
  a stock location and how inventory is reserved.
- One shipping method for the whole cart, or per brand? The recipe reuses the
  parent's shipping method for every child order as a simplification.
- Do brands need their own sales channel or price list?
- What does a brand see: an Admin account scoped by permissions, or a separate
  portal on the `vendor` actor type?

## How we prove it

The smallest useful experiment is a two-vendor cart producing the expected
orders, on a branch, with no storefront redesign: see
`docs/spikes/multi-vendor-order.md`. Answer the two blocking questions before
turning any of it into a module we intend to keep.

## Out of scope for the spike

Payouts and money movement, tax handling per brand, brand portal UI, brand-level
inventory, per-brand shipping selection, and anything in the storefront beyond
pointing checkout at the custom complete-cart route.

## References

- [Marketplace recipe: vendors example](https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors)
- [Example repository](https://github.com/medusajs/examples/tree/main/marketplace)
- [Modules](https://docs.medusajs.com/learn/fundamentals/modules) ·
  [Module links](https://docs.medusajs.com/learn/fundamentals/module-links) ·
  [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query)
- [Workflows](https://docs.medusajs.com/learn/fundamentals/workflows) ·
  [Compensation](https://docs.medusajs.com/learn/fundamentals/workflows/compensation-function) ·
  [Locks](https://docs.medusajs.com/learn/fundamentals/workflows/locks)
- [Actor types](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types) ·
  [Create an actor type](https://docs.medusajs.com/resources/commerce-modules/auth/create-actor-type)
