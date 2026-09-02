# Contract → keys → hook naming chain

Every vendor contract schema, router key, mutation/query key, and hook name
is **mechanically derived from the backend route's HTTP method + path** —
never hand-picked. This is deliberate: a name that describes the route
(`postVendorsProducts`) can never drift from the route it describes, and a
new route never needs a naming judgment call — the algorithm always gives
exactly one right answer. Reference example throughout: **vendor login**
(`POST /auth/vendor/emailpass`). Copy this shape for every new operation —
don't invent a parallel naming style for a new one.

For what happens **after** the hook — the form that consumes it — see the
sibling doc `docs/vendor-hook-form-pattern.md`.

## The algorithm

`<method, lowercase><each path segment, PascalCased, literally>` + `Input` /
`Response`. A `:id` path param becomes `ById`. Hyphens are dropped and the
next letter capitalized (`stock-locations` → `StockLocations`).

```
GET  /vendors/products/:id   →  getVendorsProductsById
POST /vendors/products/:id   →  postVendorsProductsById
POST /auth/vendor/emailpass  →  postAuthVendorEmailpass
```

This applies to the router key in `contract.ts`, the top-level Input/Response
schema + type, the mutation/query key, and the hook name — all four are the
exact same word, every time.

## The full table (every current vendor operation)

| Method + path | Router key / key / hook name |
|---|---|
| `GET /vendors/me` | `getVendorsMe` |
| `PATCH /vendors/me` | `patchVendorsMe` |
| `PATCH /vendors/me/shopify/connection` | `patchVendorsMeShopifyConnection` |
| `GET /vendors/me/shopify/connection/install-link` | `getVendorsMeShopifyConnectionInstallLink` |
| `GET /vendors/me/shopify/products` | `getVendorsMeShopifyProducts` |
| `POST /vendors/me/shopify/products/import` | `postVendorsMeShopifyProductsImport` |
| `GET /vendors/orders` | `getVendorsOrders` |
| `GET /vendors/products` | `getVendorsProducts` |
| `POST /vendors/products` | `postVendorsProducts` |
| `GET /vendors/products/:id` | `getVendorsProductsById` |
| `POST /vendors/products/:id` | `postVendorsProductsById` |
| `DELETE /vendors/products/:id` | `deleteVendorsProductsById` |
| `GET /vendors/stock-locations` | `getVendorsStockLocations` |
| `POST /vendors/stock-locations` | `postVendorsStockLocations` |
| `GET /vendors/products/:id/inventory` | `getVendorsProductsByIdInventory` |
| `POST /vendors/products/:id/inventory` | `postVendorsProductsByIdInventory` |
| `POST /vendors/uploads` (multipart, not ts-rest-served) | `postVendorsUploads` |
| `POST /auth/vendor/emailpass` (core Medusa route, no `route.ts` in this repo) | `postAuthVendorEmailpass` |

Login proves the rule has no exceptions: it isn't backed by a file in
`apps/backend/src/api/**` at all (it's Medusa's own built-in auth route), but
the literal path is still known (`/auth/vendor/emailpass`), so the same
algorithm still applies — there is no manual/semantic fallback name reserved
for "the one route with no `route.ts` file."

## Worked example: login, end to end

| # | Layer | File | Exports |
|---|-------|------|---------|
| 1 | API contract — request | `packages/api-contracts/src/vendor/auth.ts` | `postAuthVendorEmailpassInputSchema`, `PostAuthVendorEmailpassInput` |
| 2 | API contract — response | same file | `postAuthVendorEmailpassResponseSchema`, `PostAuthVendorEmailpassResponse` |
| 3 | Mutation key | `apps/storefront/src/vendor/hooks/mutations/mutation-keys.ts` | `mutationKeys.auth.postAuthVendorEmailpass` → `["postAuthVendorEmailpass"]` |
| 4 | Hook | `apps/storefront/src/vendor/hooks/mutations/auth.ts` | `usePostAuthVendorEmailpass` |
| 5 | Call site local var | `.../vendor/_components/vendor-auth-gate.tsx` | `const postAuthVendorEmailpass = usePostAuthVendorEmailpass()` |

The word `postAuthVendorEmailpass` runs through every layer, including the
call site's own local variable name (per the existing "hook result const
matches hook name" convention) — given any one of these five, you can guess
every other one without opening a file.

