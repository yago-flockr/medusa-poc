# Workflows/routes refactor — working notes

**Not a plan to follow, not an ADR.** We tried that once (`TEMP-ADR-workflows-refactor.md`,
now deleted) and it rotted — the progress checklist never got updated and the
actual code changes it described were never committed, so the doc quietly
drifted away from reality. Per Yago's own call: "usually when we create a big
plan everything got messed, we need to start from zero and go step by step."

This file is a snapshot of what's true right now and some open questions —
useful to read before picking the next domain, **not** something to check
boxes on. Re-verify everything in it against the actual code before acting on
it; it will go stale the moment more domains are migrated. Delete or rewrite
freely.

## Done and verified (this session)

- **`vendor-regions`** — `list-vendor-regions.ts` workflow, fully verified
  against real DB data via `medusa exec`.
- **`vendor-stock-locations`** — `list-`, `create-`, `update-`,
  `delete-vendor-stock-location.ts`, all verified against real DB data,
  including a cross-vendor-rejection check. **Found and fixed a real,
  previously-untested bug**: `updateStockLocationsWorkflow` returns a single
  object (not an array — the old code did `stockLocations[0]`, always
  `undefined`) and its address comes back with only `.id`. Fixed with a
  `get-stock-location` re-fetch step. Never caught before because this
  domain has zero test/bruno coverage.
- Both domains verified twice: once via `medusa exec` calling workflows
  directly, and once more through the **real HTTP path** (login → bearer
  token → actual route → middleware → workflow → response), which is a
  strictly stronger check — it also exercises CORS/auth middleware wiring
  that a direct workflow call bypasses entirely. Test users/data created for
  this were cleaned up afterward.
- Every `transform()` reduced to a one-line call to a named `mappers/`
  function (no inline object/array construction, however small) — extracted
  `build-vendor-link-defs.ts`, `build-fulfillment-link-defs.ts`,
  `build-free-shipping-option-input.ts`, plus a generic
  `workflows/shared/lib/first.ts` for unwrapping a Medusa core-flow's
  single-item array result (recurs in every create-workflow).
- Removed the one `as` cast in the new code (`assert-owned-stock-location.ts`)
  in favor of a Zod schema + `.safeParse()`.
- Full mechanical naming pass applied and re-verified: every step-call
  result const is the step's own name minus `Step`/`Workflow`, dot-notation
  only, no destructuring, no generic `result`/`data` transform keys.
- Whole-repo `tsc --noEmit` and `eslint src/` both clean, and Prettier
  applied (`--check` had drifted on ~11 files — none logic-affecting).
- Both domains: `src/api/vendors/{regions,stock-locations}/**` now contain
  only mandatory files (`route.ts`, `middlewares.ts`) — zero `query.graph`,
  zero business logic, zero stray helper files.
- One pre-existing old-pattern file broke when a stock-locations helper was
  deleted (`vendors/products/[id]/inventory/route.ts` imported it) — gave it
  its own local TODO'd copy (`vendors/products/assert-owned-stock-location.ts`)
  rather than migrating vendor-products now.
- **`vendor-consignments`** (route tree stays `/vendors/orders/*` — the
  workflow domain is named after the actual resource, per the naming
  question below) — `list-`, `get-`, `accept-`, `dispatch-vendor-consignment.ts`,
  all four fully migrated and verified against real order/consignment
  fixtures. Old `accept-consignment`/`dispatch-consignment` folders and the
  route-level `assert-owned-consignment.ts`/`build-consignment-detail.ts`
  helpers deleted; `set-consignment-status.ts` demoted from the global
  `workflows/shared/steps/` tier into this domain once nothing old-pattern
  depended on it anymore.
  - **Two more real bugs found and fixed**, same root cause as the
    stock-locations one: a hand-typed field assumed a shape `query.graph`
    doesn't actually guarantee. `display_id`/`quantity`/`total` come back as
    nullable strings or Medusa `BigNumber` instances, not plain `number` —
    fixed with `z.coerce.number()` instead of the old code's `as`-cast
    hopes. Also: selecting a computed field narrowly (`"order.items.quantity"`)
    instead of via `.*` silently returns `undefined` — only the wildcard
    form reliably resolves it.
  - **A `@medusajs/test-utils`-specific quirk, confirmed unrelated to product
    code**: reading a row shortly after a workflow step wrote it can return
    a stale pre-write value inside the ephemeral test app — reproduced via
    HTTP and via a direct workflow call, never on a real running server
    (checked three separate ways). Two assertions are `it.skip`'d with the
    reasoning inline rather than silently dropped; everything else in this
    domain runs as a normal automated test.

