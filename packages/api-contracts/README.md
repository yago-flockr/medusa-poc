# @dtc/api-contracts

Shared Zod schemas for backend↔frontend HTTP contracts, one folder per
domain. Backend and frontend both import the same schema — never hand-copy
a type.

## When a schema belongs here

**Always.** Every custom HTTP request/response schema in this repo — admin
routes and vendor routes alike — lives here, whether or not a second app
currently calls that route. This used to be scoped narrower ("only if
`apps/storefront` actually calls it; an Admin-only schema stays in a local
`contract.ts` next to the route"), which sounds reasonable but doesn't hold
up: it means a schema has to be *moved* the moment a route gains a second
consumer, and in practice that boundary call is easy to get wrong or forget
— a real inconsistency this repo hit once already. Centralizing
unconditionally means that never happens again; the cost is one import hop
for a schema Admin happens to be the only consumer of today, which is
nothing next to a schema silently drifting out of sync later.

The one thing this does **not** relax: this package must never ship
**Medusa runtime code** into `apps/storefront`'s bundle — a plain Next.js
app that also depends on it. That's a narrower rule than "no Medusa
imports at all": a **type-only** import (`import type {...}`) is always
safe, because TypeScript fully erases it at compile time — nothing is
emitted, so nothing reaches a bundler regardless of how large the source
package is. `@medusajs/types` is exactly this: a real dependency of this
package, used for `FindParams` / `PaginatedResponse<T>` / `DeleteResponse<T>`
(`import type {...} from "@medusajs/types"`) instead of hand-declaring
plain-TS equivalents — hand-duplicating a type Medusa already exports is
its own mistake (drifts out of sync, and is exactly the "never hand-copy a
type" rule at the top of this file, applied to Medusa's own types, not just
ours). What's actually forbidden is a **value** import — `import {...}` of
anything that executes at runtime — from `@medusajs/framework`,
`@medusajs/utils`, or any Medusa package: that really would pull real code
into the bundle. `import { z } from "@medusajs/framework/zod"` is the
concrete case to avoid; plain `zod` always instead. When adding a type
import here, use `import type` (never a bare `import`) and verify with
`pnpm run build` in `apps/storefront` if you're unsure — a leak shows up
immediately as a multi-hundred-KB jump in that route's First Load JS.

## No shared field-validation helpers — write every field inline

Every field's Zod validation is written out in full, directly in the
schema that uses it — `z.string().trim().min(1, "Name is required")`,
right there — never factored into a named helper like
`requiredTrimmedString(message)` or `optionalTrimmedText`, even when the
exact same rule repeats across a create schema and its sibling update
schema, or across two unrelated resources. A helper like that hides *how*
a field is validated behind a name that says nothing about *what* the
field is, so reading `name: name.optional()` tells you nothing until you
go find where `name` was defined — and a change to that helper silently
changes every field that happens to reuse it, including ones you didn't
mean to touch. Prefer the duplication: two schemas each spelling out their
own `title` rule in full are easier to read and safer to change
independently than one shared `titleSchema` reused by both.

This is specifically about **validation-pattern sugar** (trim/optional/
positive-number wrappers with no meaning of their own) — it does not apply
to a schema that names a real thing in the domain. `vendorProductStatusSchema`,
`vendorProductImageSchema`, `vendorProductVariantSchema`, `brandSchema`,
`vendorSchema` — these stay named and reused, because "a product's status"
or "a brand" is one real concept that must have exactly one definition, the
same reasoning as "always centralize" above. The test: does the name
describe a *thing* (a status, an image, a brand) or a *pattern* (an
optional trimmed string, a positive number)? Things get named and reused;
patterns get written out every time.

## Naming chain into hooks and forms

This package only covers the contract half. For how a contract's
`InputSchema`/`ResponseSchema` names carry through the mutation/query key
and the hook on the storefront side, see
`docs/vendor-contract-hook-pattern.md` — worked end to end on the vendor
login flow. `docs/vendor-hook-form-pattern.md` continues from there into
the form (schema, parsers, props) that consumes the hook.

## Structure (per domain)

```
src/<domain>/<resource>.ts   one file per resource: schema + z.infer type
src/<domain>/contract.ts     composes that domain's resources into a ts-rest
                              router — only if that domain has a real ts-rest
                              client consumer (skip it otherwise, see below)
```

Not every domain needs a `contract.ts`. `vendor/` has one because
`apps/storefront`'s vendor panel calls it through a real ts-rest client
(`vendorClient`, built from `vendorContract`). `admin/` does not — the
Admin dashboard calls `sdk.client.fetch()` directly (Medusa's own
convention), so building a ts-rest router nothing consumes would be pure
unused ceremony. Add one only when a domain actually gets a ts-rest client.

## Use it — backend route

```ts
import { getVendorsMeResponseSchema, type GetVendorsMeResponse } from "@dtc/api-contracts/vendor/me"

const response: GetVendorsMeResponse = { vendor_user: {...}, vendor: {...} }
res.json(getVendorsMeResponseSchema.parse(response)) // validates + strips extra fields
```

## Use it — frontend

```ts
import { vendorClient } from "@/vendor/lib/contract-client"

const response = await vendorClient.getVendorsMe()
if (response.status !== 200) throw new Error(...)
return response.body // fully typed, no annotation needed
```

Every schema/type/router-key/hook name in `vendor/` is mechanically derived
from the route's method + path (`GET /vendors/me` → `getVendorsMe`), never
hand-picked — see `docs/vendor-contract-hook-pattern.md` for the full
algorithm and `docs/vendor-hook-form-pattern.md` for how a form built on top
of a hook is named instead (its own human-facing name, not route-derived).

That's 90% of "using" this package: import a schema on the backend, call
`<domain>Client.<method>()` on the frontend.

## Use it — Admin dashboard (no ts-rest client)

`admin/` has no router/client, so both sides just import the resource file
directly:

```ts
// apps/backend/src/api/admin/brands/validators.ts (backend)
import { brandListFiltersSchema } from "@dtc/api-contracts/admin/brands"

// apps/backend/src/admin/hooks/queries/brands.ts (Admin dashboard)
import type { BrandListQuery, BrandListResponse } from "@dtc/api-contracts/admin/brands"
```

## Adding a resource to an existing domain

Say you're adding `GET /vendors/foo` (a `vendor/` route, called from
`apps/storefront` through the ts-rest client):

