import { ProductStatus } from "@medusajs/framework/utils"
import type { ShopifyProduct } from "../products"

export type ShopifyProductPrerequisites = {
  shippingProfileId: string
  salesChannelId: string | null
  currencyCode: string
}

type ShopifyMappedOption = { title: string; values: string[] }

type ShopifyMappedVariant = {
  title: string
  sku: string | null
  manage_inventory: boolean
  options: Record<string, string>
  prices: { amount: number; currency_code: string }[]
}

type ShopifyProductInputBase = {
  title: string
  description: string
  status: ProductStatus
  images: { url: string }[]
  options: ShopifyMappedOption[]
  variants: ShopifyMappedVariant[]
}

export type CreateShopifyProductInput = ShopifyProductInputBase & {
  external_id: string
  handle: string
  shipping_profile_id: string
  sales_channels: { id: string }[]
}

export type UpdateShopifyProductInput = Omit<ShopifyProductInputBase, "options"> & {
  id: string
}

function toMedusaOptions(product: ShopifyProduct): ShopifyMappedOption[] {
  if (!product.options.length) {
    return [{ title: "Default", values: ["Default"] }]
  }

  return product.options.map((option) => ({
    title: option.name,
    values: option.values,
  }))
}

function toMedusaVariantOptions(
  variant: ShopifyProduct["variants"][number],
): Record<string, string> {
  if (!variant.options.length) {
    return { Default: "Default" }
  }

  return Object.fromEntries(variant.options.map((o) => [o.name, o.value]))
}

function toMedusaVariants(
  product: ShopifyProduct,
  currencyCode: string,
): ShopifyMappedVariant[] {
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
    manage_inventory: variant.inventoryQuantity !== null,
    options: toMedusaVariantOptions(variant),
    prices: [{ amount: Number(variant.price), currency_code: currencyCode }],
  }))
}

function buildOptionsAndVariants(
  product: ShopifyProduct,
  currencyCode: string,
): { options: ShopifyMappedOption[]; variants: ShopifyMappedVariant[] } {
  return {
    options: toMedusaOptions(product),
    variants: toMedusaVariants(product, currencyCode),
  }
}

export function buildCreateShopifyProductInput(
  product: ShopifyProduct,
  prerequisites: ShopifyProductPrerequisites,
): CreateShopifyProductInput {
  return {
    external_id: product.shopify_id,
    title: product.title,
    description: product.description,
    handle: product.handle,
    status: ProductStatus.PROPOSED,
    shipping_profile_id: prerequisites.shippingProfileId,
    sales_channels: prerequisites.salesChannelId
      ? [{ id: prerequisites.salesChannelId }]
      : [],
    images: product.image_urls.map((url) => ({ url })),
    ...buildOptionsAndVariants(product, prerequisites.currencyCode),
  }
}

/**
 * Deliberately omits `handle`, `shipping_profile_id` and `sales_channels` —
 * those were already resolved at creation time and re-touching them on every
 * re-sync risks breaking an existing customer-facing URL or an association
 * staff/the system already set up, for no benefit (Shopify never changes
 * what those map to). Variants are always fully replaced to match Shopify's
 * current set exactly: no per-variant Shopify identity is tracked yet (real
 * store data even has null SKUs), so there's no safe way to preserve
 * existing Medusa variant ids across a re-sync — see
 * docs/spikes/vendor-shopify-sync.md.
 *
 * Also omits `options`, unlike the create input — see agents/backend.md.
 */
export function buildUpdateShopifyProductInput(
  medusaProductId: string,
  product: ShopifyProduct,
  prerequisites: ShopifyProductPrerequisites,
): UpdateShopifyProductInput {
  return {
    id: medusaProductId,
    title: product.title,
    description: product.description,
    status: ProductStatus.PROPOSED,
    images: product.image_urls.map((url) => ({ url })),
    variants: toMedusaVariants(product, prerequisites.currencyCode),
  }
}
