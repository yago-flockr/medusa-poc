import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorShopifyCredentialsStep } from "../vendor-shopify-connection/steps/resolve-vendor-shopify-credentials"
import { pullShopifyProductsStep } from "./steps/pull-shopify-products"

export type PullVendorShopifyProductsWorkflowInput = {
  vendorId: string
}

export const pullVendorShopifyProductsWorkflow = createWorkflow(
  "pull-vendor-shopify-products",
  function (input: PullVendorShopifyProductsWorkflowInput) {
    const credentials = resolveVendorShopifyCredentialsStep(input)
    const pulled = pullShopifyProductsStep({ credentials })

    return new WorkflowResponse(pulled)
  },
)
