import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { updateVendorWorkflow } from "../vendors/update-vendor"

export type UpdateMyShopifyConnectionWorkflowInput = {
  actorId: string
  shopify_store_domain: string
  shopify_client_id: string
  shopify_client_secret: string
}

export const updateMyShopifyConnectionWorkflow = createWorkflow(
  "update-my-shopify-connection",
  function (input: UpdateMyShopifyConnectionWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const updateVendorInput = transform(
      { resolveVendorUser, input },
      (data) => ({
        id: data.resolveVendorUser.vendorId,
        integration_connection: {
          provider: "shopify" as const,
          external_account_identifier: data.input.shopify_store_domain,
          client_id: data.input.shopify_client_id,
          client_secret: data.input.shopify_client_secret,
        },
      }),
    )
    const updateVendor = updateVendorWorkflow.runAsStep({
      input: updateVendorInput,
    })

    const response = transform({ resolveVendorUser, updateVendor }, (data) => ({
      vendor: {
        id: data.resolveVendorUser.vendorId,
        shopify_store_domain:
          data.updateVendor.integration_connection
            ?.external_account_identifier ?? null,
      },
    }))

    return new WorkflowResponse(response)
  },
)
