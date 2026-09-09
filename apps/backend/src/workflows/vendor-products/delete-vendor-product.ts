import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveOwnedVendorProductStep } from "./steps/resolve-owned-vendor-product"

export type DeleteVendorProductWorkflowInput = {
  actorId: string
  productId: string
}

export const deleteVendorProductWorkflow = createWorkflow(
  "delete-vendor-product",
  function (input: DeleteVendorProductWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    resolveOwnedVendorProductStep({
      productId: input.productId,
      vendorId: resolveVendorUser.vendorId,
    })

    deleteProductsWorkflow.runAsStep({ input: { ids: [input.productId] } })

    return new WorkflowResponse({ id: input.productId, deleted: true })
  },
)
