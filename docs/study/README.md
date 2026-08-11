# Medusa study plan

> Milestone-based, backend-first. No dates: a stage is done when its **Done when**
> line is true, not when you finished reading.

**Goal:** learn Medusa v2 well enough to extend and scale the backend of this
chassis without fighting the framework.

Mental model and how Medusa maps to Nest/Node concepts you already know:
`agents/medusa-learning-map.md`. Roadmap and priorities: `docs/plan.md`.
Feature intents: `docs/features/`.

## How to use this plan

1. Do the stages in order. Each one builds something small in `apps/backend`.
2. Keep the throwaway code — it becomes the seed of a real module later.
3. After each stage, write what surprised you in `docs/study/notes/<stage>.md`.
   Notes in your own words are the point; copying docs is not.
4. Frontend work (shadcn, TanStack, i18n) is a separate track. Do not mix it in.

Installed version: **Medusa 2.18.0**. Prefer docs pages over blog posts; v1
material is a different framework and will mislead you.

---

## Block A — Understand what you already have

### A1. Boot and place a real order

**Goal:** a working baseline you can break safely.
**Build:** follow `docs/pre-start.md`; buy something on the storefront.
**Done when:** the order appears in Admin at `/app`, and you can name the region,
sales channel, and publishable key that made it possible.
**Read:** [Architecture](https://docs.medusajs.com/learn/introduction/architecture)

### A2. Commerce vocabulary

**Goal:** speak the domain before customizing it.
**Build:** nothing. Trace one order in Admin: product → variant → cart → payment
collection → order → fulfillment.
**Done when:** you can explain in one sentence each: variant vs product, region
vs sales channel, inventory item vs variant, payment collection vs order.
**Read:** [Commerce Modules](https://docs.medusajs.com/resources/commerce-modules) —
skim [Product](https://docs.medusajs.com/resources/commerce-modules/product),
[Cart](https://docs.medusajs.com/resources/commerce-modules/cart),
[Order](https://docs.medusajs.com/resources/commerce-modules/order),
[Sales Channel](https://docs.medusajs.com/resources/commerce-modules/sales-channel),
[Inventory](https://docs.medusajs.com/resources/commerce-modules/inventory).

### A3. Container and Query

**Goal:** read data the Medusa way instead of opening a SQL client.
**Build:** a script under `src/scripts/` run with
`pnpm exec medusa exec ./src/scripts/<file>.ts` that resolves Query from the
container and prints products with their variants and prices.
**Done when:** the script prints data fetched with `query.graph(...)`, no raw SQL.
**Read:** [Medusa Container](https://docs.medusajs.com/learn/fundamentals/medusa-container),
[Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
[Custom CLI Scripts](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts)

---

## Block B — The extension model (the core of the framework)

> **Running example: Brand.** Blocks B and C build one feature end to end — a
> brand that owns products — because it mirrors the official customization
> tutorial and grows into the vendor of `docs/features/multi-vendor-marketplace.md`.
> Tutorial index: [Build Custom Features](https://docs.medusajs.com/learn/customization/custom-features).

### B1. Your first module

**Goal:** own a table without owning the query layer.
**Build:** `src/modules/brand` with one data model (`Brand`: `name`, `handle`), a
service extending `MedusaService`, the `Module(...)` definition, and registration
in `medusa-config.ts`. Then `pnpm exec medusa db:generate brand` and `db:migrate`.
**Done when:** the `brand` table exists in Postgres and you created a row from a
script. Update `apps/backend/docs/ER_MODEL.md` in the same session.
**Read:** [Implement Brand Module](https://docs.medusajs.com/learn/customization/custom-features/module),
[Modules](https://docs.medusajs.com/learn/fundamentals/modules),
[Data Models](https://docs.medusajs.com/learn/fundamentals/data-models),
[Service Factory](https://docs.medusajs.com/resources/service-factory-reference)

### B2. Module links

**Goal:** relate your module to core commerce data without foreign keys into
Medusa's tables.
**Build:** `src/links/brand-product.ts` linking `Brand` to
`ProductModule.linkable.product`, then `db:migrate` to sync the link table.
**Done when:** `query.graph({ entity: "product", fields: ["brand.*"] })` returns
the linked brand.
**Read:** [Define the link](https://docs.medusajs.com/learn/customization/extend-features/define-link),
[Query linked records](https://docs.medusajs.com/learn/customization/extend-features/query-linked-records),
[Module Links](https://docs.medusajs.com/learn/fundamentals/module-links),
[Link](https://docs.medusajs.com/learn/fundamentals/module-links/link),
[Module Isolation](https://docs.medusajs.com/learn/fundamentals/modules/isolation)

### B3. Workflows and steps

**Goal:** the place where business logic belongs in Medusa.
**Build:** `createBrandWorkflow` — a custom step that creates the brand with a
compensation function that deletes it.
**Done when:** you force an error after the step and see the compensation undo it.
**Read:** [Create Brand Workflow](https://docs.medusajs.com/learn/customization/custom-features/workflow),
[Workflows](https://docs.medusajs.com/learn/fundamentals/workflows),
[Compensation Function](https://docs.medusajs.com/learn/fundamentals/workflows/compensation-function),
[transform](https://docs.medusajs.com/learn/fundamentals/workflows/variable-manipulation),
[when-then](https://docs.medusajs.com/learn/fundamentals/workflows/conditions),
[Workflow Constraints](https://docs.medusajs.com/learn/fundamentals/workflows/constructor-constraints)

### B4. Reusing core workflows

**Goal:** extend Medusa's own flows instead of reimplementing them.
**Build:** hook into `createProductsWorkflow` so that creating a product with a
`brand_id` in `additional_data` links it to the brand.
**Done when:** one Admin call creates a product already linked to its brand, and
a failure in your hook rolls the product creation back.
**Read:** [Extend the create product flow](https://docs.medusajs.com/learn/customization/extend-features/extend-create-product),
[additional_data](https://docs.medusajs.com/learn/fundamentals/api-routes/additional-data),
[Nested workflows](https://docs.medusajs.com/learn/fundamentals/workflows/execute-another-workflow),
[Workflow Hooks](https://docs.medusajs.com/learn/fundamentals/workflows/workflow-hooks)

### B5. API routes, validation, middlewares

**Goal:** thin HTTP layer over workflows.
**Build:** `POST /admin/brands` that validates with Zod
(`@medusajs/framework/zod`) via `validateAndTransformBody`, then runs the B3
workflow. Register it in `src/api/middlewares.ts`.
**Done when:** a bad body returns 400 from the middleware, a good one runs the
workflow, and the route handler has no business logic in it.
**Read:** [API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes),
[Validation](https://docs.medusajs.com/learn/fundamentals/api-routes/validation),
[Middlewares](https://docs.medusajs.com/learn/fundamentals/api-routes/middlewares),
[Errors](https://docs.medusajs.com/learn/fundamentals/api-routes/errors)

### B6. Events, subscribers, scheduled jobs

**Goal:** react to commerce without coupling to the checkout path.
**Build:** a subscriber on `order.placed` that logs the order total, and a
scheduled job that logs a daily count.
**Done when:** both fire locally, and you can explain why they run on the
**worker**, not the server, in production (see D1).
**Read:** [Events and Subscribers](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers),
[Emit Events](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers/emit-event),
[Scheduled Jobs](https://docs.medusajs.com/learn/fundamentals/scheduled-jobs)

### B7. Admin extensions

**Goal:** surface custom data to staff without a second dashboard.
**Build:** a widget on the product details page showing the linked brand.
**Done when:** the widget renders in `/app` with real data.
**Read:** [Add a product widget](https://docs.medusajs.com/learn/customization/customize-admin/widget),
[Admin Development](https://docs.medusajs.com/learn/fundamentals/admin),
[Widgets](https://docs.medusajs.com/learn/fundamentals/admin/widgets),
[UI Routes](https://docs.medusajs.com/learn/fundamentals/admin/ui-routes)

---

## Block C — Marketplace-shaped problems

This block is where the chassis earns its value. Intent and design:
`docs/features/multi-vendor-marketplace.md` and
`docs/features/commission-and-payouts.md`. Experiment protocol:
`docs/spikes/multi-vendor-order.md`. The bar for this block is **What "working"
means for the marketplace** in `docs/plan.md`, not the stages below.

### C1. Custom actor types and vendor isolation

**Goal:** authenticate a user who is neither `admin` nor `customer`.
**Build:** actor type `vendor`, registration through
`/auth/vendor/emailpass/register`, `setAuthAppMetadataStep` in the create-vendor
workflow, and `authenticate("vendor", ...)` on `/vendors/*`.
**Done when:** a vendor token can read only that vendor's products.
**Read:** [Actor Types](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types),
[Create an Actor Type](https://docs.medusajs.com/resources/commerce-modules/auth/create-actor-type),
[Protected Routes](https://docs.medusajs.com/learn/fundamentals/api-routes/protected-routes)

### C2. Order splitting

**Goal:** one customer payment, one order per vendor behind it.
**Build:** the spike in `docs/spikes/multi-vendor-order.md`, following the
official recipe.
**Done when:** a two-vendor cart produces one parent order and two child orders,
and a forced failure cancels the children.
**Read:** [Marketplace recipe](https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors),
[example repo](https://github.com/medusajs/examples/tree/main/marketplace)

### C3. Concurrency and idempotency

**Goal:** the same lesson the recipe teaches implicitly — a checkout workflow can
run twice.
**Build:** add `acquireLockStep` / `releaseLockStep` around cart completion and a
`when` guard that skips work if the links already exist.
**Done when:** calling the complete endpoint twice produces one set of child
orders.
**Read:** [Locking in Workflows](https://docs.medusajs.com/learn/fundamentals/workflows/locks),
[Locking Module](https://docs.medusajs.com/resources/infrastructure-modules/locking)

### C4. Money: commission and a payout run

**Goal:** the half of a marketplace Medusa has no concept of — what a vendor is
owed. Intent: `docs/features/commission-and-payouts.md`.
**Build:** a commission rate per vendor, an append-only ledger entry written
*inside* the order workflow, and a scheduled job that settles eligible entries
into a simulated payout.
**Done when:** placing an order writes the split as a stored fact, the job settles
it, and a later partial refund adjusts only that vendor's balance — with the
original entries still intact.
**Read:** [Scheduled Jobs](https://docs.medusajs.com/learn/fundamentals/scheduled-jobs),
[Big Numbers](https://docs.medusajs.com/learn/fundamentals/data-models/big-numbers),
[Long-Running Workflows](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow)

---

## Block D — Scaling and operating the backend

### D1. Server and worker split

**Goal:** the main scaling lever in Medusa.
**Build:** `workerMode: process.env.WORKER_MODE || "shared"` and
`admin.disable` driven by env in `medusa-config.ts`.
**Done when:** you can run a server-only and a worker-only process locally and
show that subscribers fire only in the worker.
**Read:** [Worker Mode](https://docs.medusajs.com/learn/production/worker-mode)

### D2. Infrastructure modules

**Goal:** replace in-memory defaults that do not survive more than one process.
**Build:** configure the Redis-backed Event, Workflow Engine, Locking, and
Caching modules against the Docker Compose Redis.
**Done when:** an event emitted by the server process is handled by the worker
process.
**Read:** [Infrastructure Modules](https://docs.medusajs.com/resources/infrastructure-modules),
[Event](https://docs.medusajs.com/resources/infrastructure-modules/event),
[Workflow Engine](https://docs.medusajs.com/resources/infrastructure-modules/workflow-engine),
[Caching](https://docs.medusajs.com/resources/infrastructure-modules/caching)

### D3. Long-running work

**Goal:** know what to do when a step takes minutes (payouts, imports, ERP sync).
**Build:** turn one step async and complete it externally.
**Done when:** you can describe when to use a subscriber, a scheduled job, or a
long-running workflow — and why.
**Read:** [Long-Running Workflows](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow),
[Retry Failed Steps](https://docs.medusajs.com/learn/fundamentals/workflows/retry-failed-steps),
[Store Executions](https://docs.medusajs.com/learn/fundamentals/workflows/store-executions)

### D4. Testing and observability

**Goal:** change the chassis without fear.
**Build:** an integration test for the B3 workflow and the B5 route with
`@medusajs/test-utils` (already a dev dependency).
**Done when:** `pnpm test` covers one module, one workflow, one route.
**Read:** [Testing Tools](https://docs.medusajs.com/learn/debugging-and-testing/testing-tools),
[Workflow tests](https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/integration-tests/workflows),
[Logging](https://docs.medusajs.com/learn/debugging-and-testing/logging),
[Instrumentation](https://docs.medusajs.com/learn/debugging-and-testing/instrumentation)

### D5. Packaging the chassis

**Goal:** make marketplace support optional per clone (decision in
`docs/plan.md`).
**Build:** move the vendor/commission work into a plugin or an
env-toggled module entry in `medusa-config.ts`.
**Done when:** a clone without the toggle boots with no vendor tables in use.
**Read:** [Plugins](https://docs.medusajs.com/learn/fundamentals/plugins),
[Create a Plugin](https://docs.medusajs.com/learn/fundamentals/plugins/create),
[Module Options](https://docs.medusajs.com/learn/fundamentals/modules/options)

---

## Traps to avoid

- Reaching for a raw DB client or writing SQL in a route. Use Query and services.
- Editing a data model without `db:generate` — the schema silently never applies.
- Manipulating variables directly inside a workflow constructor instead of
  `transform` / `when`.
- Copying v1 tutorials. Check that the page lives under `docs.medusajs.com/learn`
  or `/resources`.
- Building a parallel service next to a core flow because extending it looked
  harder. That is the one thing this repo forbids.
