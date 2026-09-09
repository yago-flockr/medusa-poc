import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveVendorShopifyCredentialsStep } from "../vendor-shopify-connection/steps/resolve-vendor-shopify-credentials"
import { importVendorShopifyProductsWorkflow } from "./import-vendor-shopify-products"

export type ImportMyShopifyProductsWorkflowInput = {
  actorId: string
  shopifyProductIds: string[]
}

export const importMyShopifyProductsWorkflow = createWorkflow(
  "import-my-shopify-products",
  function (input: ImportMyShopifyProductsWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })
    const credentials = resolveVendorShopifyCredentialsStep({
      vendorId: resolveVendorUser.vendorId,
    })

    const importInput = transform(
      { resolveVendorUser, credentials, input },
      (data) => ({
        vendorId: data.resolveVendorUser.vendorId,
        credentials: data.credentials,
        shopifyProductIds: data.input.shopifyProductIds,
      }),
    )
    const result = importVendorShopifyProductsWorkflow.runAsStep({
      input: importInput,
    })

    return new WorkflowResponse(result)
  },
)
