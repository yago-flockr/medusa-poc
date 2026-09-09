import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { generateVendorShopifyInstallLinkWorkflow } from "./generate-vendor-shopify-install-link"

export type GenerateMyShopifyInstallLinkWorkflowInput = {
  actorId: string
  protocol: string
  host: string
}

export const generateMyShopifyInstallLinkWorkflow = createWorkflow(
  "generate-my-shopify-install-link",
  function (input: GenerateMyShopifyInstallLinkWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const generateVendorShopifyInstallLink =
      generateVendorShopifyInstallLinkWorkflow.runAsStep({
        input: {
          vendorId: resolveVendorUser.vendorId,
          notConfiguredMessage:
            "Set your Shopify store domain and client ID first (PATCH /vendors/me/shopify/connection).",
          protocol: input.protocol,
          host: input.host,
        },
      })

    return new WorkflowResponse(generateVendorShopifyInstallLink)
  },
)
