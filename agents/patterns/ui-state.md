# React UI & State Management

Well-known industry patterns (not invented for this repo) — apply them on
every change without being asked. Applies to both `apps/storefront` and
`src/admin` (backend's Admin dashboard extensions) — the framework-specific
conventions for each already live in `agents/storefront.md` and
`agents/backend.md`; this file is the general React layer underneath both.

## Component size and prop boundaries

- If a component is hard to read top-to-bottom in one pass, extract a custom
  hook (for logic/side effects) or a sub-component (for a repeated visual
  chunk) — not a fixed line count, but "I can't tell what this renders
  without scrolling past unrelated logic" is the signal.
- Avoid prop drilling more than one or two levels. If a prop is only being
  passed through to reach a distant descendant, that's a signal to use
  `children`/composition or context — not to keep threading it deeper.
- A component wrapping a JSX spread of rest props always places `{...props}`
  last among that element's attributes, never first — so a caller-supplied
  prop can never silently clobber one the component sets itself
  (`onSubmit`, `className`). If a specific prop must never be overridable at
  all, exclude that key from the prop type via `Omit<...>` — don't rely on
  spread order alone to protect it.

## Composition over flags

- Prefer `children` / slot components over a boolean prop that switches
  layout or behavior (`showHeader`, `isCompact`). A flag prop means the
  component secretly renders two different things depending on a hidden
  input; composition makes both shapes explicit at the call site.
- The same principle extends to **content that needs consistent styling
  across many call sites** inside a slot-based component: prefer small named
  subcomponents (`InfoList.Label`, `InfoList.Text`, `InfoList.Link`) over
  either a single component with a style-only `variant` prop, or fully
  freeform children. Freeform children push the risk of visual drift onto
  every call site (someone eventually forgets the muted-text class on a
  label); a `variant` prop is unnecessary indirection when the repo already
  composes this way elsewhere (`Card`'s own `CardTitle`/`CardDescription`/
  `CardAction` are separate named parts, not one part with a variant enum).
  Only add a new named subcomponent once a real field needs its behavior —
  see YAGNI in `agents/patterns/dry-kiss-yagni.md` for the `InfoList.Link`
  vs. speculative `InfoList.Copy` example.
- Keep visual components presentation-only. Side effects and Medusa SDK/JS
  SDK calls belong in a hook, not inline in a component body — this repo's
  own convention: Admin query/mutation hooks live in
  `admin/hooks/queries/` / `admin/hooks/mutations/`
  (`agents/backend.md`), and the storefront's SDK calls follow the same
  split (`agents/storefront.md`).

## Example (this repo's shape)

```tsx
// BAD — a boolean flag silently switches what the component renders,
// and the SDK call is inline in the component
function VendorProductCard({ product, compact }: Props) {
  const [vendor, setVendor] = useState<Vendor>()
  useEffect(() => {
    sdk.admin.vendor.retrieve(product.vendor_id).then((r) => setVendor(r.vendor))
  }, [product.vendor_id])

  return compact ? <CompactLayout /> : <FullLayout />
}

// GOOD — composition makes the two shapes explicit call sites,
// data fetching lives in a hook
function VendorProductCard({ product, children }: Props) {
  const { data: vendor } = useVendor(product.vendor_id)
  return <ProductCardLayout vendor={vendor}>{children}</ProductCardLayout>
}
```
