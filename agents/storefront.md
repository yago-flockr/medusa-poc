# Storefront (`apps/storefront`)

> Context for AI agents in the Next.js customer storefront. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file and the package README if setup/run changes.

## Overview

Next.js App Router storefront from the Medusa DTC starter. Talks to the Medusa Store API. Port default: **8000**.

This is the **customer** surface only. Brand/theme config is a later concern.

**Next.js and server rendering are fixed** (`docs/plan.md`, Fixed): discovery matters too much to ship a client-rendered store. Default to server rendering and treat a client component as a decision to justify. **The UI component library is decided: shadcn-style components in `src/components/ui/*`, each a thin wrapper around a `@base-ui/react/*` primitive** (not Radix — this app uses Base UI), following the exact pattern already set by `button.tsx`/`checkbox.tsx`/`badge.tsx`/`separator.tsx`: import the primitive's namespace, apply variants via `cva` where relevant, merge classes with `cn()`, tag the root with a `data-slot`. When a page needs a primitive this app doesn't have yet (a `Select`, an `AlertDialog`, etc.), check whether `@base-ui/react` ships it (it usually does — mirrors Radix's component set) and build the wrapper properly, matching this exact convention — don't fall back to a native HTML element (`<select>`, `window.confirm`) to avoid the work. That's a real, corrected mistake from this project's own history, not a hypothetical: a first pass used a native `<select>` and `window.confirm` for the vendor products page reasoning "it's a simple page, can't visually verify a new component blind" — both got corrected to real `components/ui/select.tsx` / `components/ui/alert-dialog.tsx` once it was pointed out that the design-system convention already existed and should be followed, "can't verify visually" being true of every component built this way, not a reason specific to these two.

**Any floating popup (`Select`, `Popover`, `Tooltip`, future `Menu`/`Combobox`) nested inside a `Dialog` needs an explicit z-index on its `Positioner`, not its `Popup`.** `Positioner` is always `position: fixed`, which per the CSS spec always opens its own stacking context regardless of z-index — so a z-index on the `Popup` (a descendant of `Positioner`) only wins *inside* that context and can never out-rank a sibling `Dialog` popup, no matter how high the number. The `Dialog`'s own popup is `z-50`; every `*Content`/`TooltipContent` wrapper sets `className="z-100"` directly on its `Positioner` for this reason (see `select.tsx`, `popover.tsx`, `tooltip.tsx`). This was found by inspecting the live DOM of a nested Select that opened correctly (right position, right anchor) but was invisible and unclickable behind an opaque `Dialog` — confirming it was pure stacking order, not a Base UI portal/focus bug. Get this right on any new popup-in-dialog composition from the start; it's not something z-index on the content box alone will ever fix.

## Architecture and flow

- Next.js 15 + React 19
- Medusa JS SDK (`@medusajs/js-sdk`) with publishable key
- Tailwind-based UI from the starter

## `/vendor` — vendor panel (deleted once, then reinstated)

This app hosts a vendor-facing UI at `src/app/(vendor)/vendor/**` (login,
Shopify connection, staff-parity profile, own orders/statements) plus its
supporting code under `src/vendor/**` (`forms/`, `hooks/{queries,mutations}/`,
`lib/`, `stores/`, `components/`). It was deleted once — Sensus's answers
initially confirmed a vendor manages their own catalogue through their own
Shopify store, not through us — then reinstated once hands-on testing of the
Shopify OAuth flow showed the connection step is unavoidably vendor-driven
(only someone with access to the *installing* store's own org can complete a
custom-distribution app install, so staff can't do this step on a vendor's
behalf). See `docs/plan.md` Decisions, "A full vendor panel is back", for the
full history. The panel's job is connection management (a vendor connects
and picks what to import from their own Shopify), viewing its own
orders/statements, **and manual product creation for a vendor without a
Shopify connection** (`docs/plan.md` Decisions, "Manual product creation is
back in the vendor panel") — a Shopify-connected product's own data (title,
price, images, variants) still comes from Shopify only, never edited by hand
on either side; manual creation is only for a vendor's own, non-synced
products.
`src/vendor/lib/contract-client.ts` (a ts-rest client built from
`@dtc/api-contracts/vendor/contract`) is the current convention for every
`/vendors/*` call — `src/vendor/lib/client.ts`'s older `request()` helper
still exists only for the one endpoint not in that contract
(`/auth/vendor/emailpass`, a core Medusa auth route, not a custom
`/vendors/*` resource); don't add new `/vendors/*` calls through it.

