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
- `workflows/`: orchestration; prefer over fat route handlers. **Every workflow is a folder, never a flat file**: `workflows/<name>/index.ts` holds only the `createWorkflow` composition (read top-to-bottom as the actual sequence of operations); `workflows/<name>/steps/<step-name>.ts` holds one `createStep` per file, each with its own input type (don't borrow a slice of the workflow's input type — a step should read standalone). No `steps/index.ts` barrel — `index.ts` imports each step from its own path. Applies even to a single-step workflow (e.g. `create-brand/`, `create-vendor/`) — consistency of shape matters more than saving one file for the smallest cases. `workflows/hooks/*.ts` is a different thing (callbacks registered onto an *existing* core workflow's named extension point, e.g. `createProductsWorkflow.hooks.productsCreated`) and stays flat — it was never a workflow of its own.
- `links/`: links between module data models
- `subscribers/`: react to Medusa events
- `jobs/`: scheduled work (payouts later)
- `admin/`: Admin dashboard widgets and routes. Query hooks in `admin/hooks/queries/`, mutation hooks in `admin/hooks/mutations/`.
- `migration-scripts/`: one-off / seed scripts (includes initial seed; runs once via `db:migrate`)
- `scripts/`: CLI exec helpers (for example publishable key sync)
- `lib/`: shared helpers (including default markets seed config)

## Patterns to follow when extending

1. Add or change a custom module model → `pnpm exec medusa db:generate <module>` then `db:migrate`. Update `docs/ER_MODEL.md` in the same session.
2. Business logic in **workflows** and steps; routes resolve and run workflows.
3. Do not open a raw DB client or write SQL in routes.
4. Marketplace concepts (vendor, consignment, commission) become explicit modules/links once you spike them. Avoid scattering vendor_id checks without a model.
5. Shared chassis modules should stay brand-agnostic; brand config belongs outside core logic when you add it.
6. Money and rates use `bigNumber`, never a float.
7. Keep provider and host choices at the edges: nothing outside a seam should know which payment, tax, carrier, content, search or hosting vendor a clone picked (`docs/plan.md`, "Not decided").
8. **A step's compensation function is part of that step's own contract, not scoped to how many steps the workflow currently has.** Write real, correct undo logic for any step whose action needs undoing, even in a workflow that today has only that one step (e.g. `update-brand/steps/update-brand.ts` retrieves the brand's current name/handle before overwriting them, purely so its compensation function has something to restore — unreachable today since nothing follows it, but correct the moment a second step is added later). A step should never rely on "I happen to be the only/last step right now" — that awareness of its neighbors is exactly what a workflow's composability is supposed to make unnecessary.

## Marketplace implementation constraints

What the requirements in `docs/features/` imply for the code. The briefs state
behaviour only and deliberately name no primitives; this is where the mapping lives.

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
  random password** (`generateRandomPassword` in
  `create-vendor-user/generate-random-password.ts`), never one staff or a
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
  `src/admin/routes/vendor-users/`). A vendor also owns its own products: `POST
/vendors/products` creates a product forced to `status: "proposed"` and
  linked to the caller's vendor (never a client-supplied `vendor_id`) via the
  `productsCreated` hook in `src/workflows/hooks/created-product.ts` — the
  same hook the Brand admin flow already used, extended rather than
  duplicated, since Medusa allows only one handler per hook name. `GET
/vendors/products` resolves `vendor_user.vendor.products` from `actor_id`;
  `POST /vendors/products/:id` re-derives ownership from `actor_id` before
  allowing an edit and 404s (not 403, so existence isn't leaked) otherwise.
  Verified with two vendor tokens: each sees/edits only its own product, an
  isolation attempt on the other vendor's product 404s, and an unauthenticated
  request 401s (study plan C1 done-when).
  The "separate app" this constraint calls for is `apps/storefront`'s own
  `/vendor` route segment (`docs/plan.md` Decisions — an isolated segment
  inside the existing storefront, not a standalone deployable). It's built
  SPA-style on purpose (`docs/plan.md` Decisions) — plain browser `fetch`
  from `apps/storefront/src/app/vendor/api.ts`, JWT in `localStorage`, no
  Server Actions — for portability if it's ever promoted to its own deploy.
  That means `/vendors/*` is called cross-origin from the browser and needs
  its own CORS handling: `VENDOR_CORS` env var,
  `src/api/vendors/cors.ts`, applied in `src/api/vendors/middlewares.ts`.
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
  Staff approval of a vendor's products is done, and it turned out cheap: a
  vendor-created product is forced to `status: "proposed"`
  (`src/api/vendors/products/route.ts`) using Medusa's own `ProductStatus`
  enum (`draft`/`proposed`/`published`/`rejected`) — staff review and
  publish/reject it from the **existing, unmodified** core Admin product
  page. No new model, workflow, or UI was needed for this. Variant/option
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
  per-variant fields above), storefront filtering by vendor-created option
  values (blocked — see `docs/ER_MODEL.md` "Variant/option filtering"; setting
  `is_exclusive: false` looked like the fix but breaks product creation on a
  repeated option title instead, needs its own lookup-or-create design), and
  real per-vendor inventory tracking (needs a stock location per vendor — see
  the "Per-vendor stock" note below; not a quick add alongside the others). A
  vendor can also delete their own product (`DELETE /vendors/products/:id` —
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
- **Deliberately deferred: a real type-sharing story for a separate frontend package (the storefront rewrite).** `contract.ts` types only reach `src/admin` today because it shares this package's TypeScript program — a genuinely separate package gets nothing automatically, and Medusa itself only publishes types (`@medusajs/types`' `HttpTypes` + the typed JS SDK) for its own core resources, never for custom modules like Vendor. Two real options were discussed, neither built yet: (1) a small `packages/contracts`-style workspace package holding just the zod schemas, imported by both sides, no codegen step; (2) OpenAPI JSDoc annotations on custom routes + an OpenAPI→TypeScript generator, the closer analogue to GraphQL codegen (a real generate step, zero source coupling), at the cost of real tooling to set up. Picking one is worth doing properly, not rushed alongside a feature — revisit when the storefront rewrite actually needs it, not before.