1. **`src/vendor/foo.ts`** — new file, named after the route
   (`GET /vendors/foo` → `getVendorsFoo`):
   ```ts
   import { z } from "zod"
   export const getVendorsFooResponseSchema = z.object({ bar: z.string() })
   export type GetVendorsFooResponse = z.infer<typeof getVendorsFooResponseSchema>
   ```
2. **`src/vendor/contract.ts`** — register it under that same name:
   ```ts
   getVendorsFoo: { method: "GET", path: "/vendors/foo", responses: { 200: getVendorsFooResponseSchema } }
   ```
3. Use it exactly like the two snippets above, swap `Me` → `Foo`.

Adding `GET /admin/foo` (an `admin/` route, called only from the bundled
Admin dashboard) skips step 2 — just the resource file, imported directly
by the route/validator on the backend and by the hook on the Admin side.

## Adding a whole new domain

New top-level resource unrelated to vendors or admin? Copy `src/vendor/`'s
shape into `src/<new-domain>/` if it needs a ts-rest client, or `src/admin/`'s
shape (resource files only, no `contract.ts`) if it doesn't.

## Multipart/file-upload routes

A route's request/response *shape* still belongs here even if it's a file
upload (e.g. `vendor/uploads.ts` for `POST /vendors/uploads`) — only the
ts-rest **router** entry is skipped: this version of `@ts-rest/core` has no
multipart body support, so a multipart route is never registered in
`contract.ts` and the frontend calls it through a plain `fetch` +
`FormData` function instead of the ts-rest client (see
`vendor/lib/client.ts`'s `uploadVendorImages` for the pattern — reuses the
same `assertOkResponse` error/401 handling as every other call, just skips
`Content-Type: application/json` since the browser sets its own multipart
boundary header for `FormData`). The backend route still validates its
response against the schema here before `res.json()`, same as any other
route.

## Not for

| This                                                                      | Use instead                          |
| ------------------------------------------------------------------------- | ------------------------------------ |
| Core Medusa resources (product, order, cart...)                           | `HttpTypes` / JS SDK                 |
| Internal Medusa data relations (e.g. product ↔ vendor) — not an HTTP call | Medusa module links (`src/links/`)   |
| `/auth/vendor/emailpass` (core Medusa route, not ours)                    | `vendor/lib/client.ts`'s `request()` |

## Gotcha

`@ts-rest/core` is pinned to `3.53.0-rc.1` (a prerelease), on purpose:
stable `3.52.1` requires `zod@^3.x`, this repo is on `zod@4.x`. Don't bump
to `latest` without checking zod-4 support first.
