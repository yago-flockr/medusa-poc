import { ProductStatus } from "@medusajs/framework/utils"
import type { ShopifyProduct } from "../products"
import type { ShopifyProductPrerequisites } from "../../../workflows/sync-shopify-products/steps/resolve-shopify-product-prerequisites"

function buildOptionsAndVariants(product: ShopifyProduct, currencyCode: string) {
  return {
    options: product.options.length
      ? product.options.map((option) => ({
          title: option.name,
          values: option.values,
        }))
      : [{ title: "Default", values: ["Default"] }],
    variants: product.variants.length
      ? product.variants.map((variant) => ({
          title: variant.title,
          sku: variant.sku,
          manage_inventory: variant.inventoryQuantity !== null,
          options: variant.options.length
            ? Object.fromEntries(
                variant.options.map((o) => [o.name, o.value]),
              )
            : { Default: "Default" },
          prices: [{ amount: Number(variant.price), currency_code: currencyCode }],
        }))
      : [
          {
            title: "Default",
            sku: null,
            manage_inventory: false,
            options: { Default: "Default" },
          },
        ],
  }
}

export function buildCreateShopifyProductInput(
  product: ShopifyProduct,
  prerequisites: ShopifyProductPrerequisites,
) {
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
 */
export function buildUpdateShopifyProductInput(
  medusaProductId: string,
  product: ShopifyProduct,
  prerequisites: ShopifyProductPrerequisites,
) {
  return {
    id: medusaProductId,
    title: product.title,
    description: product.description,
    status: ProductStatus.PROPOSED,
    images: product.image_urls.map((url) => ({ url })),
    ...buildOptionsAndVariants(product, prerequisites.currencyCode),
  }
}
