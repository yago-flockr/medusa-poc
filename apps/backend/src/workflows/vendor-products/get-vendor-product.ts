import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { getVendorProductStep } from "./steps/get-vendor-product"
import { buildVendorProductDetail } from "./mappers/build-vendor-product-detail"

export type GetVendorProductWorkflowInput = {
  actorId: string
  productId: string
}

export const getVendorProductWorkflow = createWorkflow(
  "get-vendor-product",
  function (input: GetVendorProductWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const getVendorProduct = getVendorProductStep({
      productId: input.productId,
      vendorId: resolveVendorUser.vendorId,
    })

    const response = transform({ getVendorProduct }, (data) =>
      buildVendorProductDetail(data.getVendorProduct),
    )

    return new WorkflowResponse(response)
  },
)
