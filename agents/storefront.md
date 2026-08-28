# Storefront (`apps/storefront`)

> Context for AI agents in the Next.js customer storefront. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file and the package README if setup/run changes.

## Overview

Next.js App Router storefront from the Medusa DTC starter. Talks to the Medusa Store API. Port default: **8000**.

This is the **customer** surface only. Brand/theme config is a later concern.

**Next.js and server rendering are fixed** (`docs/plan.md`, Fixed): discovery matters too much to ship a client-rendered store. Default to server rendering and treat a client component as a decision to justify. **The UI component library is decided: shadcn-style components in `src/components/ui/*`, each a thin wrapper around a `@base-ui/react/*` primitive** (not Radix — this app uses Base UI), following the exact pattern already set by `button.tsx`/`checkbox.tsx`/`badge.tsx`/`separator.tsx`: import the primitive's namespace, apply variants via `cva` where relevant, merge classes with `cn()`, tag the root with a `data-slot`. When a page needs a primitive this app doesn't have yet (a `Select`, an `AlertDialog`, etc.), check whether `@base-ui/react` ships it (it usually does — mirrors Radix's component set) and build the wrapper properly, matching this exact convention — don't fall back to a native HTML element (`<select>`, `window.confirm`) to avoid the work. That's a real, corrected mistake from this project's own history, not a hypothetical: a first pass used a native `<select>` and `window.confirm` for the vendor products page reasoning "it's a simple page, can't visually verify a new component blind" — both got corrected to real `components/ui/select.tsx` / `components/ui/alert-dialog.tsx` once it was pointed out that the design-system convention already existed and should be followed, "can't verify visually" being true of every component built this way, not a reason specific to these two.

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
full history. **This is not a return to manual catalogue entry**: the
panel's job is connection management (a vendor connects and picks what to
import from their own Shopify) and viewing its own orders/statements — a
Shopify-connected product's own data (title, price, images, variants) still
comes from Shopify only, never edited by hand on either side.
`src/vendor/lib/contract-client.ts` (a ts-rest client built from
`@dtc/api-contracts/vendor/contract`) is the current convention for every
`/vendors/*` call — `src/vendor/lib/client.ts`'s older `request()` helper
still exists only for the one endpoint not in that contract
(`/auth/vendor/emailpass`, a core Medusa auth route, not a custom
`/vendors/*` resource); don't add new `/vendors/*` calls through it.

**Hook naming is fixed, not a style preference:** every `src/vendor/hooks/{queries,mutations}/*` hook wrapping a `vendorClient` call is named `use<MethodName>`, exactly matching the ts-rest contract method it calls (`vendorClient.getMe()` → `useGetMe`, `vendorClient.pullShopifyProducts()` → `usePullShopifyProducts`) — never a rephrased verb like `useFindOneVendor`/`useFindManyVendorOrders`. The query/mutation key string and the call-site local variable (already-established convention: the hook's result is assigned to one const named after the hook itself minus `use`) follow the same name, so the contract method, the hook, its cache key, and its call-site variable are the same word end to end — a hook whose name doesn't match what it calls forces a reader into its body just to learn what it does.

**Classify by what the backend route actually does, not by how the UI triggers it.** `useQuery` (via `createResourceQueryHook`) is for anything idempotent that only reads — including something a user triggers with a button click, like `usePullShopifyProducts` (a `GET` that only reads from Shopify and writes nothing to Medusa's own DB; TanStack's `refetch()` covers the "pull again on demand" button for free). `useMutation` is reserved for routes that actually write/change persisted state (`useSetShopifyConnection`, `useUpdateProfile`). Don't reach for `useEffect(() => mutate(), [])` to fire something on mount — that's the anti-pattern `useQuery` exists to replace; if you want "fetch automatically when this page loads," that's a sign the operation was misclassified as a mutation in the first place, not a case for an effect.

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
- The vendor panel's `QueryClient` (`src/app/(vendor)/vendor/_components/query-client-provider.tsx`) sets `defaultOptions.queries.staleTime` to 5 minutes deliberately — TanStack Query's own default is `staleTime: 0`, which makes every navigation between `/vendor/*` pages silently refetch (and, once a query's `gcTime` elapses with zero observers, show a real loading flash again) even though the layout-held `QueryClient` instance itself never remounts. Every mutation here already calls `.refetch()`/invalidates explicitly when data actually changes, so there's no correctness reason for the eager default. Don't "fix" this back to `0` without checking this note first.
