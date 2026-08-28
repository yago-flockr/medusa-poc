# Backend (`apps/backend`)

> Context for AI agents in the Medusa application. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file and the package README if setup/run changes.

## Overview

Medusa v2 commerce engine for the chassis. Config: `medusa-config.ts`. Default seed markets: `src/lib/markets.ts` (UK / EU / US regions for seed).

## Architecture and flow

- Framework: `@medusajs/framework` / `@medusajs/medusa`
- Persistence: PostgreSQL via Medusa modules (not Prisma/Drizzle as primary)
- Extension model: custom modules, module links, workflows, API routes, subscribers, jobs, admin UI extensions
- Entry: `medusa develop` / `medusa start` with Admin at `/app`

## Data model (ER)

Full diagram and field detail: `apps/backend/docs/ER_MODEL.md`.

- Store: PostgreSQL
- Layer: Medusa module data models and migrations
- Custom modules with owned models: **Brand** (`src/modules/brand`) — product taxonomy via `product-brand` link; see `docs/ER_MODEL.md`. Not the white-label client brand in `docs/plan.md`. **Vendor** (`src/modules/vendor`) — `Vendor` + `VendorUser`, the marketplace seller and its authenticated staff (custom actor type `vendor`), via `product-vendor` link; see `docs/ER_MODEL.md`.
- Planned extensions (see `docs/features/`): consignments, commission and payout ledger, vendor onboarding/approval

## Core technologies

- **Medusa v2**: `medusa-config.ts`, commerce modules
- **PostgreSQL / Redis**: via root Docker Compose and env URLs
- **TypeScript**: package `tsconfig.json`
- **Node**: `engines.node` `>=22` so Medusa Cloud does not install pnpm 11 on Node 20.20.0

## Module / directory breakdown (`src/`)

- `api/`: file-based routes (`api/store/*`, `api/admin/*`) exporting HTTP verbs. Medusa loads **only** root `api/middlewares.ts` — keep it a thin composer that spreads feature `MiddlewareRoute[]` exports. Do not nest `defineMiddlewares` in feature files.
  - Per Admin feature: `validators.ts`, `query-config.ts` (when the feature has list/retrieve), `middlewares.ts` (wire that feature’s matchers only).
  - Product `additional_data`: each feature that extends product create/update exports a fragment from `api/admin/<feature>/additional-data.ts` (e.g. `brands`) — or, for a feature with no `/admin/*` CRUD surface of its own, from `api/<feature>/additional-data.ts` (e.g. `vendors`, since there is no `/admin/vendors`). Compose them in `api/admin/products/additional-data.ts` and pass the result from `products/middlewares.ts`. Do not put foreign-route matchers in the feature’s middlewares, and do not bury cross-route fields inside CRUD validators. Every fragment is a one-property `nullish()` zod object (string to set/change, `null` to clear) — copy that shape, don't invent a new one per feature.
