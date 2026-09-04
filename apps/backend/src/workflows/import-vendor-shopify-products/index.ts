import {
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { pullShopifyProductsByIdsStep } from "./steps/pull-shopify-products-by-ids"
import { matchExistingShopifyProductsStep } from "./steps/match-existing-shopify-products"
import { syncProductOptionValuesStep } from "./steps/sync-product-option-values"
import { pruneStaleProductOptionValuesStep } from "./steps/prune-stale-product-option-values"
import { resolveShopifyProductPrerequisitesStep } from "../shared/steps/resolve-shopify-product-prerequisites"
import {
  chunkResolvedOptions,
  resolveSharedProductOptionsStep,
} from "../shared/steps/resolve-shared-product-options"
import {
  buildCreateShopifyProductInput,
  buildUpdateShopifyProductInput,
  toMedusaOptions,
} from "../../integrations/shopify/mappers/product-input.mapper"
import type { ShopifyStoreCredentials } from "../../integrations/shopify/client"

export type ImportVendorShopifyProductsWorkflowInput = {
  vendorId: string
  credentials: ShopifyStoreCredentials
  shopifyProductIds: string[]
}

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
        shopCurrencyCode: pulled.currency_code,
      }),
    )

    syncProductOptionValuesStep({ updates: matched.updated })

    const rawOptionsPerProduct = transform({ matched }, (data) =>
      data.matched.created.map((product) => toMedusaOptions(product)),
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
      { matched, prerequisites, vendorId: input.vendorId, resolvedOptionsPerProduct },
      (data) => ({
        products: data.matched.created.map((product, index) =>
          buildCreateShopifyProductInput(
            product,
            data.prerequisites,
            data.resolvedOptionsPerProduct[index],
          ),
        ),
        additional_data: { vendor_id: data.vendorId },
      }),
    )

    const updateInput = transform(
      { matched, prerequisites, vendorId: input.vendorId },
      (data) => ({
        products: data.matched.updated.map(
          ({ shopifyProduct, medusaProductId, existingVariants }) =>
            buildUpdateShopifyProductInput(
              medusaProductId,
              shopifyProduct,
              data.prerequisites,
              existingVariants,
            ),
        ),
        additional_data: { vendor_id: data.vendorId },
      }),
    )

    const [created, updated] = parallelize(
      when(
        "should-create-shopify-products",
        { createInput },
        ({ createInput }) => createInput.products.length > 0,
      ).then(() => createProductsWorkflow.runAsStep({ input: createInput })),
      when(
        "should-update-shopify-products",
        { updateInput },
        ({ updateInput }) => updateInput.products.length > 0,
      ).then(() => updateProductsWorkflow.runAsStep({ input: updateInput })),
    )

    const pruneInput = transform({ matched, updated }, (data) => ({
      updates: data.matched.updated,
    }))
    pruneStaleProductOptionValuesStep(pruneInput)

    const result = transform({ created, updated }, (data) => ({
      created_count: data.created?.length ?? 0,
      updated_count: data.updated?.length ?? 0,
    }))

    return new WorkflowResponse(result)
  },
)
