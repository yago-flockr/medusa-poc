# Hook → form naming chain

How a vendor-panel hook (already built per `docs/vendor-contract-hook-pattern.md`,
named mechanically after its route) pairs with the form that drives it, and
how the form's own schema, parsers, and props stay consistent with the
hook's contract types without the form ever touching the hook directly.
Reference example throughout: **vendor login** —
`usePostAuthVendorEmailpass` (`apps/storefront/src/vendor/hooks/mutations/auth.ts`)
paired with `LoginForm` (`apps/storefront/src/vendor/forms/login-form.tsx`).

For the contract → key → hook half of the chain that comes before this one,
see the sibling doc `docs/vendor-contract-hook-pattern.md`.

## The chain, at a glance

| # | Layer | File (login example) | Exports |
|---|-------|------------------------|---------|
| 1 | Hook (built already) | `apps/storefront/src/vendor/hooks/mutations/auth.ts` | `usePostAuthVendorEmailpass` |
| 2 | Form's own schema | `apps/storefront/src/vendor/forms/login-form.tsx` | `loginVendorSchema`, `LoginVendorSchema` |
| 3 | Form ⇄ contract parsers | same file | `loginVendorFormToInput`, `loginVendorInputToForm` |
| 4 | Form component + props | same file | `LoginForm`, `LoginFormProps` |

**The form's own name does *not* match the hook's mechanical name, on
purpose.** `usePostAuthVendorEmailpass` is named after the wire route; `LoginForm`/
`loginVendorSchema` are named after what a human calls this thing in the UI.
The hook layer is mechanically derived (`docs/vendor-contract-hook-pattern.md`);
the form layer is a separate, human-facing naming decision that stays
readable regardless of what the route looks like — a form is UI, not a wire
contract, so it never inherits the route-shaped name.

## The hard rules

Non-negotiable for every new vendor hook + form pair, not just login:

1. **Every hook has a destined form.** `usePostAuthVendorEmailpass` pairs
   with `LoginForm` — a hook without a form (or vice versa) is a sign the
   two were built out of step.
2. **Every form has its own human-readable schema + type, independent of
   both the contract's name and the hook's mechanical name.**
   `loginVendorSchema` / `LoginVendorSchema` validates what the *form* needs
   (client-side UX rules), and is allowed to diverge in shape from
   `PostAuthVendorEmailpassInput` — it just happens to match here because
   login has no form-only fields (a confirm-password field, a checkbox,
   derived/display values) to strip before submit. Pick the form's name from
   what the form *is* (a login form, a create-product form), never from the
   route it happens to submit to.
3. **Every form has parsers translating its schema to/from the contract's
   input schema**: `loginVendorFormToInput` (form → contract, used before
   calling the mutation) and `loginVendorInputToForm` (contract → form, used
   to prefill an edit form from fetched data). Write both even when the
   shapes are identical today — the moment either schema gains a
   form-only or contract-only field, the parser is where that translation
   belongs, not a call site.
4. **The form's prop type extends `CommonFormProps` with the form's own
   schema type.** `type LoginFormProps = CommonFormProps<LoginVendorSchema>`
   (`apps/storefront/src/vendor/forms/form-type.ts`).
5. **A form is just a form.** It renders fields, validates via
   `zodResolver(formSchema)`, and calls `onSubmit?.(values)` with the
   *form's own* validated shape — nothing else. It never imports a hook,
   never calls `useMutation`/`useQuery`, and never inspects a mutation's
   `isPending`/`error`. All of that lives in whatever page or component
   renders the form (see `agents/storefront.md`, "A form is just a form —
   no `useMutation` inside `src/vendor/forms/*`, ever").

## Who calls the parser, and who owns the mutation

The caller — not the form, not the hook — is where everything meets:
`apps/storefront/src/app/(vendor)/vendor/_components/vendor-auth-gate.tsx`
for login. It:

- calls `usePostAuthVendorEmailpass()` and holds the mutation object
  (`const postAuthVendorEmailpass = usePostAuthVendorEmailpass()`, per the
  "hook result const matches hook name" convention)
- renders `<LoginForm isLoading={postAuthVendorEmailpass.isPending} onSubmit={...} />`
- inside `onSubmit`, is the place that would call `loginVendorFormToInput(values)`
  before `postAuthVendorEmailpass.mutate(...)` if the two schemas ever diverge
- reads `postAuthVendorEmailpass.error`/`.isPending` to drive its own UI
  (an `Alert`, a disabled button state) — the form itself never sees these

**Current nuance worth knowing, not a bug to silently "fix":**
`vendor-auth-gate.tsx` currently passes the raw form `data` straight into
`postAuthVendorEmailpass.mutate(data, ...)`, skipping `loginVendorFormToInput`
even though that parser exists. This only works because `LoginVendorSchema`
and `PostAuthVendorEmailpassInput` are structurally identical today. If
either schema picks up a field the other doesn't have, this call site would
need to start calling `loginVendorFormToInput(data)` explicitly, or it will
fail to type-check (or worse, silently send the wrong shape if the field is
optional). Something to fix if this file is touched again for another
reason — not urgent on its own.

## Recipe: adding a new form for an existing hook

Given a hook `usePutVendorsBar` already built per
`docs/vendor-contract-hook-pattern.md`, for a form a human would call "the
bar form":

1. **Form** — `apps/storefront/src/vendor/forms/bar-form.tsx`: its own
   `barSchema`/`BarSchema` (named for what the form is, not the route),
   `barFormToInput`/`barInputToForm` (converting to/from `PutVendorsBarInput`),
   `BarFormProps = CommonFormProps<BarSchema>`, and a `BarForm` component
   that only renders fields and calls `onSubmit?.(values)`.
2. **Caller** (a page or `_components/*` file) — owns `usePutVendorsBar()`,
   renders `<BarForm isLoading={...} onSubmit={(values) => putVendorsBar.mutate(barFormToInput(values), ...)} />`,
   and owns error/loading display.

Same shape every time — a new form is a copy of this recipe, not a fresh
design decision.
