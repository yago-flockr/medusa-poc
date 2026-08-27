import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ShopifyProduct } from "../../../integrations/shopify/products"
import { findExistingShopifyProductIds } from "../../../integrations/shopify/helpers/resolve-existing-products"

export type FilterNewShopifyProductsStepInput = {
  products: ShopifyProduct[]
}

/**
 * Idempotency for the spike: skip anything already imported by Shopify
 * product id (stored as Medusa's own `external_id`), rather than updating it
 * — re-import updates need to be conservative about variants (see the
 * plugin-evaluation notes in docs/spikes/vendor-shopify-sync.md), which isn't
 * built yet. Read-only, nothing to compensate.
 */
export const filterNewShopifyProductsStep = createStep(
  "filter-new-shopify-products",
  async (input: FilterNewShopifyProductsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const existingIds = await findExistingShopifyProductIds(
      query,
      input.products.map((product) => product.shopify_id),
    )

    return new StepResponse({
      created: input.products.filter(
        (product) => !existingIds.has(product.shopify_id),
      ),
      skipped: input.products
        .filter((product) => existingIds.has(product.shopify_id))
        .map((product) => product.shopify_id),
    })
  },
)
