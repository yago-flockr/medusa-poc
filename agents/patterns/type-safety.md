# Type Safety & Error Handling

Well-known industry patterns (not invented for this repo) — apply them on
every change without being asked.

## Strict typing

- No explicit `any`. Use `unknown` with a Zod schema or a type guard to
  narrow it instead. This repo already validates request bodies with Zod
  (`api/admin/<resource>/contract.ts`, `validators.ts`) — reuse that schema
  to narrow, don't re-type by hand.
- **Never hand-declare a type that duplicates or narrows one already
  derivable from a canonical source.** Two shapes this repo's UI code keeps
  needing: a component's own prop type (`ComponentProps<typeof Input>`,
  `ComponentProps<typeof CardContent>`) when wrapping a single underlying
  element or primitive — extend that instead of hand-picking which native
  attributes to expose (`apps/storefront/src/vendor/forms/fields/text-field.tsx`'s
  `TextFieldProps` is the reference shape); and a form's `defaultValues`/input
  prop type when the same shape is already the Zod schema's `z.infer` used by
  that form's own `zodResolver` — use `Partial<InferredType>`/`Pick<...>`,
  not a separately hand-typed object literal. Either hand-rolled version can
  silently drift from the real one the moment the wrapped component or
  schema changes.
- **Package strictness differs on purpose, don't "fix" it into uniformity:**
  `apps/backend/tsconfig.json` only enables `strictNullChecks` (Medusa's
  decorator-metadata shape hasn't been verified against full `strict`);
  `apps/storefront/tsconfig.json` enables full `strict`. See
  `agents/overview.md`'s "TypeScript strictness is deliberate per package"
  principle before assuming one config is a bug.
- Explicit return types on exported functions, workflow steps, and API route
  handlers — not on small internal helpers where inference is already
  unambiguous.
- Prefer `readonly` on data that shouldn't mutate after creation (DTOs,
  workflow step inputs). Don't force it onto framework-owned class fields
  where a decorator (`@Field()`) already governs the shape — that's the
  backend's `strictPropertyInitializer: false` exception in
  `agents/overview.md`, not something to fight.

## State and error modeling

- Model a value's possible states as a discriminated union instead of
  independent optional flags that can combine into an impossible state (e.g.
  `{ loading: true, error: "x", data: {...} }` all at once shouldn't be
  representable).
- Throw structured, typed exceptions with a clear reason — not a bare
  `Error("something went wrong")`. This repo's own convention:
  `assert*Enabled` / `assertReferencesExist`-style functions that throw a
  specific error before a mutation runs, rather than letting a raw DB
  constraint violation surface as an opaque 500 — see
  `agents/backend.md`'s "Reference integrity is asserted before mutation."

## Example (this repo's shape)

```ts
// BAD — independent optional flags can combine into a state that
// shouldn't exist (loading + data + error all set at once)
type SyncState = {
  loading: boolean
  data?: Product[]
  error?: string
}

// GOOD — discriminated union makes the impossible state unrepresentable
type SyncState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Product[] }
  | { status: "error"; error: Error }
```
