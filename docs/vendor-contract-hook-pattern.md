# Contract → keys → hook naming chain

How a single vendor operation (e.g. "log in") stays typed and traceable
from the shared `@dtc/api-contracts` package down to its TanStack Query
hook, plus the structural conventions every hook file itself follows (key
registry, hook shape, key parameterization) — verified across every domain
in `apps/storefront/src/vendor/hooks/`, not just login. Reference example
throughout: **vendor login**. Copy this shape for every new `/vendors/*`
(or `/auth/vendor/*`) operation — don't invent a parallel naming or
structural style for a new one.

For what happens **after** the hook — the form that consumes it — see the
sibling doc `docs/vendor-hook-form-pattern.md`.

## The chain, at a glance

| # | Layer | File (login example) | Exports |
|---|-------|------------------------|---------|
| 1 | API contract — request | `packages/api-contracts/src/vendor/auth.ts` | `loginVendorInputSchema`, `LoginVendorInput` |
| 2 | API contract — response | same file | `loginVendorResponseSchema`, `LoginVendorResponse` |
| 3 | Mutation/query key | `apps/storefront/src/vendor/hooks/mutations/mutation-keys.ts` | `mutationKeys.auth.login` → `["loginVendor"]` |
| 4 | Hook | `apps/storefront/src/vendor/hooks/mutations/auth.ts` | `useLoginVendor` |

One word stem — `loginVendor` / `LoginVendor` — runs through every layer.
That's what makes the chain traceable: given any one name, you can guess
every other name in the chain without opening a file.

## The hard rules

Non-negotiable for every new vendor contract + hook pair, not just login:

1. **Every contract has an `InputSchema` + `InputType`.**
   `loginVendorInputSchema` / `LoginVendorInput` — the Zod schema is the
   source of truth, the type is `z.infer<typeof ...>`, never hand-declared.
2. **Every contract has a `ResponseSchema` + `ResponseType`**, same rule:
   `loginVendorResponseSchema` / `LoginVendorResponse`.
3. **The mutation/query key matches the contract's name exactly.**
   The leaf key string is the same stem as the schema/type name
   (`"loginVendor"`), not a rephrased verb. See
   `packages/api-contracts/README.md` and `agents/storefront.md` for the
   broader "hook name must match the API it calls" rule this extends
   backward onto the key itself.
4. **The hook is named exactly after its mutation/query key.**
   `mutationKeys.auth.login` → `useLoginVendor`. A reader should never have
   to open the hook body to learn which key it uses.
5. **Every hook is typed with the contract's `Input`/`Response` types**,
   never a locally re-typed shape:
   `mutationFn: ({ email, password }: LoginVendorInput) => request<LoginVendorResponse>(...)`.
6. **Every hook has a destined form.** `useLoginVendor` pairs with
   `LoginForm` — a hook without a form (or vice versa) is a sign the two
   were built out of step. See `docs/vendor-hook-form-pattern.md` for the
   rules that pick up from here.

## Three more conventions every hook file follows

These aren't about naming — they're about how the hook files themselves are
structured. Verified across every file in
`apps/storefront/src/vendor/hooks/{mutations,queries}/`, not just auth/login.

### 1. Keys always live in one central registry file, never inline

`mutation-keys.ts` and `query-keys.ts` are the **only** two files in their
respective folders allowed to write a key literal (`["someKey"] as const`).
Every other file in that folder — `auth.ts`, `profile.ts`, `shopify.ts`,
`products.ts`, `uploads.ts`, `stock-locations.ts`, `product-inventory.ts` for
mutations; `vendor.ts`, `orders.ts`, `shopify-products.ts`, `products.ts`,
`stock-locations.ts`, `product-inventory.ts` for queries — only *imports*
`mutationKeys`/`queryKeys` and reads a key off it. No hook ever writes
`mutationKey: ["loginVendor"]` directly inline.

The registry is grouped by domain, and **each top-level group name matches
one hook file's name** one-to-one:

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

Adding a hook to a domain that already has a file means adding to that
domain's existing group in the registry — never starting a second group for
the same domain, and never adding a key to a group whose file you're not
also touching.

**Why centralize instead of colocating the key next to its hook** (the more
"obvious" option): one file makes every mutation/query key in the whole
vendor panel visible in a single glance — you can `grep` `mutation-keys.ts`
to answer "does this key already exist" or "is this name already taken"
without opening seven files. It also means a future cross-domain
`invalidateQueries` call (e.g. a `products` mutation invalidating a
`productInventory` query) can import one small file instead of pulling in
another domain's entire hook file just to reach its key.

### 2. A hook is always a single expression, never a function body

Every exported hook in these folders is written as one of exactly two
shapes, both single-expression arrow functions with **no block body, no
local variables, no logic of its own**:

