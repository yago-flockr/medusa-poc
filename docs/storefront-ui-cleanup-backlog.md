# Storefront UI cleanup backlog

## 1. Stop re-styling `components/ui` primitives

Rule: use the primitives with their own styles and variants (`variant`, `size`).
No `className` that changes how they look at the call site. If a look is
missing, add a variant to the primitive.

### Done (2026-09-28)

- Style overrides removed: `Button` (`h-10` → `size="lg"`, link/icon hacks),
  `Input`, `NativeSelect`, `Card`, `CardTitle` (→ `CardDescription`), `Badge`
  in `Steps` (→ state variants), `BreadcrumbList`, `Table*` padding, `Spinner`,
  `SelectItem` `capitalize` (→ real labels).
- Margins on primitives replaced with `gap` on the parent: checkout sections,
  order details, cart totals, checkout summary, account orders/info,
  categories, shared `Pagination`.

### Allowed

- Layout-only classes: `w-full`, `w-fit`, `flex-1`, `mt-auto`, responsive
  `hidden sm:table-cell` / `md:hidden`, `CarouselItem` `basis-*`, positioning
  like the carousel arrows' `static translate-y-0`.
- shadcn's documented call-site classes: `text-right` / widths on table cells,
  `p-0` on the split login `Card` (shadcn login block pattern).
- `Skeleton` sizes: shadcn sizes `Skeleton` through `className` by design.

Account success/error messages use `Alert` (a `success` variant was added).

## 2. Prop drilling

### Done (2026-09-28)

- Checkout `customer`: `CheckoutForm` fetches it instead of the page relaying it.
- Account addresses `region`/`customer`: `AddressBook` fetches both itself.
- Dead `region` prop removed from `ProductActions`.

### Left as is

Single-hop values: `currencyCode` into cart list items, `country` route param
into listing templates. Server → client handoffs (`Addresses` →
`ShippingAddress`, `AddAddress` → `CountrySelect`) are the normal boundary.
