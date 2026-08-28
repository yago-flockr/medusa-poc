import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { pullShopifyProductsStep } from "./steps/pull-shopify-products"
import { resolveShopifyProductPrerequisitesStep } from "../shared/steps/resolve-shopify-product-prerequisites"
import {
  chunkResolvedOptions,
  resolveSharedProductOptionsStep,
} from "../shared/steps/resolve-shared-product-options"
import { filterNewShopifyProductsStep } from "./steps/filter-new-shopify-products"
import type { ShopifyStoreCredentials } from "../../integrations/shopify/client"
import {
  buildCreateShopifyProductInput,
  toMedusaOptions,
} from "../../integrations/shopify/mappers/product-input.mapper"

export type SyncShopifyProductsWorkflowInput = {
  credentials: ShopifyStoreCredentials
  first?: number
}

/**
 * Spike-only first cut of the real "pull" direction: proves the pull can
 * actually land in Medusa, not just the console. Deliberately simple —
 * create-only (skips anything already imported, never updates it), no
 * vendor link yet. Credentials are per-call, not read from a single global
 * env config — matches the real per-vendor connection shape, even though no
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

    const rawOptionsPerProduct = transform({ filtered }, (data) =>
      data.filtered.created.map((product) => toMedusaOptions(product)),
    )

    const flattenedOptions = transform({ rawOptionsPerProduct }, (data) =>
      data.rawOptionsPerProduct.flat(),
    )

    const resolvedFlatOptions = resolveSharedProductOptionsStep({
      options: flattenedOptions,
      shared: true,
    })

    const resolvedOptionsPerProduct = transform(
      { rawOptionsPerProduct, resolvedFlatOptions },
      (data) =>
        chunkResolvedOptions(data.rawOptionsPerProduct, data.resolvedFlatOptions),
    )

    const createInput = transform(
      { filtered, prerequisites, resolvedOptionsPerProduct },
      (data) => ({
        products: data.filtered.created.map((product, index) =>
          buildCreateShopifyProductInput(
            product,
            data.prerequisites,
            data.resolvedOptionsPerProduct[index],
          ),
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