**A form is just a form — no `useMutation` inside `src/vendor/forms/*`, ever.** Every vendor-panel form takes `CommonFormProps<TValues>` (`src/vendor/forms/form-type.ts` — `{defaultValues?, isLoading?, onSubmit}`), plus whatever extra display props it genuinely needs (e.g. `error?: string`). Submit button text is always a plain hardcoded string ("Save") — never a `submitLabel`-style prop parameterizing it per create/update/whatever stage; a form tried that once (`StockLocationForm`) and it was corrected explicitly: "remove the submitLabel from forms, just let always 'save' anyway i hate to pass labels as props." `onSubmit` just hands validated values to the caller; the mutation (or several, composed — `ShopifyConnectionForm`'s caller runs a save-then-generate-install-link sequence across two mutations) lives in whichever page or component renders the form, which owns `isPending`/`isError`/`error.message` and passes them down as plain props. This mirrors the Admin app's own `CommonFormProps<T>` convention (`apps/backend/src/admin/forms/form-type.ts`) exactly, and existed there before it existed here — the storefront's forms briefly drifted from it (`ProfileForm`, `LoginForm`, `ShopifyConnectionForm` all embedded their own `useMutation` and, in `LoginForm`'s case, even a direct side effect from inside the form), corrected explicitly: "I don't want to include mutation under the forms, I prefer to use the onSubmit outside them and I can control the mutation state on the page, a form is just a form." Copy `ShopifyConnectionForm`/its `page.tsx` caller as the reference shape for a form driving more than one mutation in sequence.

**Singleton resources render the form inline; list resources render it in a `FormDialog` behind a button.** A vendor has exactly one profile and one Shopify connection, so `ProfileForm`/`ShopifyConnectionForm` render directly on the page — no dialog, no trigger button, nothing to pick. A vendor can have many stock locations (and will have many products), so `StockLocationForm` only ever appears inside a `FormDialog` (`src/components/display/form-dialog.tsx`), opened by an explicit Create/Edit button — the page's real content is the *list*, and the form is a transient action layered on top of it, driven by one `formValues: CommonFormValuesProps<TSchema, TEntity>` state carrying `state: "CREATING" | "UPDATING" | "DELETING"` (`locations/page.tsx` is the reference shape — one shared `FormDialog` for both create and edit, one `ConfirmDeleteDialog` for delete, branching entirely on `formValues.state`). The deciding factor for any new resource: does this page show *one thing* or *a list of things*? One thing → the form **is** the page. A list of things → the list **is** the page, and the form is a dialog.

**The full naming chain from contract to form is documented end to end in
two sibling docs** (worked on the vendor login flow throughout):
`docs/vendor-contract-hook-pattern.md` covers contract → key → hook — every
schema/key/hook name is **mechanically derived from the route's HTTP method
+ path**, never hand-picked (`PostAuthVendorEmailpassInput`/
`PostAuthVendorEmailpassResponse` → `mutationKeys.auth.postAuthVendorEmailpass`
→ `usePostAuthVendorEmailpass`, plus the key-registry/hook-shape/key-
parameterization conventions every hook file follows), and
`docs/vendor-hook-form-pattern.md` continues from the hook into the form
(`LoginForm`'s own, independently human-named `loginVendorSchema` + parsers
— the form layer is deliberately *not* mechanically named). Copy that recipe
for every new vendor contract + hook + form triplet.