```ts
// mutations — direct useMutation call
export const useLoginVendor = () =>
  useMutation({
    mutationKey: mutationKeys.auth.login,
    mutationFn: (input: LoginVendorInput) => request<LoginVendorResponse>(...),
  })

// queries — via the createResourceQueryHook factory
export const useGetProducts = createResourceQueryHook<void, VendorProductsListResponse>({
  queryKey: () => queryKeys.products.getProducts,
  queryFn: async () => { ... },
})
```

Never `export function useX() { const result = useMutation(...); return result }`
— there is nothing to add between calling `useMutation`/`useQuery` and
returning it, so nothing does. If a hook ever needs extra logic (derived
state, a side effect on success), that logic belongs in the **caller**, not
smuggled into the hook itself — same "who owns what" boundary as the
form/caller split in `docs/vendor-hook-form-pattern.md`.

All the actual work happens *inside* `mutationFn`/`queryFn`, and that inner
function follows its own fixed shape for every `vendorClient`-backed hook
(ts-rest calls, i.e. everything except the one legacy `request()`-based auth
route and the one raw `uploadVendorImages` reference in `uploads.ts`):

```ts
mutationFn: async (body: CreateVendorProduct) => {
  const response = await vendorClient.createProduct({ body })
  if (response.status !== 200) {
    throw new Error(`Unexpected response status ${response.status}`)
  }
  return response.body
}
```

Call the contract method → check `response.status !== 200` → throw a bare
`Error` with that exact message template → otherwise return `response.body`.
This is the one place a non-200 becomes a thrown error for a ts-rest call;
don't add a second status-checking style. (The `request()`-based auth hook
and `uploadVendorImages` skip this because their status/401 handling is
already centralized inside `client.ts`'s `assertOkResponse` — see
`agents/storefront.md`'s "A `401` from either... triggers the same logout
automatically" note. Don't re-add a manual status check on top of those.)

### 3. Static key for no params, key-factory function once a param exists

A key with no parameters is a plain `as const` tuple:

```ts
mutationKeys.products.createProduct        // ["createProduct"] as const
queryKeys.orders.getOrders                 // ["getOrders"] as const
```

A **query** key that needs to address one specific resource (fetch-by-id)
becomes a function instead, taking that id and folding it into the tuple:

```ts
// query-keys.ts
products: {
  getProducts: ["getProducts"] as const,
  getProduct: (productId: string) => ["getProduct", productId] as const,
},
productInventory: {
  getProductInventory: (productId: string) =>
    ["getProductInventory", productId] as const,
},
```

and the hook passes the param straight through to it:

```ts
export const useGetProduct = createResourceQueryHook<string, GetVendorProductResponse>({
  queryKey: (productId) => queryKeys.products.getProduct(productId),
  queryFn: (productId) => ...,
})
```

**Mutations never take the function form, even when the mutation itself
takes an id** — `useUpdateProduct` and `useDeleteProduct` both take an `id`
in their input, but `mutationKeys.products.updateProduct` /
`.deleteProduct` are still plain tuples with no id folded in. The reason is
what the key is *for*: a query key is a cache address — TanStack Query uses
it to store and invalidate that exact resource's cached data, so two
different products must produce two different keys. A mutation key is just
a label for devtools/mutation-state tracking, not a cache address (nothing
is cached by mutation key), so it never needs to be parameterized. Don't
"fix" a mutation key into a function out of consistency with queries — that
would be solving a problem that doesn't exist for mutations.

## Recipe: adding a new contract + hook pair

Given a new operation, e.g. `POST /vendors/foo`:

1. **Contract** — `packages/api-contracts/src/vendor/foo.ts`:
   `fooVendorInputSchema`/`FooVendorInput`,
   `fooVendorResponseSchema`/`FooVendorResponse`. Register in
   `vendor/contract.ts` if it's ts-rest-served; skip that step for the one
   legacy `request()`-based auth route (see
   `packages/api-contracts/README.md`, "Not for").
2. **Key** — add `["fooVendor"]` (or, for a fetch-by-id query,
   `(id: string) => ["fooVendor", id] as const`) under the matching domain
   group in `mutation-keys.ts` / `query-keys.ts` — never inline in the hook
   file itself. If the domain has no group yet, its name must match the new
   hook file's name.
3. **Hook** — `useFooVendor` in
   `apps/storefront/src/vendor/hooks/{mutations,queries}/<domain>.ts`,
   typed with `FooVendorInput`/`FooVendorResponse`, written as a single
   expression (`() => useMutation({...})` / `createResourceQueryHook({...})`)
   with the `response.status !== 200` check inside `mutationFn`/`queryFn`.

Once the hook exists, continue with `docs/vendor-hook-form-pattern.md` to
build its form and wire the caller.
