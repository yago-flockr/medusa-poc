# Clean Code & Self-Documenting Standards

Well-known industry patterns (not invented for this repo) — apply them on every
change without being asked. This file exists so nobody has to keep repeating
"stop over-commenting" or "stop writing giant functions" in review.

## Commenting rules (strict)

- **No comments explaining *what* the code does.** A well-named function or
  variable already says that; a comment repeating it is noise to maintain.
- **No comment blocks or docstrings on internal, unexported helpers.**
- **Comment only the *why*:** a hidden constraint, a workaround for a specific
  framework quirk, an invariant that isn't obvious from the code around it.
  Example from this repo: `create-vendor-user/steps/generate-random-password.ts`
  is worth a one-line comment saying *why* the password must be
  server-generated (security, not UX — see `agents/backend.md`), because that
  reasoning isn't visible from the code alone. It would not be worth a
  comment saying "generates a random password" — the function name already
  says that.
- If removing a comment wouldn't confuse a future reader, don't write it.

## Naming and expressiveness

- Names are domain-explicit: `resolveVendorUser`, `assertReferencesExist`, not
  `check` or `helper`.
- Booleans and predicates read as questions/assertions: `isEligible`,
  `assertValidObjectId` — a function that throws is named `assert*`, never
  `check*`/`validate*`, so control flow is legible without reading the body.
- No arbitrary abbreviations (`ctx` for a Medusa `MedusaContext`/`req.scope`
  container is an accepted framework convention; inventing your own
  abbreviations like `usr` or `proc` is not).

## Control flow

- Prefer early returns / guard clauses over nested `if/else`. If you're three
  levels deep, that's a signal to extract or invert the condition — see
  `agents/patterns/solid.md` for the extraction threshold.
- Don't add a boolean parameter that switches a function's behavior
  (`syncProducts(vendor, true)`). Split into two named functions, or use a
  discriminated union — see `agents/patterns/type-safety.md`.

## Magic values

- No raw numbers or string literals sprinkled through business logic that a
  reader has to guess the meaning of. Name them (`MAX_VENDOR_VARIANTS`,
  matching the real `max 50 variants` rule in
  `build-variants.ts`/`resolveProductVariants`).
- This does not mean wrapping every literal in a constant — a `0` used as an
  array index or a `1` used as "increment by one" needs no name. Name a value
  when its *meaning*, not its use, would otherwise be unclear.

## Example (this repo's shape)

```ts
// BAD — comments narrate the obvious, nested ifs, unclear boolean
// checks if vendor can create a product
function check(v: Vendor, force: boolean) {
  // if vendor exists
  if (v) {
    // if vendor is active
    if (v.status === "active") {
      if (force) {
        return true
      }
      return v.productCount < MAX_PRODUCTS
    }
  }
  return false
}

// GOOD — self-documenting, early returns, no narrating comments
function canVendorCreateProduct(vendor: Vendor): boolean {
  if (vendor.status !== "active") return false
  return vendor.productCount < MAX_PRODUCTS
}
```