## The hard rules

1. **Every contract has an `InputSchema` + `InputType`, always, named by the
   algorithm above** — never a semantic verb like `createProduct` or
   `login`. The Zod schema is the source of truth, the type is
   `z.infer<typeof ...>`, never hand-declared.
2. **Every contract has a `ResponseSchema` + `ResponseType`**, same rule:
   `postAuthVendorEmailpassResponseSchema` / `PostAuthVendorEmailpassResponse`.
3. **A GET query-string schema is still an `Input`** — the client sends it to
   the server the same as a body, just via the URL. `getVendorsProductsInputSchema`
   /`GetVendorsProductsInput` covers the `?limit=&offset=` query params for
   `GET /vendors/products`, named after the same route stem as any other Input.
4. **A nested schema used only inside a bigger *request* schema is named
   after that request's route, not given its own semantic name** —
   `postVendorsProductsOptionInputSchema`, `postVendorsProductsImageInputSchema`,
   `postVendorsProductsVariantInputSchema`, `postVendorsProductsByIdVariantInputSchema`
   (nested inside the *update* route's body, hence `ById`),
   `postVendorsStockLocationsAddressInputSchema`. These are still pieces of
   one specific route's payload — verbose and mechanical, same as the top
   level.
5. **A schema reused across two or more *different* routes' responses stays
   domain-named, not mechanical** — `vendorProductSchema`, `vendorOrderSchema`,
   `vendorUserSchema`, `vendorStockLocationSchema`, and the `*DetailSchema`
   family in `products.ts`. This isn't an exception granted for convenience:
   the algorithm requires exactly one owning route, and a shape genuinely
   consumed by two routes has no single route to derive a name from.
6. **A response shape already reused by two routes is not duplicated to give
   each route its own mechanically-named copy** — `POST /vendors/products/:id`
   returns the exact same shape as `GET /vendors/products/:id`, so both routes'
   `responses:` point at the one schema, named after the GET (the canonical
   read): `getVendorsProductsByIdResponseSchema`. Same for product inventory's
   GET/POST pair. Duplicating an identical Zod schema just to keep every route's
   name self-contained would violate this repo's DRY rule ("a shape is
   translated in exactly one place") — DRY wins this specific conflict.
7. **Every schema gets exported with its inferred type, however small or
   seemingly private.** No "this one's only used inside this same file"
   exception — a schema that looks internal today may need to be imported
   directly later, and retrofitting an export is a bigger diff than always
   exporting.
8. **The mutation/query key is the exact same word as the router key.**
   `postVendorsProducts` in `contract.ts` → `mutationKeys.products.postVendorsProducts`
   → `["postVendorsProducts"]`. The registry's top-level *group* name (`products`,
   `shopify`, `auth`) is a separate, stable organizational label matching the
   hook **file** it belongs to — it does not change when a route's mechanical
   name changes.
9. **The hook is named exactly after its mutation/query key.**
   `mutationKeys.auth.postAuthVendorEmailpass` → `usePostAuthVendorEmailpass`.
10. **Every hook is typed with the contract's `Input`/`Response` types**,
    never a locally re-typed shape.
11. **Every hook has a destined form.** `usePostAuthVendorEmailpass` pairs
    with `LoginForm` — see `docs/vendor-hook-form-pattern.md` for the rules
    that pick up from here (the **form's own** schema/component name is a
    separate, human-facing naming decision, not mechanically derived — a form
    is UI, not a wire contract).

## Three more conventions every hook file follows

These aren't about naming — they're about how the hook files themselves are
structured. Verified across every file in
`apps/storefront/src/vendor/hooks/{mutations,queries}/`.

### 1. Keys always live in one central registry file, never inline

`mutation-keys.ts` and `query-keys.ts` are the **only** two files in their
respective folders allowed to write a key literal (`["someKey"] as const`).
Every other file only *imports* `mutationKeys`/`queryKeys` and reads a key
off it. No hook ever writes `mutationKey: ["postVendorsProducts"]` directly
inline.

The registry is grouped by domain, and each top-level group name matches one
hook **file** (not the mechanical route name):

