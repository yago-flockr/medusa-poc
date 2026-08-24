# SOLID Principles

Well-known industry patterns (not invented for this repo) — apply them on
every change without being asked.

This repo's Medusa-specific layering (route → workflow → module service,
extend-don't-fork) already lives in `agents/overview.md`'s "Engineering
principles" and `agents/backend.md`. This file is the general OOP/TS version
underneath it — the same ideas, stated so they apply to any file, not just
the route/workflow/module shape.

## Single Responsibility

- A function does one thing; a class/module owns one concern. If a Medusa
  step or an Admin hook is doing two unrelated things (e.g. validating input
  *and* formatting a response), split it.
- Signal it's grown too big: you can't describe what it does in one sentence
  without "and". That's the trigger to split — not a specific line count.

## Open/Closed

- This is `agents/overview.md`'s "Open for extension, closed for
  modification" restated generally: extend via a new implementation, a hook,
  or a lookup map — don't add a new branch to an existing `switch`/`if` chain
  every time a new variant shows up (e.g. a new file-upload MIME type, a new
  vendor status).
- Concretely in this repo: `workflows/hooks/*.ts` (a callback registered onto
  an existing core workflow's extension point) is the Medusa version of
  Open/Closed — extend `createProductsWorkflow` via its `productsCreated`
  hook rather than forking the workflow.

## Liskov Substitution

- If two things share a type/interface (e.g. two file-storage providers, two
  payment providers), either one must be swappable without the caller
  changing. A provider that throws `"not implemented"` for part of the
  interface it claims to satisfy breaks this.
- `docs/plan.md`'s "keep provider and host choices at the edges" is this
  principle applied to this repo's payment/tax/carrier/search seams.

## Interface Segregation

- Don't force a caller to depend on methods it doesn't use. A contract type
  (`api/admin/<resource>/contract.ts`) should expose only what that
  resource's create/update/list actually needs — not one giant shared shape
  every resource partially uses.
- If a type is used by two callers that each only touch half its fields,
  that's the signal to split it, not a fixed property count.

## Dependency Inversion

- Depend on the abstraction Medusa gives you (a module service, a workflow
  step's injected `container`), not a concrete implementation reached into
  directly. This is `agents/backend.md`'s "do not open a raw DB client... in
  routes" — routes and steps depend on the module service, never the
  underlying driver.

## Example (this repo's shape)

```ts
// BAD — one step doing two unrelated things, and a growing if/else
// for every new vendor connection type
async function handleVendorConnection(vendor: Vendor, type: string) {
  if (type === "shopify") {
    /* validate + persist + notify, all inline */
  } else if (type === "woocommerce") {
    /* another full inline branch */
  }
}

// GOOD — one responsibility per step, new providers added without
// touching the existing ones
type VendorConnectionProvider = {
  connect(vendor: Vendor): Promise<void>
}

const providers: Record<string, VendorConnectionProvider> = {
  shopify: shopifyConnectionProvider,
}
```
