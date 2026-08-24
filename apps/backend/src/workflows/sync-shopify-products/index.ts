import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import { pullShopifyProductsStep } from "./steps/pull-shopify-products"
import { resolveShopifyProductPrerequisitesStep } from "./steps/resolve-shopify-product-prerequisites"
import { filterNewShopifyProductsStep } from "./steps/filter-new-shopify-products"
import type { ShopifyStoreCredentials } from "../../lib/shopify-products"

export type SyncShopifyProductsWorkflowInput = {
  credentials: ShopifyStoreCredentials
  first?: number
}

/**
 * Spike-only first cut of the real "pull" direction: proves the pull can
 * actually land in Medusa, not just the console. Deliberately simple —
 * create-only (skips anything already imported, never updates it), no
 * vendor link yet, no shared/filterable options across products (a step
 * can't loop over N products inside workflow composition, so that's left
 * for later). Credentials are per-call, not read from a single global env
 * config — matches the real per-vendor connection shape, even though no
 * per-vendor storage exists yet (docs/spikes/vendor-shopify-sync.md).
 */
export const syncShopifyProductsWorkflow = createWorkflow(
  "sync-shopify-products",
  function (input: SyncShopifyProductsWorkflowInput) {
    const pulled = pullShopifyProductsStep(input)
    const filtered = filterNewShopifyProductsStep({
      products: pulled.products,
    })
    const prerequisites = resolveShopifyProductPrerequisitesStep({
      shopCurrencyCode: pulled.currencyCode,
    })

    const createInput = transform(
      { filtered, prerequisites },
      (data) => ({
        products: data.filtered.created.map((product) => ({
          external_id: product.shopify_id,
          title: product.title,
          description: product.description,
          handle: product.handle,
          status: ProductStatus.PROPOSED,
          shipping_profile_id: data.prerequisites.shippingProfileId,
          sales_channels: data.prerequisites.salesChannelId
            ? [{ id: data.prerequisites.salesChannelId }]
            : [],
          images: product.image_urls.map((url) => ({ url })),
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
                prices: [
                  {
                    amount: Number(variant.price),
                    currency_code: data.prerequisites.currencyCode,
                  },
                ],
              }))
            : [
                {
                  title: "Default",
                  sku: null,
                  manage_inventory: false,
                  options: { Default: "Default" },
                },
              ],
        })),
      }),
    )

    const created = createProductsWorkflow.runAsStep({ input: createInput })

    const result = transform({ created, filtered }, (data) => ({
      created: data.created,
      created_count: data.created.length,
      skipped_shopify_ids: data.filtered.skipped,
    }))

    return new WorkflowResponse(result)
  },
)
