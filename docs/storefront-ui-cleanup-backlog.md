# Storefront UI cleanup backlog

Two cleanups to do soon, one step at a time, checking the page after each.

## 1. Stop re-styling `components/ui` primitives

Rule: use the primitives with their own styles and variants (`variant`, `size`).
No `className` that changes how they look at the call site. If a look is
missing, add a variant to the primitive.

Scan (2026-09-28): 191 `className`s on `components/ui` components, 73 files.

### Style overrides: remove

| Component                                 | Override                                                  | Where                                                                                                                                                          |
| ----------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                  | `h-10`                                                    | `account/.../add-address.tsx`, `edit-address-modal.tsx`, `cart/components/sign-in-prompt`, `cart/templates/summary.tsx`, `products/components/product-actions` |
| `Button`                                  | `h-auto p-0`                                              | `layout/components/cart-mismatch-banner`                                                                                                                       |
| `Button`                                  | `w-fit px-0`                                              | `about/components/manifesto-quote`                                                                                                                             |
| `Button`                                  | `rounded-full bg-neutral-900 … text-[15px] p-2`           | `shipping/components/free-shipping-price-nudge`                                                                                                                |
| `Button`                                  | `w-[100px]`, `h-fit`                                      | `account/components/account-info`, `transfer-request-form`                                                                                                     |
| `Input`                                   | `h-9 flex-1`                                              | `checkout/components/discount-code`                                                                                                                            |
| `Card`                                    | `gap-0 overflow-hidden p-0`                               | `vendor-auth-gate.tsx`, `affiliate-auth-gate.tsx`                                                                                                              |
| `Card`                                    | `bg-muted p-4`                                            | `account/components/overview`                                                                                                                                  |
| `CardTitle`                               | `text-sm text-muted-foreground`                           | `components/display/stat-card.tsx`                                                                                                                             |
| `Badge`                                   | `size-6 rounded-full p-0`                                 | `components/display/steps.tsx`                                                                                                                                 |
| `BreadcrumbList`                          | `text-xs uppercase tracking-widest text-muted-foreground` | `products/templates`                                                                                                                                           |
| `TableCell` / `TableHead` / `TableHeader` | `!pl-0`, `!pr-0`, `p-4`, `border-t-0`                     | cart `item`, `templates/items.tsx`, order `item`, skeleton cart/line item/page                                                                                 |
| `Spinner`                                 | `size-9`                                                  | `account/loading.tsx`, `account/@dashboard/loading.tsx`                                                                                                        |
| `SelectItem`                              | `capitalize`                                              | `forms/fields/select-field.tsx`                                                                                                                                |
| `Label`                                   | `my-2 flex items-center gap-x-1`                          | `checkout/components/discount-code`                                                                                                                            |

Done: cart quantity `NativeSelect` (`h-10 w-14 p-4`), common `Input` (`h-11 rounded-md`).

### Margins on primitives: replace with `gap` on the parent

`Separator` `mt-8` / `my-4` / `my-6` / `mb-8` / `!mb-0`, `Badge` `my-4`,
`Button` `mt-6`, `Breadcrumb` `mb-4`, `PaginationRoot` `mt-12`: checkout
(addresses, payment, shipping, summary), order details, cart totals, account
orders/info, categories, pagination.

### Layout-only: decide case by case

`w-full`, `w-fit`, `hidden md:flex`-style responsive toggles, `CarouselItem`
`basis-*` (shadcn's documented API), carousel arrows `static translate-y-0`,
`Card`/`CardContent` `h-full` in featured carousels and product preview.

### Leave as is

- `Skeleton` sizes (66): shadcn sizes `Skeleton` through `className` by design.
- Wrappers that only forward a caller's `className`.

## 2. Remove prop drilling

Not scanned yet. Find props passed through components that don't use them,
and have the component that needs the data fetch it (Next dedupes identical
fetches in an RSC render pass), or read it from the context it already has.
Start with the store `templates/` → `components/` chains (cart, checkout,
product), which pass `cart`/`region`/`customer` down several levels.
