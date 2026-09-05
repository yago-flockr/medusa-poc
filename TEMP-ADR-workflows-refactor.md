# ADR (draft/temp): Routes / Workflows / Steps contract for apps/backend

**Status:** Draft — discussion-only, no code changed yet. This file is a
working record of the decisions made while planning the refactor. It will be
superseded once vendor-products is refactored and proven, at which point the
finalized convention moves into `agents/backend.md` and this file is deleted.

## Start here (fresh session, no prior context)

1. Read **Context** and **Decision — the contract** below in full before
   touching anything — the 13 rules are the whole standard, not just
   guidelines for the first domain.
2. Check **Progress** (bottom of Rollout sequencing) for the next unchecked
   step. Do not skip ahead — each step is meant to be built, verified, and
   checked off before the next one starts (standing incremental-development
   preference: one visible step at a time, not a batch).
3. Before writing any code for a step, re-confirm the exact file list for
   that domain yourself (this ADR gives representative examples and line
   counts from the original audit, not an exhaustive per-file checklist —
   the codebase may have moved on since). Use `Definition of done` below to
   know when a step is actually finished.
4. After each step, verify per **Verification** below, then update
   **Progress** in this file before moving on.

## Context

The backend's `src/api` (routes), `src/workflows/*` (workflows), and
`src/workflows/*/steps` (steps) layers had no consistently enforced
responsibility split. Some routes just called a workflow; others contained
direct `query.graph` calls, inline business-rule branching, calls to sibling
helper files, or even bypassed the workflow layer entirely to call an
integration client directly. Result: no single place to look for "the rule,"
changes rippling unpredictably, and a growing pile of ad hoc helper files
next to routes.

An audit (`src/api/**`, `src/workflows/**`) found:

- 29 `route.ts` files, 21 workflows, 32 steps.
- **Workflows layer already clean**: zero direct DB/service calls in any
  workflow file.
- **Steps layer mostly clean**: only 2-3 non-atomic outliers
  (`delete-vendor.ts`, `create-vendor-orders.ts` bundling multiple concerns;
  `resolve-shared-product-options.ts` mixing a step with a pure-function
  library).
- **Routes are where the mismatch concentrates**, specifically
  `src/api/vendors/{products,orders,stock-locations}/`: 13 of 18 stray
  business-logic helper files (`assert-owned-*.ts`, `build-*-detail.ts`,
  etc.) live beside routes instead of being modeled as steps. Worst
  individual files: `vendors/products/route.ts` (135 lines, inline status
  derivation), `vendors/products/[id]/route.ts` (118 lines, 3 inline
  branches), `vendors/products/[id]/inventory/route.ts` (119 lines,
  including a 41-line function defined inline in the route file).

## Decision — the contract

1. **Route = controller.** Parse the request → call one or more workflows →
   shape the response. Nothing else — no business logic, no `query.graph`,
   no sibling helper files. Applies to **GET routes too**: Medusa's own
   convention lets reads skip workflows, but this codebase's reads are not
   simple (joins across multiple `query.graph` calls, ownership scoping,
   real shaping logic), so every route without exception calls a workflow.
2. `src/api/**` may contain only Medusa-mandatory files: `route.ts`,
   `middlewares.ts`, `validators.ts`, `query-config.ts`,
   `additional-data.ts`. Nothing else.
3. **Workflow = orchestrator.** Composes steps via `.run`/`transform`/
   `when-then` only. No raw DB/service calls inline. A pure, I/O-free
   computation belongs in `transform()`, not a dedicated step, unless it
   needs independent reuse or testing.
4. **Step = one atomic unit.** One create, one update, one link, or one
   assert. Every assertion is its own step, named `assert-*`. Every step
   gets real compensation logic regardless of how small the workflow is
   (pre-existing standing rule, reaffirmed here). This applies
   **retroactively to every step touched during this refactor**, not only
   brand-new ones — if an existing step is being moved, renamed, or
   extracted as part of this work and it lacks real compensation, add it
   as part of that same change rather than carrying the gap forward.
