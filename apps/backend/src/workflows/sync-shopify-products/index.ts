import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { pullShopifyProductsStep } from "./steps/pull-shopify-products"
import { resolveShopifyProductPrerequisitesStep } from "../shared/steps/resolve-shopify-product-prerequisites"
import { filterNewShopifyProductsStep } from "./steps/filter-new-shopify-products"
import type { ShopifyStoreCredentials } from "../../integrations/shopify/client"
import { buildCreateShopifyProductInput } from "../../integrations/shopify/mappers/product-input.mapper"

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
    const [filtered, prerequisites] = parallelize(
      filterNewShopifyProductsStep({ products: pulled.products }),
      resolveShopifyProductPrerequisitesStep({
        shopCurrencyCode: pulled.currencyCode,
      }),
    )

    const createInput = transform(
      { filtered, prerequisites },
      (data) => ({
        products: data.filtered.created.map((product) =>
          buildCreateShopifyProductInput(product, data.prerequisites),
        ),
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
