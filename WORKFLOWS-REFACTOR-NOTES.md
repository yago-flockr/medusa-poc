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

### `vendor-orders` (445 lines across 7 files)

- `route.ts` (96, list) and `[id]/route.ts` (27, get) call **zero workflow
  today** — pure `query.graph` straight in the route. Worse starting point
  than stock-locations was (that one at least had workflows for the writes).
- `[id]/accept/route.ts` and `[id]/dispatch/route.ts` call existing
  old-pattern workflows (`accept-consignment`, `dispatch-consignment`, ~20
  lines each) that in turn depend on `workflows/shared/steps/set-consignment-status.ts`
  — a **genuinely global shared step** (not domain-local), likely also
  relevant to `create-consignments` and any future admin-side consignment
  work. Worth deciding up front whether to migrate this one small step to
  the new convention as part of this domain (cheap, single file) rather than
  TODO-duplicating it.
- Stray files: `assert-owned-consignment.ts` (27 lines), `build-consignment-detail.ts`
  (173 lines — the biggest single mapper in the codebase).
- Naming question worth discussing before starting: the route tree is
  `/vendors/orders/*` but the actual resource being read/mutated is a
  **consignment** (one vendor's slice of an order), not the order itself.
  Does the new workflow domain fold be `workflows/vendor-orders/` (matches
  the route) or `workflows/vendor-consignments/` (matches the actual
  resource)? No existing precedent settles this either way yet.

### `vendor-products` (774 lines across 12 files) — biggest, messiest

- `route.ts` (136), `[id]/route.ts` (160), `[id]/inventory/route.ts` (120) —
  all still raw `query.graph` + inline branching.
- 9 stray helper files: 4 `assert-*` (owned-product, owned-variant,
  editable-product, publishable-product), `build-product-detail.ts` (74),
  `build-variants.ts` (113), `product-completeness.ts` (3), plus the new
  TODO'd `assert-owned-stock-location.ts` duplicate from this session.
- Depends on `create-vendor-product` (old, flat single file, no `steps/`)
  and `set-vendor-inventory-level` (old, folder + one step). Both would need
  full migration alongside this domain, not TODO'd — they're the actual
  mutation workflows this domain's create/update routes call.
- This is the domain the original (deleted) ADR called the reference
  domain — by far the largest single unit of work of the three.

### Domain 2 (separate concern from either of the above): Shopify install-link duplication

- `admin/vendors/[id]/shopify/connection/install-link/route.ts` and
  `vendors/me/shopify/connection/install-link/route.ts` are **line-for-line
  identical business logic**, confirmed by diff this session — only the
  vendor-identity resolution differs (route param vs. authenticated actor).
  Per the "one capability, one workflow" rule: needs one shared workflow
  taking `vendorId`, each route only differing in how it resolves that id.
  This touches both `admin/` and `vendor/` route trees at once, so it's a
  different shape of work than a single-actor domain migration — flagged
  separately rather than folded into vendor-products just because it also
  touches Shopify.

## Not investigated yet

`vendors/me` (base route + Shopify products/import), `vendors/uploads`,
`admin/**` more broadly. Only looked at what's needed to scope the three
items above.

## Suggested next conversation, not a decision

Given `vendor-products` is the biggest and has two real old-pattern
workflow dependencies to bring along, and `vendor-orders` has a smaller,
cleaner scope but one genuinely shared step to decide on — `vendor-orders`
might be the better next step (closer in size/shape to what we just did),
saving `vendor-products` for its own dedicated stretch. But this is exactly
the kind of call Yago should make, not something to just proceed on.
