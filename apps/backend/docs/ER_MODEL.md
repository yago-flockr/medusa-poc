# Backend — Entity-Relationship Model

> Persistence model for `apps/backend`. Derived from custom module sources under `src/modules/`.
> Update when schemas, references, or delete behavior change.

## Overview

- **Store:** PostgreSQL
- **ORM / layer:** Medusa module data models and migrations
- **Custom entities in this package:** `Brand` (product taxonomy; study seed for later vendor-shaped work), `Vendor` / `VendorUser` (marketplace actor type — study plan Block C1)

Commerce tables (products, carts, orders, customers, regions, etc.) are owned by Medusa core modules installed via `medusa-config.ts`. This document tracks **chassis-owned** custom models only.

This `Brand` is **not** the white-label client brand in `docs/plan.md` (one clone per client). It is a catalogue label linked to products.

`Vendor` is the marketplace seller from `docs/features/multi-vendor-marketplace.md`; it is a separate concept from `Brand` (taxonomy) even though both currently link to `product`.

## Entity-relationship diagram

```mermaid
erDiagram
  Brand {
    text id PK
    text name
    text handle UK
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }

  Vendor {
    text id PK
    text name
    text handle UK
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }

  VendorUser {
    text id PK
    text first_name
    text last_name
    text email UK
    text vendor_id FK
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }

  %% Medusa Product / Order (core) — linked, not owned here
  Product {
    text id PK
  }

  Order {
    text id PK
  }

  Brand ||--o{ Product : "link product-brand (Product isList)"
  Vendor ||--o{ Product : "link product-vendor (Product isList)"
  Vendor ||--o{ VendorUser : "users"
  Vendor ||--o{ Order : "link vendor-order (Order isList) — spike, see notes"
```

