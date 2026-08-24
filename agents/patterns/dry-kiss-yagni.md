# DRY, KISS & YAGNI

Well-known industry patterns (not invented for this repo) — apply them on
every change without being asked.

## DRY (Don't Repeat Yourself)

**This repo's rule is stricter than the general "rule of three" heuristic —
follow this repo's version, from `agents/overview.md`:** a shape is
translated in exactly one place — a contract file, a mapper — never
hand-copied into a second type because that was faster than importing the
first. If you're about to redefine something Medusa or an existing contract
already types, import it instead of writing a second version.

Concretely: `api/admin/<resource>/contract.ts` is the one place a resource's
entity/list/create/update shapes are defined; `mappers/<entity>.mapper.ts` is
the one place a persistence shape converts to/from a domain shape. Don't
re-derive either by hand in a second file, even once — this is not a
duplicate-it-twice-then-extract situation like plain application code might
allow elsewhere; a hand-copied type silently drifts from the source the
moment either side changes.

For everything that isn't a shared type/shape (e.g. two workflows that
happen to both build a similar-looking query), the general "don't extract
prematurely" judgment in KISS/YAGNI below still applies — extract a shared
helper once a third real use case shows the abstraction is actually correct,
not on the first hint of similarity.

## KISS (Keep It Simple)

- Reach for the Medusa primitive (module, workflow, link, subscriber, job)
  before reaching for a new abstraction — `agents/overview.md`'s KISS
  principle. A generic factory or wrapper class for a single use case is not
  simpler than the direct call it wraps.
- Prefer early returns / guard clauses over nested control flow — see
  `agents/patterns/clean-code.md`.

## YAGNI (You Aren't Gonna Need It)

- Don't add a config flag, generic type parameter, or extension point for a
  variant that doesn't exist yet. `docs/plan.md`'s "Not decided" items stay
  undecided until a real clone needs the answer — marketplace support itself
  is opt-in per clone for the same reason.
- This repo has a real example of over-building and then cutting it back:
  vendor + first-user creation was originally one atomic workflow (with
  compensation across all three side effects) before being split into two
  independent CRUDs, because nothing actually needed them to succeed-or-fail
  as one unit — see `agents/backend.md`'s "Vendor and VendorUser are two
  separate, independent CRUDs" note. That's the shape of YAGNI to apply here:
  cut speculative coupling, keep it split until a real requirement forces
  otherwise.

## Example (this repo's shape)

```ts
// BAD — a second, hand-copied version of the Vendor shape instead of
// importing the one true contract
type VendorRow = { id: string; name: string; handle: string }

// GOOD — import the one place this shape is defined
import type { VendorResponse } from "../api/admin/vendors/contract"
```
