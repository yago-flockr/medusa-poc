import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { pullVendorShopifyProductsWorkflow } from "./pull-vendor-shopify-products"
import { findExistingShopifyProductsStep } from "./steps/find-existing-shopify-products"
import { buildShopifyProductsList } from "./mappers/build-shopify-products-list"

export type ListMyShopifyProductsWorkflowInput = {
  actorId: string
}

export const listMyShopifyProductsWorkflow = createWorkflow(
  "list-my-shopify-products",
  function (input: ListMyShopifyProductsWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })
    const pulled = pullVendorShopifyProductsWorkflow.runAsStep({
      input: { vendorId: resolveVendorUser.vendorId },
    })

    const shopifyIds = transform({ pulled }, (data) =>
      data.pulled.products.map((product) => product.shopify_id),
    )
    const existingIdsByShopifyId = findExistingShopifyProductsStep({
      shopifyIds,
    })

    const response = transform({ pulled, existingIdsByShopifyId }, (data) =>
      buildShopifyProductsList(data.pulled, data.existingIdsByShopifyId),
    )

    return new WorkflowResponse(response)
  },
)