- `modules/`: custom domain modules (models, services, migrations)
- `workflows/`: orchestration; prefer over fat route handlers. **Every workflow is a folder, never a flat file**: `workflows/<name>/index.ts` holds only the `createWorkflow` composition (read top-to-bottom as the actual sequence of operations); `workflows/<name>/steps/<step-name>.ts` holds one `createStep` per file, each with its own input type (don't borrow a slice of the workflow's input type — a step should read standalone). No `steps/index.ts` barrel — `index.ts` imports each step from its own path. Applies even to a single-step workflow (e.g. `create-brand/`, `create-vendor/`) — consistency of shape matters more than saving one file for the smallest cases. `workflows/hooks/*.ts` is a different thing (callbacks registered onto an *existing* core workflow's named extension point, e.g. `createProductsWorkflow.hooks.productsCreated`) and stays flat — it was never a workflow of its own. `workflows/shared/steps/<step-name>.ts` is for a step genuinely used by more than one workflow (e.g. `resolve-shopify-product-prerequisites`, used by both `sync-shopify-products` and `import-vendor-shopify-products`) — extract it here the moment a second workflow needs it, rather than having one workflow reach into a sibling's private `steps/` folder. A step's home in `workflows/shared/` doesn't imply it's more "special" than a single-workflow step — same `createStep` shape, same one-file-per-step rule — it only means more than one workflow currently composes it.
- `links/`: links between module data models
- `subscribers/`: react to Medusa events
- `jobs/`: scheduled work (payouts later)
- `admin/`: Admin dashboard widgets and routes. Query hooks in `admin/hooks/queries/`, mutation hooks in `admin/hooks/mutations/`.
- `migration-scripts/`: one-off DB data-migration scripts — Medusa-recognized location, auto-run once as part of `db:migrate` (tracked so it never reruns). Not for demo/seed data — see `scripts/`.
- `scripts/`: CLI exec helpers — demo-data seeding (`seed.ts`, `pnpm run seed`, not idempotent — re-running duplicates rather than updates), publishable key sync
- `integrations/`: one folder per external, non-Medusa system this app talks to (currently just `shopify`) — owns that system's client, auth, and mapper code, and nothing outside it should reach past the folder's public exports into another external system's internals. Not for Medusa-internal cross-module concerns (that's `links/`). The URL surface for a given integration mirrors this: every vendor- or admin-facing route touching it nests under a **static** `.../shopify/...` segment (`/vendors/me/shopify/products`, `/vendors/me/shopify/connection`, `/admin/vendors/:id/shopify/products`) rather than a dynamic `[integration]` catch-all. A second integration gets its own sibling static segment when it's real, with its own `middlewares.ts`/contract entries — deliberately not a shared generic dispatcher, since that would force every future integration's routing to be decided by a runtime string switch instead of Medusa's own file-based routing, and would bet on a shape for an integration that doesn't exist yet. Inside one integration's folder, split by role, not by convenience: `client.ts` is the generic transport for that external API (auth headers, request/response envelope, error mapping — zero resource-specific knowledge, e.g. `runShopifyQuery` + `ShopifyStoreCredentials`), and `oauth.ts` covers connection/auth flow the same way; both stay flat at the folder root. A resource-specific file per thing being synced (`products.ts` today; a future `orders.ts`/`stock.ts` once two-way sync grows beyond products, per the marketplace constraints below) holds that resource's queries/mutations and shape-mapping, built on top of `client.ts` rather than duplicating it. `mappers/` holds shape-translation functions that convert an external resource into a Medusa create/update input (kept separate from the resource file itself since it's translating *into* our domain, not just querying the external one). `helpers/` holds pure, local support logic that never leaves this app — assertions, dedupe-by-`external_id` lookups against our own DB, anything that isn't itself a call to the external API. Copy this shape (`client`/`oauth` at root, one file per resource, `mappers/`, `helpers/`) for a second integration or a new resource within this one, rather than inventing a new split.
- `lib/`: shared helpers with no domain/vendor ownership (default markets seed config, generic store-prerequisite resolution, random password generation). If a helper is specific to one external integration, it belongs in `integrations/<name>/`, not here — `lib/` drifting into an integration's dumping ground is exactly the mess this rule exists to prevent.

## Patterns to follow when extending

1. Add or change a custom module model → `pnpm exec medusa db:generate <module>` then `db:migrate`. Update `docs/ER_MODEL.md` in the same session.
2. Business logic in **workflows** and steps; routes resolve and run workflows.
3. Do not open a raw DB client or write SQL in routes.
4. Marketplace concepts (vendor, consignment, commission) become explicit modules/links once you spike them. Avoid scattering vendor_id checks without a model.
5. Shared chassis modules should stay brand-agnostic; brand config belongs outside core logic when you add it.
6. Money and rates use `bigNumber`, never a float.
7. Keep provider and host choices at the edges: nothing outside a seam should know which payment, tax, carrier, content, search or hosting vendor a clone picked (`docs/plan.md`, "Not decided").
8. **A step's compensation function is part of that step's own contract, not scoped to how many steps the workflow currently has.** Write real, correct undo logic for any step whose action needs undoing, even in a workflow that today has only that one step (e.g. `update-brand/steps/update-brand.ts` retrieves the brand's current name/handle before overwriting them, purely so its compensation function has something to restore — unreachable today since nothing follows it, but correct the moment a second step is added later). A step should never rely on "I happen to be the only/last step right now" — that awareness of its neighbors is exactly what a workflow's composability is supposed to make unnecessary.
9. **Fixed pattern per "how am I extending this" scenario** — pick the one that matches, don't improvise a new shape:
   - **Read a linked module's data on a core Medusa model** (e.g. the vendor on a product) → a Module Link, never a core-model change. Copy `links/product-vendor.ts` / `links/product-brand.ts`. Read it via `fields` (`query.graph({ fields: ["*", "vendor.*"] })` in code, `?fields=+vendor.*` on the route) — no new route needed. `db:migrate` after adding the link file.
   - **Create a new standalone custom module** (no relation to core) → Brand's shape: `modules/<name>/{models,service.ts,index.ts}`, register in `medusa-config.ts`, `pnpm exec medusa db:generate <module>` → `db:migrate`, `workflows/create-<name>/` + `workflows/update-<name>/` (rule 8 applies), a route, then update `docs/ER_MODEL.md`.
   - **Create a new standalone module that's also linked to Medusa** (Vendor's shape) → the same, plus one `links/<core>-<name>.ts` per relationship (Vendor has two: `product-vendor.ts`, `vendor-order.ts`). Decide `isList` deliberately per direction; `db:migrate` again after the link file.
   - **Update a standalone or linked model's fields** → edit `models/<name>.ts` → `db:generate <module>` (review the generated migration) → `db:migrate` → propagate the field through every workflow step / validator / `@dtc/api-contracts` schema that touches it → `docs/ER_MODEL.md`. Identical whether or not the model has links — a link lives in its own file and is untouched by a field-only change; only touch a `links/` file if the relationship itself changes.
   - **Assign a linked entity at core-model create/update time** (write side, the complement to the first bullet) → `additional_data` fragment + workflow hook. Copy `api/vendors/additional-data.ts` → composed into `api/admin/products/additional-data.ts` → consumed in `workflows/hooks/created-product.ts` (`createProductsWorkflow.hooks.productsCreated`). One handler per hook name — extend the existing handler for a new module, never register a second one.
   - **Sync external, non-Medusa data into a local model** (the Shopify shape) → not a link, not a hook: a typed external client (`integrations/shopify/client.ts` for the transport + `integrations/shopify/products.ts` for the resource-specific queries, generated via codegen, not hand-typed) feeding a workflow that pulls → resolves Medusa prerequisites → dedupes by `external_id` → calls the real core workflow (e.g. `createProductsWorkflow`) as a step. Never bypass workflows because the source of truth is external.
   - **Filter or sort by a linked field** (e.g. "products for vendor X") is a different capability from the above — `query.graph`'s `fields` only expands, it cannot filter cross-module. Needs `filterable` on the link + the Index Module + `query.index`. None of the current links declare `filterable`; add it deliberately if this need ever comes up, don't assume `fields` covers it.

## Marketplace implementation constraints

What the requirements in `docs/features/` imply for the code. The briefs state
behaviour only and deliberately name no primitives; this is where the mapping lives.

**Read this before touching anything vendor-related:** everything below —
`/vendors/products`, `/vendors/orders`, the manual product-creation path —
is still real, working code, but Sensus's answers mean it's no longer the
intended path for a vendor's catalogue to arrive. A vendor's own Shopify
store is meant to be the source of that data, synced in, not typed into
this API by the vendor themselves. See `docs/plan.md` Decisions for the
full reasoning. The vendor-facing UI that *created/edited product content* through this API
(title, description, images, variants — typed in by hand) was removed and
stays removed — a vendor's catalogue content comes from their Shopify store,
not from typing it into this API. What did come back, on a separate
`/vendor/products` page, is a narrower view/status/delete UI (see the
self-approval entry below) — that's not a reversal of the "don't type
products in by hand" decision, it's a different capability (manage an
already-arrived product's visibility) layered on the same untouched API.
Don't extend the create/update surface's *content* fields (title/images/
variants) assuming it's the long-term ingestion path — extend the sync
design instead when that work
starts.

- **Vendor isolation cannot come from Admin.** The User Module gives users and
  invites but no granular per-user permissions, so a vendor-facing portal is a
  separate app on a custom actor type, with every `/vendors/*` query scoped
  from `req.auth_context.actor_id`. Never a filter a route author has to
  remember — and not something to re-derive per route either:
  `resolveVendorUser(query, actorId, fields)` in
  `src/api/vendors/resolve-vendor-user.ts` is the one place that lookup
  happens, shared by every `/vendors/*` route, and it always throws if the
  actor doesn't resolve to a real vendor user. Implemented: `src/modules/vendor`,
  `src/api/vendors/*` — `authenticate("vendor", ...)` guards `/vendors/*`.
  Named `VendorUser`, not `VendorAdmin` — every
  vendor user has equal access today, no permission tiers exist yet, so
  "admin" would overclaim; see `docs/ER_MODEL.md`.
  **Vendor and VendorUser are two separate, independent CRUDs, not one
  combined step.** `Vendor` (`src/workflows/create-vendor/`,
  `src/workflows/update-vendor/`) is a plain CRUD exactly like Brand — just
  name/handle, no linked side effects. `VendorUser`
  (`src/workflows/create-vendor-user/`, `src/workflows/update-vendor-user/`,
  `src/workflows/regenerate-vendor-user-password/`) is created and managed
  separately, scoped to an existing `vendor_id`. This was a deliberate
  simplification: an earlier version combined vendor creation, vendor user
  creation, and Auth Module registration into one atomic workflow, and it
  was cut down specifically because coupling unrelated concerns into one
  step bought no real correctness benefit here (nothing needs vendor and its
  first user to succeed-or-fail as one unit) while making every piece harder
  to read, test, and extend independently. Security is not treated as
  cuttable, though: every `VendorUser` is created with a **server-generated
  random password** (`generateRandomPassword` in `lib/generate-random-password.ts`
  — a plain helper with zero Medusa/workflow coupling, so it belongs in `lib/`
  rather than `workflows/shared/steps/`, which is only for `createStep`-wrapped
  steps; shared by both `create-vendor-user` and `regenerate-vendor-user-password`,
  which is exactly why it doesn't live inside either workflow's own folder),
  never one staff or a
  form types in, returned once in the create response for staff to copy and
  share manually (no invite-email flow yet). Staff can regenerate a fresh
  random password later (`regenerate-vendor-user-password/` — calls
  `authModuleService.updateProvider("emailpass", {password, entity_id:
  email})`; the emailpass provider keys its provider identity by **email**,
  not by the vendor user's own id — confirmed by reading the provider's
  source, since the Auth Module's own doc comment for `updateProvider` is
  misleading here). There is no self-service password change yet — that's an
  accepted v1 gap, not a security compromise, since regeneration still
  requires staff action. `setAuthAppMetadataStep` with `actorType: "vendor"`
  links the generated auth identity to the new `VendorUser` in both
  workflows. There is **no public self-registration path** — no
  `/auth/vendor/emailpass/register` + `POST /vendors` combo callable by
  anyone; vendors and vendor users are both staff-created from
  `/admin/vendors` and `/admin/vendor-users` (mirrored two-page Admin UI,
  same as Brand's page, `src/admin/routes/vendors/`,
  `src/admin/routes/vendor-users/`). **The Vendor/VendorUser split also
  governs what a vendor's own self-service UI is allowed to touch:**
  `PATCH /vendors/me` (`src/api/vendors/me/route.ts`) lets a vendor edit only
  their own `VendorUser` fields (`first_name`, `last_name`) via the existing
  `updateVendorUserWorkflow` — never `Vendor`-level fields (`name`, `handle`,
  Shopify store domain/credentials), which stay staff-only through
  `/admin/vendors`. This was a real correction mid-build: the first version
  let a vendor edit both through one endpoint, one workflow call each. If a
  future self-service form ever needs to touch both `Vendor` and `VendorUser`
  fields atomically in one request, compose a small workflow that calls both
  existing steps (`updateVendorStep` + `updateVendorUserStep`) together
  rather than two independent top-level workflow runs from the route — that
  gets automatic saga-style compensation for free if the second call fails
  after the first succeeds — but don't reach for that until a real field
  actually needs it on both sides at once. A vendor also owns its own products: `POST
/vendors/products` creates a product forced to `status: "proposed"` and
  linked to the caller's vendor (never a client-supplied `vendor_id`) via the
  `productsCreated` hook in `src/workflows/hooks/created-product.ts` — the
  same hook the Brand admin flow already used, extended rather than
  duplicated, since Medusa allows only one handler per hook name. `GET
/vendors/products` (and `GET /vendors/orders`) are paginated —
  `src/api/vendors/list-query.ts` (`parseVendorListQuery`, shared by both)
  validates `?limit=&offset=` (limit 1–100, default 20) and throws a clean
  `INVALID_DATA` 400 on bad values rather than an uncaught ZodError. Products
  are queried directly (`entity: "product"`, `filters: { vendor: { id } }`,
  `pagination: { skip, take }`) instead of the earlier "load the vendor,
  read `vendor.products`" shape, since a nested relation array can't be
  paginated at the top level — filtering `product` by a linked module's
  field takes a nested object (`{ vendor: { id } }`), not a dot-path string
  (`"vendor.id"` 500s — confirmed by testing both). `POST
  /vendors/products/:id` re-derives ownership from `actor_id` before
  allowing an edit and 404s (not 403, so existence isn't leaked) otherwise.
  Verified with two vendor tokens: each sees/edits only its own product, an
  isolation attempt on the other vendor's product 404s, and an unauthenticated
  request 401s (study plan C1 done-when).
  The "separate app" this constraint originally called for was
  `apps/storefront`'s own `/vendor` route segment — since deleted (see
  `docs/plan.md` Decisions: Sensus's answers confirmed a vendor manages
  their own catalogue through their own Shopify store, not through us, so
  there's no vendor-facing UI to build against this API at all right now).
  `/vendors/*` still needs its own CORS handling regardless — `VENDOR_CORS`
  env var, `src/api/vendors/cors.ts`, applied in
  `src/api/vendors/middlewares.ts` — since it's still callable
  cross-origin by whatever eventually consumes it (Bruno today; possibly a
  vendor panel again later, per `docs/plan.md`).
  **Vendor invitation is fully closed off, staff-only:** every vendor and
  vendor user is created from Admin (`/admin/vendors`, `/admin/vendor-users`)
  — there is no public registration route at all any more. This satisfies
  "a vendor is invited, never self-registered" unconditionally, not just
  "when staff happen to use this path." A real invite-email flow (mirroring
  Medusa's own `createInvitesWorkflow`/`acceptInviteWorkflow` pattern for the
  User module, which doesn't itself apply to custom actor types) to replace
  "staff regenerates a password and shares it manually" with the vendor
  choosing their own is still a real, undone follow-up — deliberately
  deferred as UX polish, not a security gap, since password generation and
  regeneration themselves are already handled server-side (see above).
  **Reversed: staff approval is no longer the only path to publish — a
  vendor can now self-approve their own products.** Creation/import still
  lands as `status: "proposed"` (`src/api/vendors/products/route.ts`,
  `integrations/shopify/mappers/product-input.mapper.ts`) using Medusa's own
  `ProductStatus` enum (`draft`/`proposed`/`published`/`rejected`) — nothing
  changed about what a product's status is on arrival. What changed is who
  can move it from there: `updateVendorProductSchema` now accepts an
  optional `status` field (any of the four values — deliberately not
  narrowed to `published`/`draft` only, so a vendor has the same status
  vocabulary Admin's own product page does), consumed directly by
  `POST /vendors/products/:id`'s existing call to Medusa's
  `updateProductsWorkflow` — no new workflow needed, since that update path
  already accepted arbitrary product fields. The vendor-facing `/vendor/products`
  page (`apps/storefront`) is the self-service surface: view every owned
  product (Shopify-imported or manually created, tagged Shopify by
  `external_id` being non-null), change its status via a plain dropdown, or
  delete it (`DELETE /vendors/products/:id`, unchanged, no confirmation at
  the API level — the storefront adds its own `window.confirm` before
  calling it). Staff can still review from the unmodified Admin product page
  too; nothing there was removed, it's just no longer the *only* way a
  product goes live. Variant/option
  authoring and image upload are done, including **per-variant pricing**: a
  vendor passes `options` (e.g. Size/Color) and one `variants` entry per
  combination, each with its own price and optionally sku/barcode/
  weight/dimensions (`src/api/vendors/products/
  build-variants.ts` `resolveProductVariants` — max 50 variants via the
  zod schema, exact-match validation against the option combinations, see
  `docs/ER_MODEL.md`). **Per-variant thumbnails/images were built, then
  deliberately removed** — a vendor product now only has plain top-level
  gallery images (`images` on the create schema), no per-variant image or
  thumbnail assignment; that feature cost more complexity than it was worth
  at this stage and can come back later if actually needed. Images
  upload via `POST /vendors/uploads` (Medusa's File module, PNG/JPEG/WEBP/GIF
  only, 5MB/5-file limits enforced as clean 400s, not left as a raw 500).
  Not done: vendor-assignable categories/collections/tags (would need its own
  staff-curated-taxonomy listing endpoint, a bigger separate feature than the
  per-variant fields above), and real per-vendor inventory tracking (needs a
  stock location per vendor — see the "Per-vendor stock" note below; not a
  quick add alongside the others). Storefront filtering by vendor-created
  option values is now **done** — `src/workflows/create-vendor-product/`
  resolves each vendor option to a shared (`is_exclusive: false`) row by
  title before creating the product (merging in any new values), instead of
  each product getting its own exclusive copy; see `docs/ER_MODEL.md`
  "Variant/option filtering" for the full mechanism and why the naive
  `is_exclusive: false` flip was tried first and broke product creation.
  Every vendor variant is created with `manage_inventory: false` — this is
  not a gap, it's Medusa's real, fully-supported "untracked stock" mode:
  traced through the cart-confirmation and fulfillment code, no inventory
  item, location, or reservation is ever required or checked for such a
  variant, at any stage. The one piece that *was* a real gap: vendor
  products got no `shipping_profile_id` at all, which let checkout complete
  but threw a hard error the moment staff tried to fulfill the order (Medusa
  requires the order item's product's shipping profile to match the chosen
  shipping option's). Fixed by looking up the store's one default shipping
  profile (`query.graph({entity: "shipping_profile"})`, same row
  `scripts/seed.ts` already uses) and setting it on every vendor
  product at creation (`src/api/vendors/products/route.ts`) — no new model,
  no per-vendor warehouse system. Additionally, `create-vendor-orders`
  (`steps/assert-items-fulfillable.ts`) now checks every cart item's product
  has a shipping profile *before* the cart is ever completed into an order,
  not after — so a still-missing profile (e.g. on data from before this fix)
  surfaces as a checkout error, not as an order that silently can never
  ship. Verified live: a product with no shipping profile is blocked with a
  clear message before order creation; a product with one passes this check
  and fails only at the unrelated, expected next step (no payment
  collection) in a bare test cart. A vendor can also delete their own product (`DELETE /vendors/products/:id` —
  same ownership check as update, then the core `deleteProductsWorkflow`
  called directly; no confirmation step, by design, matching the "don't need
  to confirm" instruction it was built under). Building this surfaced, then
  disproved, an assumption that a custom link needs explicit dismissal before
  a linked product can be deleted — `deleteProductsWorkflow` already handles
  that itself, for any module link, confirmed by direct testing — which in
  turn surfaced a **real, pre-existing bug** in the Brand feature's own
  `deleteProductsWorkflow.hooks.productsDeleted` handler that blocked *every*
  product deletion in the system, not just vendors'. That hook (and the
  vendor route's own unnecessary link-dismissal workflow) were both removed
  rather than fixed, once testing showed neither was solving a real problem.
  See `docs/ER_MODEL.md` "Deleting a vendor's product" for the full story.
- **Order splitting is spiked, not settled — `docs/spikes/multi-vendor-order.md`.**
  `src/links/vendor-order.ts`, `src/workflows/create-vendor-orders/`,
  `POST /store/carts/:id/complete-vendor` (replaces the store's own
  complete-cart call), `GET /vendors/orders`. Verified: a two-vendor cart
  produces one payment collection, one parent order, and one child order per
  vendor, each scoped correctly by vendor. Completing the same cart twice no
  longer duplicates child orders (fixed by checking `order.metadata.parent_order_id`
  in addition to the recipe's own vendor-order-link check, which only covered
  its single-vendor branch). Stress-tested all three anticipated friction
  points with real evidence: a child order's fulfillment never rolls up to the
  parent (status must be computed from every child, never read off the parent);
  Medusa's native partial fulfillment already lets one vendor's order dispatch
  in waves without a second order (this friction point turned out to be a
  non-issue); child orders have no `payment_collections` of their own — only
  the parent does — so refunding one vendor's line needs custom logic, since
  Medusa's standard per-order refund tooling has nothing to act on for a child
  order. That last point is real evidence leaning toward consignment records
  over child orders, but the consignment-record alternative hasn't been built
  to confirm it — treat this as a lean, not the settled answer.
- **Shopify pull is spiked, not settled — `docs/spikes/vendor-shopify-sync.md`.**
  `src/integrations/shopify/client.ts` (the generic Admin GraphQL transport —
  `runShopifyQuery` + `ShopifyStoreCredentials`, no resource-specific knowledge;
  takes an already-issued offline access token — it no longer does its own
  token exchange, see the connection entry below) with
  `src/integrations/shopify/products.ts` (product queries/mapping, built on
  that transport — the pattern a future `orders.ts`/`stock.ts` copies once
  two-way sync grows beyond products) and
  `src/workflows/sync-shopify-products/` (pull → resolve shipping-profile/
  sales-channel prerequisites → skip-if-already-imported by `external_id` →
  `createProductsWorkflow`) are real, verified-against-a-real-store code, not
  throwaway. Credentials are a caller-supplied parameter, not env config —
  the caller is expected to read `shopify_store_domain`/`shopify_access_token`
  off a Vendor record. Nothing Shopify-specific lives in `.env`/`.env.template`.
  The GraphQL response types (`TestPullQuery`) are generated from Shopify's own
  Admin API schema via `@shopify/api-codegen-preset` (`.graphqlrc.ts`,
  `pnpm run shopify-codegen`), not hand-typed. `src/integrations/shopify/generated/`
  holds one committed file, `admin-<version>.schema.json` (~6MB, Shopify's full
  Admin schema for the pinned `apiVersion` in `.graphqlrc.ts`) — everything
  else in that folder (`admin.types.d.ts`, `admin.generated.d.ts`) is gitignored
  and regenerated on every `pnpm run build`/`pnpm run dev` via the
  `prebuild`/`predev` scripts (npm/pnpm's lifecycle convention). Committing the
  schema file matters because `@shopify/api-codegen-preset` only hits the
  network (`shopify.dev`) when that file is *absent* — with it committed, a
  fresh clone, CI run, or Cloud deploy generates types purely locally, no
  network dependency on Shopify's schema proxy at build time. Run
  `pnpm run shopify-codegen:refresh-schema` (deletes the committed schema file,
  then regenerates — forces a fresh network fetch) after bumping `apiVersion`;
  plain `pnpm run shopify-codegen` reuses the committed schema and only picks
  up query-document changes (e.g. editing `PRODUCTS_QUERY`) without a full
  build/dev restart. ESLint also
  ignores that folder (`eslint.config.mjs`) — the codegen emits
  `eslint-comments/*` disable directives that our Medusa ESLint setup does not
  ship, and `medusa develop` would otherwise refuse to start.
  The CLI exec script that used to trigger this was removed; there's now a
  debug-only "Log a vendor's Shopify products" widget on the Admin Products
  list page (vendor ID input → console.log the raw pull, nothing is created)
  — explicitly a manual verification tool, not a production trigger. An
  earlier staff-facing button that actually *created* products from that
  same shared-across-vendors surface was built then deliberately removed for
  being the wrong surface for that.

  **The real product-import trigger now exists, on the vendor panel itself
  (`apps/storefront`'s `/vendor/shopify` page, "Import products" section):**
  the vendor pulls their catalogue (`GET /vendors/me/shopify/products`, each
  product flagged `already_imported` by matching `external_id`), checks
  which ones to bring in or re-sync (pre-checked if already imported), and
  `POST /vendors/me/shopify/products/import` (`src/api/vendors/me/
  shopify/products/import/route.ts`) runs a new, separate workflow —
  `src/workflows/import-vendor-shopify-products/` — that re-fetches exactly
  those checked products fresh from Shopify (`pullShopifyProductsByIds` in
  `integrations/shopify/products.ts`; never trusts the product payload the frontend
  already displayed), splits them into create vs. update by `external_id`
  (`integrations/shopify/helpers/resolve-existing-products.ts`, also reused by the pull
  route's `already_imported` flag and by `filterNewShopifyProductsStep`
  below — one seam for "does this Shopify product already exist here"), and
  runs `createProductsWorkflow`/`updateProductsWorkflow` as steps. This
  closed two of the three gaps the spike workflow below still has: products
  now link to the connecting vendor via `additional_data.vendor_id` (same
  `productsCreated` hook every other vendor product uses), and an
  already-imported product gets updated rather than silently skipped — every
  create or update lands as `status: proposed`, forcing re-approval even if
  the product was already live, since staff review applies identically
  regardless of source or whether it's a first import or a re-sync
  (`docs/features/vendor-shopify-sync.md` "Approval"). Deliberately still
  not done: variants are always fully replaced to match Shopify's current
  set exactly rather than preserved by identity across a re-sync — no
  per-variant Shopify id is tracked yet, and real store data even has null
  SKUs, so there's no safe way to map an old Medusa variant to its Shopify
  counterpart on a second sync (`docs/spikes/vendor-shopify-sync.md`); and
  images still point at Shopify's own CDN rather than being re-hosted
  through the File Module (deliberately deferred again, same tradeoff as
  the original spike).

  **Option values have two levels in Medusa, not one — an option's global
  value pool (`product_option_value`) and a separate per-product allowlist
  (`product_product_option_value`) — and re-sync has to manage both,
  confirmed by direct reproduction against real data, not by reading source
  alone.** Three false leads got ruled out first, each with a real repro: a
  genuinely new value (Shopify adding "Navy") looked missing but wasn't
  (every value already matched, zero missing, yet the update still failed);
  passing `options` in the same call as `variants` looked like it corrupted
  Medusa's in-memory state (removing `options` from the update payload made
  the symptom go away, but only because it also stopped the update from
  attempting to attach a value at all); and an identity-map/staleness theory
  (a step's write not being visible to a later step) looked plausible but was
  ruled out the same way — a genuinely separate, later HTTP request to the
  real running server, with the earlier write already confirmed durable via
  direct SQL, still failed with the identical error.
  The actual mechanism, found by checking the schema directly:
  `product_option_value` rows are NOT scoped to one product by themselves
  (an option can be shared across products, `is_exclusive: false`, with a
  wider value pool than any single product uses) — a THIRD table,
  `product_product_option_value`, links a specific product's option to only
  the subset of that pool it's allowed to use, and that's what Medusa's
  variant-attach validation (`resolveAllowedOptionValues`'s `allowedValueIds`
  filter, in `@medusajs/product`) actually checks. Adding "Red" to the
  option's global pool via `productModuleService.updateProductOptions()`
  (what `sync-product-option-values.ts` did at first) never touches that
  per-product allowlist, so the value existed but wasn't "allowed" for this
  product yet. The fix: both `sync-product-option-values.ts` (adds, before
  `updateProductsWorkflow.runAsStep`) and
  `prune-stale-product-option-values.ts` (removes, after — a stale value
  needs unlinking from a product before the option can consider it unused)
  call `productModuleService.updateProductOptionValuesOnProduct()` instead —
  the one method that manages the per-product link directly, and (per its
  own source) transparently creates-and-links a genuinely new value string
  in one call. Verified against real data end to end, not just reasoned
  about: seeded a stale value the live Shopify data no longer has alongside
  one it now has that Medusa didn't yet, ran the real import route over a
  real HTTP request, confirmed the stale one was gone and the new one usable
  afterward — matching the actual product decision this exists to serve
  (Shopify drops a color, the vendor's product stops offering it, full stop,
  not a value lingering forever because nothing ever cleaned it up).

  **`src/workflows/sync-shopify-products/` (the original spike workflow,
  below) is now superseded for real use** by the workflow above — it's kept
  only as what the Admin debug widget calls, still create-only (skips
  anything already imported rather than updating it) and still has no
  vendor link, since nothing currently needs it to do more than prove the
  pull mechanics. Don't extend the spike workflow to match the new one's
  behavior. It does share the product-input mapping and prerequisite-resolution
  logic with the real workflow now — both call `integrations/shopify/mappers/
  product-input.mapper.ts` and `workflows/shared/steps/
  resolve-shopify-product-prerequisites.ts` rather than each hand-rolling its
  own copy — since that shared need materialized (the two had drifted into
  duplicate, silently-diverging logic) and got extracted per the rule above.
  Still don't extend the spike workflow's own create-only/no-vendor-link
  behavior to match the real one's; that's a deliberate, separate difference,
  not drift.
- **Vendor's Shopify connection uses OAuth authorization-code-grant, one
  Shopify app per vendor, credentials stored on the Vendor record — see
  `shopify-app-config.md` and `docs/vendor-shopify-connection-guide.md`.**
  Superseded the client-credentials approach the pull spike started with,
  which only works for stores in our own Shopify organization and can never
  work for a real vendor's independent store. `src/api/hooks/shopify/oauth/callback`
  + `src/workflows/complete-vendor-shopify-connection/` handle Shopify's
  redirect and save `shopify_access_token`/`shopify_scope`/`shopify_connected_at`.
  Confirmed hands-on: Shopify's Custom Distribution caps a single app at one
  live production store, so "one app per vendor" isn't a choice, it's a
  platform constraint — see `docs/plan.md`'s Open Questions entry for the full
  reasoning.
- **Never store the customer-facing order status.** It is derived from the states of
  its parts, so it cannot drift out of agreement with them.
- **Compute the money split inside the order workflow**, so it is stored atomically
  with the order and rolls back with it.
- **Ledger entries are append-only.** A refund or correction is a new row; nothing is
  updated in place.
- **Checkout must be idempotent.** Lock the cart and guard the split, or a retry or
  double-click produces duplicate parts that are very hard to unwind. (Currently
  violated by the spike above — see the note there.)
- **Per-vendor stock means a stock location per vendor**, with reservation on
  placement and release on cancellation.
- **Extend core flows, never fork them.** Product creation and approval hook into
  Medusa's own product workflow rather than growing a parallel product path.
- The order container itself is **still open** — child orders (the official
  marketplace recipe) versus one order plus consignment records. Settle it with
  `docs/spikes/multi-vendor-order.md` before building a module to keep.

## Conventions and standards

- Satisfy `@medusajs/eslint-plugin` recommended rules (`eslint.config.ts` at repo root). A `@medusajs/*` lint failure usually means wrong framework shape.
- Files kebab-case; DB columns snake_case.
- No semicolons; double quotes; 2-space indent (starter / Prettier style).

## Environment variables

Declared in `.env.template`. Required locally: `DATABASE_URL`, CORS vars, JWT/cookie secrets. Prefer setting `REDIS_URL` to match Docker Compose. Do not set `projectConfig.databaseUrl` or `projectConfig.redisUrl` in `medusa-config.ts` (Cloud injects them; explicit env reads override defaults with `undefined` at Cloud build). Locally, `defineConfig` still reads `DATABASE_URL` from `.env`.

## Scripts / commands

From `apps/backend`:

- `pnpm run dev` → `medusa develop`
- `pnpm exec medusa db:migrate`
- `pnpm exec medusa user -e ... -p ...`
- `pnpm exec medusa exec ./src/scripts/<file>.ts`

## Gotchas and notes

- Medusa Cloud defaults to Node 20.x. This package pins `engines.node` to `>=22` so pnpm 11 can install. Do not revert to `>=20` to "match local 20".
- Editing models without generating migrations: schema never applies.
- Destructive DB ops only with explicit user confirmation.
- Local Redis optional; fake Redis is not production-safe.
- **Mandatory:** `src/admin` is frontend — never import `modules/**/models` or `InferTypeOf` of models. Wire types live once in `api/admin/<resource>/contract.ts`: entity schema, list query, create schema, update schema, response types. Do not export field fragments or a third form-only schema — create/edit forms use the same create/update schemas via `zodResolver`. Shared list shapes: `CustomListQuery` / `CustomListResponse<"resource", Item>` in `api/admin/list-response.ts`. Admin hooks: `admin/hooks/queries/` for `useQuery`, `admin/hooks/mutations/` for `useMutation` — both import the contract, not validators that pull Medusa server utils. Core Medusa entities: extend `HttpTypes` / JS SDK in the same contract file when needed.
- Query keys: `admin/lib/query-keys.ts`. Invalidate `queryKeys.<resource>.all` after mutations.
- Admin custom CRUD UI: create with `FocusModal`, edit with `Drawer`, delete with `usePrompt` + `toast` (`@medusajs/ui`). Match core Admin create forms (inventory/product): header is close/esc only; body is a centered `max-w-[720px]` column with a heading and `grid-cols-2` fields (no `Card` wrapper); Cancel/Save live in the footer. Edit drawer: heading in the header, fields in the body, footer actions right-aligned. Forms use `react-hook-form` + `zodResolver` against the resource contract schemas. Do not re-declare field rules in the form. Do not import `@medusajs/dashboard` internals (`RouteFocusModal` / `RouteDrawer`). Create/update mutations must pass an `onError` alongside `onSuccess` and surface the failure via `toast.error(title, { description: error.message })` — a mutation with only `onSuccess` silently swallows server errors (e.g. duplicate email) with no UI feedback. The Admin dashboard shell already mounts the toaster; nothing extra needs mounting.
- DataTable row actions: `columnHelper.action({ actions })`. The table only fit-widths and pins that column when its id is `action` (singular). A display column named `actions` is treated as a data column and shares remaining width. Wrapping the cell in `w-*` / `justify-end` does not shrink the `<td>`. For a custom cell, still set `id: "action"`.
- Admin UI that imports `@medusajs/js-sdk`, `react-hook-form`, `@hookform/resolvers`, or `@medusajs/icons` needs them as **direct** backend dependencies (same `@medusajs/*` version as the rest). They are not reliably pulled in by `@medusajs/admin-sdk` alone for Vite resolution.
- Multi-vendor planning notes: `docs/spikes/multi-vendor-order.md` (do not productize on the demo path yet).
- **Resolved: cross-package type sharing for `/vendors/*` is `packages/api-contracts`.** `src/admin` still gets Medusa core types for free by sharing this package's TypeScript program (`api/admin/<resource>/contract.ts` pattern above, unchanged); a genuinely separate package like `apps/storefront` does not, so it now imports `@dtc/api-contracts/vendor/*` — a small workspace package of ts-rest + Zod schemas, one domain per `src/<domain>/` subfolder (currently just `vendor`, composed into a single `vendorContract` router), no codegen step. This is option (1) from this note's earlier draft; option (2) (OpenAPI JSDoc + generator) was not pursued. Full pattern, why ts-rest over hand-rolled types, and how to add a new route or domain: `packages/api-contracts/README.md`. Only custom, non-Medusa-typed resources reachable from a separate app belong in this package — a Module Link between two Medusa data models is a different concern entirely and never needs a contract entry (see "Patterns to follow when extending" below).
