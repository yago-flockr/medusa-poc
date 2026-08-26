# @dtc/api-contracts

Shared Zod schemas for backend↔frontend HTTP contracts, one folder per
domain. Backend and frontend both import the same schema — never hand-copy
a type.

## Structure (per domain)

```
src/<domain>/<resource>.ts   one file per resource: schema + z.infer type
src/<domain>/contract.ts     composes that domain's resources into one router
```

## Use it — backend route

```ts
import { vendorMeResponseSchema, type VendorMeResponse } from "@dtc/api-contracts/vendor/me"

const response: VendorMeResponse = { vendor_user: {...}, vendor: {...} }
res.json(vendorMeResponseSchema.parse(response)) // validates + strips extra fields
```

## Use it — frontend

```ts
import { vendorClient } from "@/vendor/lib/contract-client"

const response = await vendorClient.getMe()
if (response.status !== 200) throw new Error(...)
return response.body // fully typed, no annotation needed
```

That's 90% of "using" this package: import a schema on the backend, call
`<domain>Client.<method>()` on the frontend.

## Adding a resource to an existing domain

Say you're adding `GET /vendors/foo`:

1. **`src/vendor/foo.ts`** — new file:
   ```ts
   import { z } from "zod"
   export const vendorFooResponseSchema = z.object({ bar: z.string() })
   export type VendorFooResponse = z.infer<typeof vendorFooResponseSchema>
   ```
2. **`src/vendor/contract.ts`** — register it:
   ```ts
   getFoo: { method: "GET", path: "/vendors/foo", responses: { 200: vendorFooResponseSchema } }
   ```
3. Use it exactly like the two snippets above, swap `me` → `foo`.

## Adding a whole new domain

New top-level resource unrelated to vendors (e.g. a future `products`
surface)? Copy `src/vendor/`'s shape into `src/<new-domain>/` — same two
file kinds, own `contract.ts`, own client on the consuming side.

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