Link definitions: `src/links/product-brand.ts` — Product (list) ↔ Brand. `src/links/product-vendor.ts` — Product (list) ↔ Vendor. `src/links/vendor-order.ts` — Order (list) ↔ Vendor, from the `docs/spikes/multi-vendor-order.md` experiment (see that doc — the child-order-per-vendor shape isn't settled yet, so treat this link as provisional). No FK into Medusa tables; Medusa owns the link table.

## Entities

### Brand

| Field                                      | Type        | Notes                                                        |
| ------------------------------------------ | ----------- | ------------------------------------------------------------ |
| `id`                                       | text PK     | Medusa id                                                    |
| `name`                                     | text        | Searchable                                                   |
| `handle`                                   | text unique | Stable public key; created via `toHandle(name)` when omitted |
| `created_at` / `updated_at` / `deleted_at` | timestamptz | Soft-delete on Admin DELETE                                  |

**Delete behavior:** `deleteBrandWorkflow` dismisses product–brand links, then soft-deletes the brand. Compensation restores the brand and recreates links.

**Product link writes:** create product → `productsCreated` hook; update product → `productsUpdated` hook. Pass `additional_data.brand_id` (string to set/change, `null` to clear). The `additional_data` shape itself is standardized: each linkable entity (`brand`, `vendor`) owns a small `{entity}AdditionalData` zod fragment next to its own routes (`api/admin/brands/additional-data.ts`, `api/vendors/additional-data.ts` — one property, `nullish()`), merged into `productAdditionalDataValidators` (`api/admin/products/additional-data.ts`) and wired onto `/admin/products` via `additionalDataValidator` in `api/admin/products/middlewares.ts`, so every linkable field gets the same real, enforced request validation instead of an ad-hoc inline type. Adding a new linkable entity later means adding one file in that shape and one spread into the merge — not touching the others.

### Vendor / VendorUser

`src/modules/vendor` (`VENDOR_MODULE`). `Vendor` is the marketplace seller (the business entity — owns products/orders, never logs in); `VendorUser` is an authenticated person who acts on behalf of one vendor (custom actor type `vendor`, per `docs/study/README.md` C1). Named `VendorUser`, not `VendorAdmin` — every vendor user has equal, undifferentiated access today (see `docs/features/identity-and-access.md`'s open question on whether a vendor needs more than one internal role), so "admin" would wrongly imply a permission tier that doesn't exist yet. Adding roles later is a plain field on `VendorUser`, not a rename.

| Field                                 | Type        | Notes                                                    |
| -------------------------------------- | ----------- | -------------------------------------------------------- |
| `Vendor.id`                            | text PK     | Medusa id                                                |
| `Vendor.name`                          | text        | Searchable                                               |
| `Vendor.handle`                        | text unique | Created via `toHandle(name)` when omitted                |
| `VendorUser.id`                        | text PK     | Medusa id                                                |
| `VendorUser.first_name` / `last_name`  | text        | Nullable                                                 |
| `VendorUser.email`                     | text unique | Matches the credentials used at `/auth/vendor/emailpass` |
| `VendorUser.vendor` (`vendor_id`)      | belongsTo   | One vendor has many users                                |

**Auth wiring:** `createVendorWorkflow` (`src/workflows/create-vendor/`) creates the `Vendor` and its first `VendorUser`, then calls `setAuthAppMetadataStep` with `actorType: "vendor"` so the user's `AuthIdentity.app_metadata.vendor_id` (actually keyed by `vendor_user_id` — the actor's own id) lets `authenticate("vendor", ...)` resolve `req.auth_context.actor_id` to that `VendorUser`. Every `/vendors/*` route scopes its query from that `actor_id`, through one shared helper — `resolveVendorUser(query, actorId, fields)` in `src/api/vendors/resolve-vendor-user.ts` — rather than each route hand-writing the same `query.graph({entity: "vendor_user", ...})` lookup. It always throws `NOT_ALLOWED` if the actor doesn't resolve to a real vendor user, so that check can't be forgotten or skipped on a new route (e.g. `GET /vendors/products` resolves `vendor_user.vendor.products`) — never from a value the request supplies.

**Product ownership:** `POST /vendors/products` creates a product via the core `createProductsWorkflow`, always forcing `status: "proposed"` and passing `additional_data.vendor_id` resolved server-side from the caller's `actor_id` — a vendor can never set `vendor_id` itself; this server-computed value never goes through `vendorAdditionalData`'s validator (that's only for client-supplied request bodies, e.g. staff using `/admin/products`). The `productsCreated` hook (`src/workflows/hooks/created-product.ts`, shared with Brand — Medusa allows only one handler per hook name) creates the `product-vendor` link when `vendor_id` is present; `productsUpdated` (`updated-product.ts`) symmetrically handles reassigning or clearing a product's vendor the same way it already did for brand — dismiss the old link if the vendor changed, create the new one, both through one shared `reassignmentLinks` helper so the two branches can't drift apart. Verified: a staff member can set, reassign, and clear a product's vendor via `/admin/products` `additional_data.vendor_id`, independently of any brand link on the same product. `POST /vendors/products/:id` and `DELETE /vendors/products/:id` both re-check the product's linked vendor against the caller's before proceeding (`src/api/vendors/products/assert-owned-product.ts`, shared by both routes), 404ing otherwise (not 403 — a vendor can't tell another vendor's product exists); the update schema is `.strict()` so a tampering attempt (e.g. slipping `price` or `vendor_id` into the body) is rejected outright as an unrecognized field, not silently ignored. No approval/publish action exists yet, so a vendor's own products never leave `proposed` on their own — a staff member must flip `status` to `published` by hand (e.g. in Admin) before it's customer-visible; that manual step is the stand-in for the approval workflow that doesn't exist yet.

**Admin vendor management:** `Vendor` and `VendorUser` are two separate, independent CRUDs, deliberately not combined into one step. `/admin/vendors` (contract/routes/query-config/middlewares mirroring Brand's exact shape) lets staff list, view, create, and edit vendors — plain `name`/`handle`, nothing else, exactly like Brand. `/admin/vendor-users` is its own CRUD, scoped to an existing `vendor_id`. This is a simplification of an earlier version that combined vendor creation, vendor user creation, and Auth Module registration into one atomic workflow — that coupling was cut because nothing actually needed those three things to succeed-or-fail together, and combining them made each piece harder to read and extend on its own. Creating a vendor user needs its own auth identity created server-side, since there's no pre-existing registration step the way a public self-registration flow would have one — it calls `authModuleService.register("emailpass", ...)` directly (the exact internal mechanism a public `/auth/vendor/emailpass/register` route would use, so password hashing is done by Medusa's real provider, never hand-rolled), with a synthetic `AuthenticationInput` object (`{url: "", headers: {}, query: {}, protocol: "https", body: {email, password}}`) — verified the actor type plays no part in that call at all; it's `setAuthAppMetadataStep` afterward that does the actual "vendor" linking. The password itself is **never staff-typed** — `generateRandomPassword` (`src/workflows/create-vendor-user/generate-random-password.ts`) generates it server-side, and the create response returns it once for staff to copy and share manually; there is no public self-registration path at all any more, and no invite-email flow yet either (see `docs/security-backlog.md`). Staff can regenerate a vendor user's password later (`src/workflows/regenerate-vendor-user-password/`) via `authModuleService.updateProvider("emailpass", {password, entity_id: email})` — reading the emailpass provider's own source confirmed its provider identity is keyed by **email**, not by the vendor user's id, which the Auth Module's own doc comment for `updateProvider` misleadingly suggests. That step's compensation is a deliberate no-op (documented as such, not skipped) — a regenerated password can't be un-regenerated since the prior one was random and never stored. `registerVendorAuthIdentityStep` has a real compensation function (deletes the created auth identity) even though it's the *first* step in its workflow and nothing before it could ever need undoing — matches the "every step gets real compensation, not scoped to today's step count" rule (see `agents/backend.md` "Patterns to follow when extending"). Verified end to end via a `medusa exec` script: the vendor can log in with the generated password, a duplicate-email attempt is rejected cleanly with zero orphan rows, updating name fields works, and after a password regeneration the old password is rejected while the new one works.

**Deleting a vendor's product** is `DELETE /vendors/products/:id` → the same ownership check as update, then the core `deleteProductsWorkflow` called directly — no custom wrapping needed. Verified experimentally (see git history if the reasoning is ever in doubt): `deleteProductsWorkflow` already cleans up **every** module link pointing at a deleted product on its own (soft-deletes the product, and the link row for any `isList` link — vendor, brand, whatever — is removed automatically without a `deleteCascade` on the link and without deleting the *other* side of the link), even across multiple products sharing the same linked entity. An earlier version of this route wrapped the delete in a custom workflow that explicitly dismissed the `product-vendor` link first, on the assumption the link's foreign key would otherwise block deletion — that assumption was wrong, confirmed by testing the raw workflow directly with no dismissal step at all, and the extra workflow was removed as unnecessary complexity. That investigation also surfaced a **real, pre-existing bug** in `src/workflows/hooks/deleted-product.ts` (the Brand feature's own `productsDeleted` hook, since deleted): it called `link.list({[Modules.PRODUCT]: {product_id: ids}, [BRAND_MODULE]: {}})` to find product-brand links, but Medusa's `Link.list` derives the required module key name from `Object.keys(...)` on each side — an empty object produces an empty key name and fails the lookup before any filtering happens ("Module to type product and brand by keys product_id and _ was not found"). Since that hook turned out to be solving a non-problem too (the same automatic link cleanup applies to brand links), it was deleted rather than fixed — every product deletion in the system was silently broken by this hook until removal, not just vendors'.

**Variant/option filtering on the storefront:** the storefront's existing `OptionsPicker` (`apps/storefront/src/modules/store/components/refinement-list/options-picker`) only lists options where `is_exclusive: false` (Medusa's flag for "shared/global option," vs. the default `true` — "exclusive to this one product"). Vendor-created options (`Color`, `Size`, etc.) default to `is_exclusive: true`, so they never appear in that filter. **Do not** flip vendor options to `is_exclusive: false` to fix this — verified experimentally that it breaks product creation outright: a shared option is looked up and created by title with no dedup/reuse in `createProductsWorkflow`'s plain `options` array (only `processProductOptionsForImportStep`, a different step, supports reusing an existing shared option via an explicit `id`), so a second product using the same option title (even the internal "Default" title used for every no-options product) throws `"Product option with title: X, already exists."` Cross-vendor collisions on common titles like "Color" would be even more likely. Making vendor variants filterable needs its own design (e.g. a lookup-or-create-by-title step that resolves to a shared option's `id` before creating each product, with a decision about whether independently-created vendor products *should* share the same underlying option row) — not implemented; tracked as an open item, not a quick field flip.

**Pricing and sales channel at creation:** the vendor sets a price per variant (see "Variants and images" below); the route reads the `store` entity's `default_sales_channel_id` and `supported_currencies` and applies each variant's amount identically across every currency the store supports (no currency conversion — a deliberate simplification, not a pricing feature) and links the product to the store's default sales channel. The route fails loudly (`MedusaError.Types.UNEXPECTED_STATE`) rather than silently creating an unpriced, unpurchasable variant if the store has no supported currencies configured at all. Every vendor product goes out through that one sales channel; a clone that wants per-vendor channels would need to revisit this. `manage_inventory: false` on the variant, same as the Store API's inventory model expects to avoid a stock-location requirement this chassis hasn't built yet.

**Variants and images:** a vendor passes `options: {title, values}[]` (e.g. Size: S/M/L, Color: Red/Blue) and a `variants: []` array with one entry per option combination, each carrying its own `price`, and optionally `sku`, `barcode`, `weight`/`length`/`height`/`width` — per-variant pricing, not one shared price across every variant. `src/api/vendors/products/build-variants.ts` (`resolveProductVariants`) validates that the submitted variants are exactly the set of combinations the options imply — none missing, none repeated, none extra — and rejects outright above 50 variants, rather than silently accepting a mismatched or oversized set. Images are uploaded separately via `POST /vendors/uploads` (Medusa's `uploadFilesWorkflow`, stored by the Local File provider in dev — `apps/backend/static/`, gitignored) and attached as the product's top-level gallery (`images` on the create schema). That upload route is a deliberately narrow surface: `authenticate("vendor", ...)` already gates it (no anonymous uploads), a fixed allow-list (PNG/JPEG/WEBP/GIF) is checked in the route itself — not left to a client-supplied filename or a multer `fileFilter` that would silently drop a bad file instead of returning a clear error — and multer's own size/count limits (5MB, 5 files) are caught and converted to a normal `MedusaError` 400 rather than leaking through as a bare 500. **Per-variant thumbnails/images were built, then removed** — they cost more complexity than they were worth at this stage (a whole extra workflow just to associate an image to a specific variant after the fact); a vendor product now only has the plain top-level gallery above. This can come back later if actually needed, but wasn't worth carrying for the first version.

**Vendor-submitted products need staff approval before they're publicly visible** — solved without any new infrastructure. `POST /vendors/products` forces `status: "proposed"` on every vendor-created product, reusing Medusa's own built-in `ProductStatus` enum (`draft`/`proposed`/`published`/`rejected`). Staff review and publish or reject from the **existing, unmodified** core Admin product page — no new model, workflow, or curation UI was needed, since that's exactly what the status field is for.

**Where uploaded files actually end up, and why no code change is needed for that to differ per environment:** `medusa-config.ts` has no `modules: [{resolve: "@medusajs/medusa/file", ...}]` entry at all, so Medusa runs its default — the Local File Module Provider, local-disk only, `apps/backend/static/` — exactly why it's dev-only and gitignored. `multer` (`uploads/middlewares.ts`) is a separate concern from this and never touches it: it only parses the incoming multipart body into an in-memory `Buffer` (`memoryStorage()` — nothing written to disk, gone once the request completes), handing that buffer to the route. The route then calls `uploadFilesWorkflow`, which resolves whichever File Module provider is currently configured — neither the middleware nor the route hardcodes a destination. On Medusa Cloud specifically, this requires zero changes: Cloud auto-provisions a dedicated S3 bucket per environment and auto-configures the S3 File Module Provider — the docs explicitly say to *remove* any manual S3 config from `medusa-config.ts` before deploying there, since Cloud already injects it. The switch from local disk to real object storage is a deploy-environment fact, not something this codebase has to build.

**Order splitting (spike, not settled):** `src/workflows/create-vendor-orders/` groups a completed cart's line items by vendor and creates one child order per vendor, linked via `vendor-order`; `POST /store/carts/:id/complete-vendor` replaces the store's own complete-cart call, `GET /vendors/orders` resolves `vendor_user.vendor.orders`. Verified working for a fresh two-vendor cart, including repeat completion of the same cart (idempotency fixed — see `docs/spikes/multi-vendor-order.md`). Stress-tested: a child order's fulfillment state never rolls up to the parent (status must be computed, not read off the parent); Medusa's native partial fulfillment already lets one child order dispatch in waves without a second order; child orders have no `payment_collections` of their own, only the parent does, so a per-vendor refund needs custom logic. That last point is real evidence leaning toward consignment records over child orders, but the alternative hasn't been built to confirm it. Whether this child-order shape survives is still the open question the spike exists to answer — do not build payouts/returns against this link until that's settled.

Planned later (`docs/features/`): consignments, commission / payout ledger, vendor onboarding/approval. Money and rates use `bigNumber`; ledger entries are append-only.

## Notes

- Seed helpers and region config (`src/lib/markets.ts`) are not persistence entities.
- Do not duplicate Medusa core schema in this file; link official commerce module docs instead.
