import type { RemoteQueryFunction } from "@medusajs/framework/types"
import type { VendorProductDetail } from "@dtc/api-contracts/vendor/products"

type VariantWithPricesAndOptions = {
  id: string
  title: string
  sku: string | null
  weight: number | null
  prices?: { amount: number; currency_code: string }[]
  options?: { value: string; option?: { title: string } | null }[]
}

export async function buildVendorProductDetail(
  query: Omit<RemoteQueryFunction, symbol>,
  productId: string,
): Promise<VendorProductDetail | null> {
  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: [
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
      "variants.weight",
      "variants.options.value",
      "variants.options.option.title",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: { id: productId },
  })

  if (!product) return null

  return {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    handle: product.handle,
    status: product.status,
    thumbnail: product.thumbnail,
    external_id: product.external_id,
    images: (product.images ?? []).map((image) => image.url),
    options: (product.options ?? []).map((option) => ({
      title: option.title,
      values: (option.values ?? []).map((value) => value.value),
    })),
    variants: (
      (product.variants ?? []) as unknown as VariantWithPricesAndOptions[]
    ).map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      weight: variant.weight,
      price: variant.prices?.[0]?.amount ?? null,
      optionValues: Object.fromEntries(
        (variant.options ?? []).map((optionValue) => [
          optionValue.option?.title ?? "",
          optionValue.value,
        ]),
      ),
    })),
  }
}
