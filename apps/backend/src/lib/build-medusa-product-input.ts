import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import type { ExternalProduct } from "./external-product"

export type ResolvedProductOption = NonNullable<
  CreateProductWorkflowInputDTO["options"]
>[number]

export type ProductPrerequisites = {
  shippingProfileId: string
  salesChannelId: string | null
  currencyCode: string
}

export type MappedProductOption = { title: string; values: string[] }

type MappedProductVariant = {
  title: string
  sku: string | null
  manage_inventory: boolean
  options: Record<string, string>
  prices: { amount: number; currency_code: string }[]
}

type ProductInputBase = {
  title: string
  description: string
  status: ProductStatus
  images: { url: string }[]
  variants: MappedProductVariant[]
}

export type CreateProductInputFromExternal = ProductInputBase & {
  external_id: string
  handle: string
  metadata: { external_source: string }
  shipping_profile_id: string
  sales_channels: { id: string }[]
  options: ResolvedProductOption[]
}

export type UpdateProductInputFromExternal = ProductInputBase & {
  id: string
}

export function toMedusaOptions(product: ExternalProduct): MappedProductOption[] {
  if (!product.options.length) {
    return [{ title: "Default", values: ["Default"] }]
  }

  return product.options.map((option) => ({
    title: option.name,
    values: option.values,
  }))
}

function toMedusaVariantOptions(
  variant: ExternalProduct["variants"][number],
): Record<string, string> {
  if (!variant.options.length) {
    return { Default: "Default" }
  }

  return Object.fromEntries(variant.options.map((o) => [o.name, o.value]))
}

function toMedusaVariants(
  product: ExternalProduct,
  currencyCode: string,
): MappedProductVariant[] {
  if (!product.variants.length) {
    return [
      {
        title: "Default",
        sku: null,
        manage_inventory: false,
        options: { Default: "Default" },
        prices: [{ amount: 0, currency_code: currencyCode }],
      },
    ]
  }

  return product.variants.map((variant) => ({
    title: variant.title,
    sku: variant.sku,
    manage_inventory: variant.inventory_quantity !== null,
    options: toMedusaVariantOptions(variant),
    prices: [{ amount: Number(variant.price), currency_code: currencyCode }],
  }))
}

export function buildCreateProductInputFromExternal(
  product: ExternalProduct,
  prerequisites: ProductPrerequisites,
  resolvedOptions: ResolvedProductOption[],
): CreateProductInputFromExternal {
  return {
    external_id: product.external_id,
    metadata: { external_source: product.external_source },
    title: product.title,
    description: product.description,
    handle: product.handle,
    status: ProductStatus.PROPOSED,
    shipping_profile_id: prerequisites.shippingProfileId,
    sales_channels: prerequisites.salesChannelId
      ? [{ id: prerequisites.salesChannelId }]
      : [],
    images: product.image_urls.map((url) => ({ url })),
    options: resolvedOptions,
    variants: toMedusaVariants(product, prerequisites.currencyCode),
  }
}

/**
 * Deliberately omits `handle`, `shipping_profile_id` and `sales_channels` —
 * those were already resolved at creation time and re-touching them on every
 * re-sync risks breaking an existing customer-facing URL or an association
 * staff/the system already set up, for no benefit (an external system never
 * changes what those map to). Variants are always fully replaced to match
 * the external system's current set exactly: no per-variant external
 * identity is tracked yet (real store data even has null SKUs), so there's
 * no safe way to preserve existing Medusa variant ids across a re-sync — see
 * docs/spikes/vendor-shopify-sync.md.
 *
 * Also omits `options` and `metadata`, unlike the create input — see
 * agents/backend.md. `metadata.external_source` is set once at create and
 * left untouched here: Medusa merges (not replaces) metadata on update, so
 * omitting it preserves whatever was set at creation.
 */
export function buildUpdateProductInputFromExternal(
  medusaProductId: string,
  product: ExternalProduct,
  prerequisites: ProductPrerequisites,
): UpdateProductInputFromExternal {
  return {
    id: medusaProductId,
    title: product.title,
    description: product.description,
    status: ProductStatus.PROPOSED,
    images: product.image_urls.map((url) => ({ url })),
    variants: toMedusaVariants(product, prerequisites.currencyCode),
  }
}