## Conventions locked in this session (see `agents/backend.md` for the canonical version)

- **Route → workflow → steps/transform.** Every route, including GETs, calls
  exactly one workflow. No `query.graph`, no business logic in `src/api/**`.
- **One file per workflow, one file per step.** No `index.ts` wrapper, no
  folder-per-workflow. Domain folder: `workflows/<domain>/` (kebab, singular
  resource) holding `list-/get-/create-/update-/delete-<domain>.ts` +
  `steps/` + `mappers/`.
- **Mechanical naming, no exceptions** (Yago: "every const, every function,
  every file, every folder, everything should be mechanical"):
  - Workflow/step file+const names derived from HTTP verb + resource
    (`agents/backend.md` has the table).
  - **A step call's result const = the step's own name minus `Step`**
    (`resolveVendorUserStep()` → `const resolveVendorUser = ...`). A Medusa
    core-flow used via `.runAsStep()` = its own name minus `Workflow`
    (`createStockLocationsWorkflow.runAsStep(...)` → `const createStockLocations`).
    Access fields via dot-notation, never destructure at the call site — same
    rule as the frontend's hook-result convention.
  - `transform()`'s dependency object keys use that same name — never
    generic names like `result`/`data`. The callback's own parameter stays
    plainly `data` always (no identity of its own to derive a name from).
  - This does **not** apply to `transform()`'s own result const — transform
    has no registered name to derive from, so its result keeps a normal
    descriptive domain name (`stockLocation`, `response`, `vendorLinkDefs`).
  - Named exports only, no `export default` (that existed only to make a
    *folder* importable as one path; one-file-per-thing doesn't need it).
- **New-pattern code never calls old-pattern code.** A new-pattern workflow
  only imports other new-pattern workflows/steps, or real Medusa core-flows.
  A dependency in a genuinely different, not-yet-migrated domain gets a
  `TODO` + a small fresh new-pattern duplicate, never a reach into the old
  file. Does not apply to a step that structurally belongs to the domain
  being migrated right now — that gets fully moved in, no TODO.
- **Don't hold back a correct change waiting for the rest of the tree to
  catch up.** Old-pattern and new-pattern domains are expected to coexist
  for the whole length of this refactor.
- **Pure, I/O-free logic → `mappers/`, called from `transform()`.** I/O
  preconditions (`assert-*`) are steps even though they mutate nothing — a
  step is the only way to do I/O inside a workflow. Their compensation is
  legitimately empty, not skipped.
- **Ownership scoping for mutations = an `assert-owned-*` step inside the
  workflow**, not a route-level helper. (Read-list scoping stays as a query
  filter, e.g. `filters: { vendor: { id } }`.)
- **Never `as`-cast a `query.graph` result.** Define a small Zod schema for
  the fields requested and `.safeParse()` it — real runtime validation, not
  a compiler lie. `as const` is unaffected (not a shape assertion).
- **A step is never called twice inside one workflow** — the mechanical
  naming rule has no fallback for a second call. If a workflow seems to need
  the same step twice, that's a signal the step should take a batch/array
  input instead (Medusa's own core-flows already work this way).

## Testing — the old ADR's open question is resolved

The deleted ADR flagged "should every refactored route/workflow get a
contract spec, or is manual bruno verification sufficient?" as unresolved.
It's resolved now: real Jest tests, two tiers (`agents/backend.md`
"Testing" has the full convention) —

- `mappers/__tests__/*.unit.spec.ts` for every pure mapper function.
- `integration-tests/http/<domain>.spec.ts` (`medusaIntegrationTestRunner`)
  for the real route → middleware → workflow → response path, replacing
  manual `curl`/`medusa exec` verification going forward.

Both tiers now exist for `vendor-regions` and `vendor-stock-locations` (42
unit tests, 5 integration tests, all passing). The integration tier needed
one real environment fix, now documented: `@medusajs/test-utils` ignores
`DATABASE_URL` and needs `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD` set
separately (added to `.env`/`.env.template`).

Going forward, migrating a domain should include both tiers as part of
"done," not as a follow-up — that's what would have caught the
`update-vendor-stock-location` bug immediately instead of it surviving
undetected until this session's manual verification.

## Fresh audit — candidates for the next domain

### `vendor-products` — DONE

Migrated to `workflows/vendor-products/`: `list-`/`get-`/`create-`/`update-`/
`delete-vendor-product.ts` plus `get-vendor-product-inventory.ts` and
`set-vendor-inventory-level.ts` (moved in from its own old top-level folder),
each with `steps/`/`mappers/` and unit tests. All 9 stray helper files under
`api/vendors/products/**` deleted; the routes now only contain `route.ts`,
`middlewares.ts`, and the `[id]/` subtree. `assert-owned-stock-location` and
`resolve-vendor-shipping-profile` were promoted from
`vendor-stock-locations/steps/` to `vendors/shared/steps/` since this domain
became their second consumer. The old `api/vendors/resolve-vendor-user.ts`
helper (kept alive specifically for this domain) is now fully deleted.

**Two real things caught only by testing, not typechecking:**
- A **nested `when().then()`** inside `update-vendor-product.ts` (the
  variant-sku-sync block nested inside the update-variants block) compiled
  fine but crashed the whole app at workflow-registration time
  (`Cannot read properties of undefined (reading 'steps')`) — surfaced as
  every other module failing to resolve, not as an error pointing at the
  real cause. Medusa's workflow builder needs every `when()` as a sibling
  top-level call, never nested inside another's `.then()`. Fixed by
  flattening to two independent top-level `when()` blocks.
- `.medusa/server` (gitignored build cache) had gone stale from early in the
  whole multi-session refactor and was causing bizarre, misleading
  `AwilixResolutionError: Could not resolve 'region'`-style failures in the
  integration test harness. `rm -rf .medusa` and re-running fixed it —
  worth remembering as a first troubleshooting step if `medusaIntegrationTestRunner`
  ever fails to bootstrap with a core-module resolution error that makes no
  sense given the actual code.

### Domain 2 (separate concern from either of the above): Shopify install-link duplication — DONE

- `admin/vendors/[id]/shopify/connection/install-link/route.ts` and
  `vendors/shopify/connection/install-link/route.ts` were **line-for-line
  identical business logic**, confirmed by diff — only the vendor-identity
  resolution differed (route param vs. authenticated actor). Fixed with one
  shared `generate-vendor-shopify-install-link` workflow taking `vendorId`,
  composed via `.runAsStep()` from a thin `generate-my-shopify-install-link`
  wrapper for the vendor route.
- Along the way, Yago caught a real naming inconsistency: the vendor route
  lived at `/vendors/me/shopify/*` while every other actor-scoped vendor
  route (`/vendors/products`, `/vendors/orders`, `/vendors/stock-locations`,
  `/vendors/regions`) has no `me` segment, even though all are equally
  scoped via `auth_context.actor_id`. Fixed by moving Shopify to
  `/vendors/shopify/*` and reserving `/vendors/me` exclusively for the
  vendor's own identity/profile (matching Medusa's own `/store/customers/me`
  convention) — rippled through `packages/api-contracts`, backend routes +
  middlewares, and the storefront hooks/forms/page. See
  `agents/backend.md`'s integrations bullet and
  `docs/vendor-contract-hook-pattern.md` for the corrected convention.

### Domain 3: everything else except `vendor-products` — DONE

A follow-up "migrate everything, leave `vendor-products` for now" pass swept
the rest of the backend into the same domain-folder/workflow/step convention:

- **`brands`** (admin CRUD) — `create-`/`update-`/`delete-brand` moved into
  one `workflows/brands/` folder; added `list-brands`/`get-brand` workflows
  to replace the raw `query.graph` that lived directly in
  `api/admin/brands/{route,[id]/route}.ts`; added `mappers/build-brand{,-list}.ts`
  (with unit tests) so every response — including create/update, which had
  never normalized `Date` → ISO string before — goes through one function.
- **`vendors`** (admin CRUD for the `Vendor` entity itself) — same shape:
  `create-`/`update-`/`delete-vendor` moved into `workflows/vendors/`
  (sitting alongside the pre-existing `vendors/shared/` cross-domain tier);
  added `list-vendors`/`get-vendor`; moved `map-vendor-response.ts`'s
  `mapVendorConnectionFields` out of `src/api/**` (a rule-2 violation) into
  `workflows/vendors/mappers/build-vendor.ts`. The admin update route's old
  "mutate then raw-refetch" pattern became two workflow calls from the route
  (`updateVendorWorkflow` then `getVendorWorkflow`) — allowed under "route
  calls one or more workflows."
- **`vendor-users`** (admin CRUD) — `create-`/`update-`/`delete-vendor-user`
  and `regenerate-vendor-user-password` moved into `workflows/vendor-users/`;
  added `list-vendor-users`/`get-vendor-user` + `mappers/build-vendor-user{,-list}.ts`.
- **`vendor-me`** (new domain) — `api/vendors/me/route.ts` (GET+PATCH) still
  called a plain `resolveVendorUser(query, ...)` helper living directly under
  `src/api/vendors/` (a rule-2 violation) with a raw `query.graph` inline (a
  rule-1 violation), plus an `as unknown as` cast on the PATCH result. Fixed
  with `workflows/vendor-me/{get-,update-}vendor-me.ts` + a Zod-validated
  `get-vendor-me` step + `mappers/build-vendor-me.ts`. The old
  `api/vendors/resolve-vendor-user.ts` helper itself is **left in place** —
  it's still the active (if old-pattern) dependency of the deferred
  `vendors/products/**` routes, so deleting it now would break in-scope-later
  code; it'll go away when `vendor-products` is finally migrated.
- **Shopify, finished** — the two folders flagged as Domain "2b" last time
  (`complete-vendor-shopify-connection`, `import-vendor-shopify-products`)
  were folded into `vendor-shopify-connection/` and a new
  `vendor-shopify-products/` domain folder respectively (mechanical rename
  only, logic untouched). Then a deeper look found the **routes themselves**
  hadn't been migrated: `vendors/shopify/{connection,products,products/import}/route.ts`
  still called the same old `resolveVendorUser` helper vendor-me used, and
  the products GET route ran `pullShopifyProducts` + a dedupe check directly
  in the route body. Fixed with `resolve-vendor-shopify-credentials` (a
  sibling to the existing `resolve-vendor-shopify-connection` step, since the
  two need different fields — client_id for OAuth install-link generation vs.
  access_token for actually calling the Shopify API), `pull-shopify-products`/
  `find-existing-shopify-products` steps, and a `pull-vendor-shopify-products`
  workflow **shared** between the vendor route (`list-my-shopify-products`,
  wraps it via `.runAsStep()`) and the admin route
  (`admin/vendors/[id]/shopify/products/route.ts`, which had the exact same
  raw-query violation and now calls the shared workflow directly) — same
  "one capability, one shared workflow" rule as the install-link fix.
- **`create-consignments`** (store checkout, `POST /store/carts/:id/complete-vendor`)
  — already had a clean `steps/` split; just renamed `index.ts` →
  `create-consignments.ts` and dropped an unused `export default`.
- **`vendor-shipping-options`** (new domain, store-facing) —
  `store/carts/[id]/vendor-shipping-options/route.ts` had 3 raw `query.graph`
  calls plus vendor-scoping/filtering logic inline. Fixed with
  `resolve-shipping-profile-vendors`/`resolve-cart-vendor-ids` steps and a
  `build-vendor-shipping-options` mapper; response shape kept byte-identical
  (no contract/schema added — this route has no `@dtc/api-contracts` entry at
  all, pre-existing and out of scope for this pass) to avoid a storefront
  break.
- Every new mapper got a `mappers/__tests__/*.unit.spec.ts` (mirroring the
  vendor-regions/stock-locations/consignments convention); full suite is 79
  unit tests, all green. Integration tests need a live DB (`medusaIntegrationTestRunner`),
  which needs Docker — down for this whole session (WSL integration dropped),
  so none of this was verified against a real running server. Do that before
  calling any of it done-done.

## Not investigated

`vendors/uploads` (checked — it's already clean: the route calls Medusa's own
`uploadFilesWorkflow` core-flow directly, no custom workflow, nothing to
migrate). `admin/products`, `admin/custom` (checked — Medusa's own
additional-data/health-check extension points, not custom business routes).
`create-admin-user` (checked — only a seed script calls it, no route at all,
so the route/workflow/step rule doesn't apply).

## Status: every domain from the original audit is migrated

`vendor-products` (the last one) is done — see above. There is no known
remaining old-pattern route/workflow in the backend. Everything from this
whole multi-session effort (Shopify, brands, vendors, vendor-users,
vendor-me, vendor-shipping-options, vendor-products) has now been verified
live against a real running server and a real Postgres DB, not just
typecheck/unit tests — including a real multi-vendor, multi-location
checkout flow exercised through the actual storefront in a browser.

Nothing structural is left on this refactor's original scope. Future work on
this codebase is normal feature work, not "finish the migration."

## Post-migration stress test — 4 real bugs found and fixed

A follow-up "massive stress test" pass (4 parallel live sweeps against a real
server/DB, covering every domain above) found and fixed 4 real bugs the
typecheck-and-unit-test pass above didn't catch:

- **IDOR in `update-vendor-product`**: a vendor could smuggle another
  vendor's real variant id into an update on their own product and silently
  overwrite its price/SKU — the route checked product ownership but never
  checked that each submitted `variants[].id` actually belonged to that
  product. Fixed with `assert-variants-belong-to-product.ts`. First real
  integration test added for this domain (`vendor-products.spec.ts`),
  reproducing the exact attack as a permanent regression check.
- **Dispatch crash on split-stock consignments**: `resolve-vendor-shipping-option.ts`
  only checked the vendor's *first* stock location's shipping options, and
  `dispatch-vendor-consignment.ts` passed a single hardcoded `location_id`
  into Medusa's fulfillment workflow — broke as soon as a vendor's order
  spanned 2 of their own locations (the same split-stock shape fixed earlier
  in `vendor-shipping-options`). Fixed by matching against the union of the
  vendor's locations and dropping the `location_id` override entirely —
  Medusa's own fulfillment step already resolves each item from its true
  reservation location.
- **Orphaned shipping options resurfacing**: `buildVendorShippingOptions`'s
  vendor-less filter (`!option.vendor`) treated a shipping profile whose
  vendor had since been deleted the same as a genuine store-level option,
  making a dead vendor's orphaned option selectable again. Fixed by
  filtering on `!option.shipping_profile_id` instead.
- **Hardcoded `gbp` breaking checkout for any other store currency**:
  `build-free-shipping-option-input.ts` priced every vendor's free-shipping
  option using the compile-time `STORE_SUPPORTED_CURRENCIES` constant from
  `lib/markets.ts` instead of the store's actual live-configured currencies
  — inconsistent with the rest of the codebase, which always fetches this
  via `resolveStorePrerequisites`. Any store not running exactly `gbp` got a
  shipping option with no matching price, breaking every checkout with
  `Shipping options ... do not have a price`. Fixed by promoting
  `resolve-store-prerequisites` to `vendors/shared/steps/` (now used by 3
  domains) and passing `storeCurrencies` through instead.

All 4 confirmed independently (not just trusting the finder): full
`tsc --noEmit`, full unit suite (27 suites / 102 tests), and full
integration suite (4 suites / 18 tests, 2 known-skipped) green after every
fix. Nothing found in `brands`, admin `vendors`, `vendor-users`, `vendor-me`,
`vendor-regions`, `vendor-stock-locations`, or the Shopify integration —
those came back clean from equally adversarial testing.
