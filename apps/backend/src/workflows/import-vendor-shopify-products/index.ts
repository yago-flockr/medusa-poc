import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { pullShopifyProductsByIdsStep } from "./steps/pull-shopify-products-by-ids"
import { matchExistingShopifyProductsStep } from "./steps/match-existing-shopify-products"
import { resolveShopifyProductPrerequisitesStep } from "../sync-shopify-products/steps/resolve-shopify-product-prerequisites"
import {
  buildCreateShopifyProductInput,
  buildUpdateShopifyProductInput,
} from "../../integrations/shopify/mappers/product-input.mapper"
import type { ShopifyStoreCredentials } from "../../integrations/shopify/client"

export type ImportVendorShopifyProductsWorkflowInput = {
  vendorId: string
  credentials: ShopifyStoreCredentials
  shopifyProductIds: string[]
}

/**
 * The vendor's checkbox-driven import: re-fetches exactly the Shopify
 * products the vendor selected, creates the new ones (linked to the vendor
 * via `additional_data.vendor_id`, same as any other vendor-created
 * product) and updates the ones already imported (matched by
 * `external_id`) — every create or update lands as `status: proposed`,
 * since staff must approve a product regardless of whether it's brand new
 * or a re-sync of one already live. docs/features/vendor-shopify-sync.md
 * "Approval"; docs/spikes/vendor-shopify-sync.md for the variant-replace
 * caveat.
 */
export const importVendorShopifyProductsWorkflow = createWorkflow(
  "import-vendor-shopify-products",
  function (input: ImportVendorShopifyProductsWorkflowInput) {
    const pulled = pullShopifyProductsByIdsStep({
      credentials: input.credentials,
      shopifyProductIds: input.shopifyProductIds,
    })

    const [matched, prerequisites] = parallelize(
      matchExistingShopifyProductsStep({ products: pulled.products }),
      resolveShopifyProductPrerequisitesStep({
        shopCurrencyCode: pulled.currencyCode,
      }),
    )

    const createInput = transform(
      { matched, prerequisites, vendorId: input.vendorId },
      (data) => ({
        products: data.matched.created.map((product) =>
          buildCreateShopifyProductInput(product, data.prerequisites),
        ),
        additional_data: { vendor_id: data.vendorId },
      }),
    )

    const updateInput = transform({ matched, prerequisites }, (data) => ({
      products: data.matched.updated.map(
        ({ shopifyProduct, medusaProductId }) =>
          buildUpdateShopifyProductInput(
            medusaProductId,
            shopifyProduct,
            data.prerequisites,
          ),
      ),
    }))

    const created = createProductsWorkflow.runAsStep({ input: createInput })
    const updated = updateProductsWorkflow.runAsStep({ input: updateInput })

    const result = transform({ created, updated }, (data) => ({
      created_count: data.created.length,
      updated_count: data.updated.length,
    }))

    return new WorkflowResponse(result)
  },
)
