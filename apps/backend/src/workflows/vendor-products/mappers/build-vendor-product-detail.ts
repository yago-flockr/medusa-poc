import type { VendorProductDetail } from "@dtc/api-contracts/vendor/products"

// Every field buildVendorProductDetail reads — kept next to it so the two
// can never drift apart. Both get-vendor-product steps query.graph with this.
export const PRODUCT_DETAIL_FIELDS = [
  "id",
  "title",
  "subtitle",
  "description",
  "handle",
  "status",
  "thumbnail",
  "external_id",
  "images.url",
  "options.title",
  "options.values.value",
  "variants.id",
  "variants.title",
  "variants.sku",
  "variants.options.value",
  "variants.options.option.title",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "categories.id",
  "categories.name",
  "categories.handle",
]

type RawVendorProductVariant = {
  id: string
  title: string
  sku: string | null
  prices?: { amount: number; currency_code: string }[] | null
  options?:
    | ({ value: string; option?: { title: string } | null } | null)[]
    | null
}

type RawVendorProductDetail = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string | null
  status: VendorProductDetail["status"]
  thumbnail: string | null
  external_id: string | null
  images?: ({ url: string } | null)[] | null
  options?:
    | ({ title: string; values?: ({ value: string } | null)[] | null } | null)[]
    | null
  variants?: (RawVendorProductVariant | null)[] | null
  categories?: ({ id: string; name: string; handle: string } | null)[] | null
}

export function buildVendorProductDetail(
  product: RawVendorProductDetail,
): VendorProductDetail {
  return {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    handle: product.handle,
    status: product.status,
    thumbnail: product.thumbnail,
    external_id: product.external_id,
    images: (product.images ?? [])
      .filter((image): image is { url: string } => image != null)
      .map((image) => image.url),
    options: (product.options ?? [])
      .filter((option): option is NonNullable<typeof option> => option != null)
      .map((option) => ({
        title: option.title,
        values: (option.values ?? [])
          .filter((value): value is NonNullable<typeof value> => value != null)
          .map((value) => value.value),
      })),
    variants: (product.variants ?? [])
      .filter((variant): variant is RawVendorProductVariant => variant != null)
      .map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        price: variant.prices?.[0]?.amount ?? null,
        optionValues: Object.fromEntries(
          (variant.options ?? [])
            .filter(
              (optionValue): optionValue is NonNullable<typeof optionValue> =>
                optionValue != null,
            )
            .map((optionValue) => [
              optionValue.option?.title ?? "",
              optionValue.value,
            ]),
        ),
      })),
    categories: (product.categories ?? []).filter(
      (category): category is NonNullable<typeof category> => category != null,
    ),
  }
}