5. **Ownership/tenant scoping happens at the query filter**, not via
   fetch-then-assert-then-throw: scope `query.graph` calls by e.g.
   `vendor_id` so an unauthorized/nonexistent id simply returns empty and
   the route treats it as a natural 404. `assert-owned-*` steps remain
   justified specifically inside **mutation** workflows, as an explicit
   pre-condition check before side effects run.
6. **Domain-specific pure mappers** (response shaping, no business rule)
   live colocated at `src/workflows/<domain>/mappers/` — not under
   `src/api/**`, not in a separate top-level "query-mappers" folder.
7. **Shared code is tiered by actual reuse breadth**, promoted only once a
   second real consumer at that broader tier needs it — never speculatively:
   - `src/workflows/shared/` — crosses unrelated actor domains (vendor +
     admin + storefront).
   - `src/workflows/vendors/shared/` — used by 2+ vendor sub-domains.
   - `src/workflows/vendor-products/shared/` — used only within one domain
     cluster.
   - Within any shared tier, pure I/O-free helper functions belong in a
     `.../shared/lib/`-style layer, distinct from `.../shared/steps/` (real
     steps with I/O + compensation) — needed because
     `resolve-shared-product-options.ts` currently mixes both in one file.
8. **One capability exposed through multiple actor-scoped entry points must
   share one workflow.** Confirmed case: the admin-facing and vendor-facing
   Shopify "install-link" routes are line-for-line identical business logic,
   differing only in how vendor identity is resolved (route param vs.
   resolved actor). Fix: one shared workflow taking `vendorId` as input;
   each route tree only differs in how it resolves that id before calling
   it — never in what it calls.
9. **Workflow hooks (`src/workflows/hooks/*.ts`) are an explicit exception
   to rule 1** — they attach to Medusa's own core workflows (e.g.
   `updateProductsWorkflow`) and have no controlling route of ours, so the
   route layer doesn't apply. Rule 4 (atomicity) still does:
   `updated-product.ts` (142 lines) currently bundles change-detection,
   implicit-throw asserts, a raw query in a loop, and link-diffing in one
   handler and needs the same treatment as a bloated step.
10. **Subscribers/jobs** (none exist yet — `src/subscribers/`,
    `src/jobs/` are empty) follow rule 1 too, decided now so it's already
    law before the first one is written.
11. **Cross-cutting request-level concerns become middleware, not a
    re-called helper.** `resolveVendorUser` (resolving vendor identity from
    the authenticated actor) is currently called individually at 9+
    route/step call sites — it becomes middleware attaching e.g.
    `req.vendorUser` once.

## Scope confirmed complete (audit of everything outside src/api and src/workflows)

Checked `src/modules/**` (vendor, brand — pure `MedusaService` boilerplate,
no misplaced logic), `src/links/**` (clean, standard Medusa link-def shape),
`src/admin/**` (Medusa dashboard UI extension — already follows the
established frontend conventions, out of scope for a business-logic
refactor anyway), and `medusa-config.ts` (clean, pure registration). No
action needed on any of these. Two real additions to scope:

12. **Wrap the Shopify integration client in a proper port/adapter.**
    `src/integrations/shopify/{client,oauth,products,mappers,helpers}` is
    currently a bag of loose exported functions with no abstraction —
    imported directly by 6 routes and 4 workflow/step files. Per Yago's own
    standing ports-and-adapters convention (an abstract class as the DI
    token, a concrete adapter bound via a provider), this needs a real
    `abstract class ShopifyClient { ... }` port, resolved through Medusa's
    container, not raw function imports scattered across routes and steps.
    Folded into **Domain 2** (Shopify shared-workflow collapse) since both
    changes touch the same integration.