| Registry group | Hook file |
|---|---|
| `mutationKeys.auth` | `mutations/auth.ts` |
| `mutationKeys.profile` | `mutations/profile.ts` |
| `mutationKeys.shopify` | `mutations/shopify.ts` |
| `mutationKeys.products` | `mutations/products.ts` |
| `mutationKeys.uploads` | `mutations/uploads.ts` |
| `mutationKeys.stockLocations` | `mutations/stock-locations.ts` |
| `mutationKeys.productInventory` | `mutations/product-inventory.ts` |
| `queryKeys.vendor` | `queries/vendor.ts` |
| `queryKeys.orders` | `queries/orders.ts` |
| `queryKeys.shopifyProducts` | `queries/shopify-products.ts` |
| `queryKeys.products` | `queries/products.ts` |
| `queryKeys.stockLocations` | `queries/stock-locations.ts` |
| `queryKeys.productInventory` | `queries/product-inventory.ts` |

**Why centralize instead of colocating the key next to its hook:** one file
makes every mutation/query key in the whole vendor panel visible in a single
glance — `grep mutation-keys.ts` answers "does this key already exist"
without opening seven files. It also means a future cross-domain
`invalidateQueries` call can import one small file instead of pulling in
another domain's entire hook file just to reach its key.

### 2. A hook is always a single expression, never a function body

```ts
// mutations — direct useMutation call
export const usePostAuthVendorEmailpass = () =>
  useMutation({
    mutationKey: mutationKeys.auth.postAuthVendorEmailpass,
    mutationFn: (input: PostAuthVendorEmailpassInput) =>
      request<PostAuthVendorEmailpassResponse>(...),
  })

// queries — via the createResourceQueryHook factory
export const useGetVendorsProducts = createResourceQueryHook<void, GetVendorsProductsResponse>({
  queryKey: () => queryKeys.products.getVendorsProducts,
  queryFn: async () => { ... },
})
```

Never `export function useX() { const result = useMutation(...); return result }`
— if a hook ever needs extra logic, that logic belongs in the **caller**, not
inside the hook.

The inner `mutationFn`/`queryFn` follows its own fixed shape for every
`vendorClient`-backed hook (everything except the `request()`-based auth hook
and the raw `uploadVendorImages` reference, whose status/401 handling is
already centralized in `client.ts`'s `assertOkResponse`):

```ts
mutationFn: async (body: PostVendorsProductsInput) => {
  const response = await vendorClient.postVendorsProducts({ body })
  if (response.status !== 200) {
    throw new Error(`Unexpected response status ${response.status}`)
  }
  return response.body
}
```

### 3. Static key for no params, key-factory function once a param exists

```ts
mutationKeys.products.postVendorsProducts   // ["postVendorsProducts"] as const
queryKeys.orders.getVendorsOrders           // ["getVendorsOrders"] as const

// query-keys.ts — a fetch-by-id query becomes a function
products: {
  getVendorsProductsById: (productId: string) =>
    ["getVendorsProductsById", productId] as const,
},
```

**Mutations never take the function form, even when the mutation itself
takes an id** — `postVendorsProductsById` (update) and `deleteVendorsProductsById`
both take an `id`, but their mutation keys stay plain tuples. A query key is
a cache address (two different products must produce two different keys); a
mutation key is just a devtools label, nothing is cached by it.

## Recipe: adding a new contract + hook pair

Given a new operation, e.g. `PUT /vendors/bar`:

1. **Derive the name**: `putVendorsBar`.
2. **Contract** — `packages/api-contracts/src/vendor/bar.ts`:
   `putVendorsBarInputSchema`/`PutVendorsBarInput`,
   `putVendorsBarResponseSchema`/`PutVendorsBarResponse`. Register in
   `vendor/contract.ts` as `putVendorsBar: { method: "PUT", path: "/vendors/bar", ... }`.
3. **Key** — add `["putVendorsBar"]` under the matching domain group in
   `mutation-keys.ts`/`query-keys.ts` — never inline in the hook file.
4. **Hook** — `usePutVendorsBar`, typed with `PutVendorsBarInput`/`PutVendorsBarResponse`,
   written as a single expression, with the `response.status !== 200` check
   inside `mutationFn`.

Once the hook exists, continue with `docs/vendor-hook-form-pattern.md` to
build its form and wire the caller.