**Hook naming is fixed, not a style preference:** every `src/vendor/hooks/{queries,mutations}/*` hook wrapping a `vendorClient` call is named `use<MethodName>`, exactly matching the ts-rest contract method it calls (`vendorClient.getVendorsMe()` → `useGetVendorsMe`, `vendorClient.getVendorsMeShopifyProducts()` → `useGetVendorsMeShopifyProducts`) — and that contract method name is itself mechanically derived from the route (see `docs/vendor-contract-hook-pattern.md`), never a rephrased verb like `useFindOneVendor`/`useFindManyVendorOrders`. The query/mutation key string and the call-site local variable (already-established convention: the hook's result is assigned to one const named after the hook itself minus `use`) follow the same name, so the route, the contract method, the hook, its cache key, and its call-site variable are the same word end to end — a hook whose name doesn't match what it calls forces a reader into its body just to learn what it does.

**Classify by what the backend route actually does, not by how the UI triggers it.** `useQuery` (via `createResourceQueryHook`) is for anything idempotent that only reads — including something a user triggers with a button click, like `useGetVendorsMeShopifyProducts` (a `GET` that only reads from Shopify and writes nothing to Medusa's own DB; TanStack's `refetch()` covers the "pull again on demand" button for free). `useMutation` is reserved for routes that actually write/change persisted state (`usePatchVendorsMeShopifyConnection`, `usePatchVendorsMe`). Don't reach for `useEffect(() => mutate(), [])` to fire something on mount — that's the anti-pattern `useQuery` exists to replace; if you want "fetch automatically when this page loads," that's a sign the operation was misclassified as a mutation in the first place, not a case for an effect. (`useGetVendorsMeShopifyConnectionInstallLink` is a `GET` currently implemented as a mutation — a known, pre-existing misclassification, not a new one introduced by this naming pass; worth fixing separately.)

`src/components/display/` holds this app's fully generic, domain-agnostic pieces — `DataState` (a `Root`/`Loading`/`Fetching`/`Empty`/`Content` compound component for query loading/empty/content states) and `InfoList` (`Root`/`Row`/`Label`/`Text`/`Link` for label-value display rows) — versus `src/vendor/components/` for pieces that are vendor-panel-specific (`VendorNav`, `VendorSection`, a thin wrapper standardizing `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardAction`/`CardContent` into one `{title, description?, action?, children}` API). Generic and domain-specific UI code never share a folder on this repo — check `components/display/` for an existing generic piece before building a new domain-specific one that duplicates it.

## Patterns to follow when extending

1. Always send `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (SDK config). Missing key causes opaque store API failures.
2. Prefer URL-driven listing/filter state for shareable facet UX.
3. Keep brand tokens out of core cart/checkout logic when you introduce a config layer.
4. **Mandatory:** never import backend models or `InferTypeOf` of models. Use JS SDK / `HttpTypes` for core commerce; for `/vendors/*` resources use `@dtc/api-contracts` (`packages/api-contracts/README.md`) via `src/vendor/lib/contract-client.ts` — never hand-copy a response type into a hook file again.

## Environment variables

`apps/storefront/.env.local` (gitignored), from `.env.template`:

- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (local default `http://localhost:9000`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (`pk_...`)
- `NEXT_PUBLIC_DEFAULT_REGION` (seed default often `gb`)

## Scripts / commands

From `apps/storefront`:

- `pnpm run dev` → Next on port 8000
- `pnpm run build` / `pnpm run start`
- `pnpm run lint` → `next lint` today

## Gotchas and notes

- Confirm `apps/storefront/` exists before storefront-only tasks.
- Do not commit `.env.local`.
- Backend and storefront are separate processes; backend-only `dev` does not start port 8000.
- The vendor panel's `QueryClient` sets `defaultOptions.queries.staleTime` to 5 minutes deliberately — TanStack Query's own default is `staleTime: 0`, which makes every navigation between `/vendor/*` pages silently refetch (and, once a query's `gcTime` elapses with zero observers, show a real loading flash again) even though the layout-held `QueryClient` instance itself never remounts. Every mutation here already calls `.refetch()`/invalidates explicitly when data actually changes, so there's no correctness reason for the eager default. Don't "fix" this back to `0` without checking this note first.
- **The vendor panel's `QueryClient` is a module-level singleton (`src/vendor/lib/query-client.ts`), not created inside the provider via `useState`** — `src/app/(vendor)/vendor/_components/query-client-provider.tsx` just passes it to `<QueryClientProvider>`. This is deliberate: logging a vendor out has to clear the query cache, and that needs to happen from `src/vendor/stores/auth-store.ts`'s `clearToken()`, which is plain (non-React) code with no access to a `useState`-scoped instance. A `useState`-created `QueryClient` would need a bespoke way to reach outside the component tree; the singleton needs none.
- **`clearToken()` is the one and only logout path, and it always does both things — clears the token and calls `vendorQueryClient.clear()`.** There is no separate "just clear the token" vs "log out fully" function; every caller (the nav's "Log out" button, and the automatic one below) gets full logout by construction, so a future caller can't accidentally do a partial one. Never add a second way to drop the token that skips the cache clear.
- **A `401` from either `src/vendor/lib/client.ts`'s `request()` or `src/vendor/lib/contract-client.ts`'s `vendorClient` triggers the same logout automatically**, via one shared `assertOkResponse(res, data, path)` in `client.ts` that both fetch wrappers call before throwing `VendorApiError` — this is the one place a non-ok response is inspected, so no individual hook needs its own 401 handling (don't add any). `VendorAuthGate` already re-renders to the login form reactively off `token` becoming `null`, so `clearToken()` alone is sufficient — no manual redirect needed from the assertion itself.