13. **`src/lib/` has the identical shared-code tiering gap as
    `workflows/shared/` (rule 7), just at the top level.** 7 files mix
    genuinely generic helpers (`generate-random-password.ts`,
    `normalize-timestamps.ts` — no domain knowledge, stay at `lib/`) with
    heavily domain-specific ones (`build-medusa-product-input.ts`, 197
    lines, Shopify/product-import-shaped — belongs in the vendor-products
    domain's own shared tier instead). Consumed directly by 9+ routes across
    brands, vendor-users, vendor-products, vendor-orders, and
    vendor-stock-locations. No separate pass needed — this gets fixed
    organically as each domain's routes are refactored in the sequence
    below, since every domain already touches one or more of these files.

## Verification

This POC has no automated test suite for the backend beyond two existing
precedents — `apps/backend/src/api/admin/vendors/__tests__/contract.unit.spec.ts`
and `apps/backend/src/integrations/shopify/__tests__/oauth.unit.spec.ts` —
and a manual `bruno/` API collection at the repo root.

- **Open question, decide before or during the first domain**: should every
  refactored route/workflow get a contract spec matching the existing
  precedent, or is manual `bruno/` verification sufficient at this POC
  stage? Not decided yet — ask before assuming either way.
- **Manual verification via `bruno/`** (regardless of the answer above):
  - Vendor-products has partial coverage today:
    `bruno/vendors/{create-product,update-product,list-products,
    delete-product,upload-images}.bru`. There is **no** `.bru` request for
    `GET /vendors/products/:id` or the `.../inventory` route — add one when
    refactoring those so they're actually exercised, not just code-reviewed.
  - **Vendor-orders and vendor-stock-locations have zero `bruno/` coverage
    today** — add requests for these domains as part of refactoring them,
    do not refactor them blind.
  - `bruno/admin/{products,vendors,brands,vendor-users}/` covers the
    admin-facing side reasonably; check it still has parity after any
    shared-workflow change (rule 8) affects an admin route.

## Definition of done (per domain)

A domain is not "done" until all of the following hold:

- `grep` for `query.graph` under that domain's `src/api/**` route files
  returns zero hits (every route, reads included, goes through a workflow
  — rule 1).
- `ls` on that domain's route folders contains only mandatory files
  (`route.ts`, `middlewares.ts`, `validators.ts`, `query-config.ts`,
  `additional-data.ts`) — zero stray helper/assert/build files (rule 2).
- Every step touched has real compensation (rule 4, including the
  retroactive clause above).
- The domain's former stray helper files (`assert-owned-*.ts`,
  `build-*-detail.ts`, etc.) are deleted, not just unused — check for
  leftover imports referencing them.
- Relevant `bruno/` requests exist and run without error against a local
  `pnpm run backend:dev` (add missing ones per Verification above).
- **Progress** below is checked off for that step.

## Rollout sequencing

1. Extract `resolveVendorUser` into middleware — small, cross-cutting, done
   first so every later domain is built on the clean version.
2. **Reference domain: vendor-products.** Routes: list, detail, inventory,
   create, update. Includes: ownership-via-query-scoping, mapper split into
   `vendor-products/mappers/`, demoting `resolve-shared-product-options.ts`
   from the global `shared/steps/` tier down to `vendor-products/shared/`
   (its only real consumers are all inside this domain).
3. Apply the same template mechanically to **vendor-orders** and
   **vendor-stock-locations** (confirmed same violation shape — re-verify
   the exact stray-file list for each before starting, per Start Here §3).
4. **Domain 2**: collapse the admin/vendor Shopify install-link and
   product-import duplication into shared workflow(s) per rule 8, and wrap
   the Shopify integration client in a proper port/adapter per rule 12
   (same integration, done together).
5. **Domain 3**: clean up workflow hooks (`updated-product.ts`) per rule 9.
6. Once vendor-products is refactored and verified working, write the
   finalized convention into `agents/backend.md` using vendor-products as
   the canonical reference module (mirrors the "courses" reference-module
   pattern from prior projects) — delete this file at that point.

## Progress

- [ ] 1. `resolveVendorUser` middleware
- [ ] 2. Reference domain: vendor-products
- [ ] 3a. vendor-orders (template applied)
- [ ] 3b. vendor-stock-locations (template applied)
- [ ] 4. Domain 2: Shopify shared-workflow collapse + port/adapter
- [ ] 5. Domain 3: workflow hooks cleanup (`updated-product.ts`)
- [ ] 6. Finalized convention written into `agents/backend.md`; this file
      deleted
