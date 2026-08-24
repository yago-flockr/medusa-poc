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

## Composition over flags

- Prefer `children` / slot components over a boolean prop that switches
  layout or behavior (`showHeader`, `isCompact`). A flag prop means the
  component secretly renders two different things depending on a hidden
  input; composition makes both shapes explicit at the call site.
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
