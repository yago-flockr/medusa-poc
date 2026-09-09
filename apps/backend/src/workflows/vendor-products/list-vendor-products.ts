import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { listVendorProductsStep } from "./steps/list-vendor-products"
import { buildVendorProductList } from "./mappers/build-vendor-product-list"

export type ListVendorProductsWorkflowInput = {
  actorId: string
  limit: number
  offset: number
}

export const listVendorProductsWorkflow = createWorkflow(
  "list-vendor-products",
  function (input: ListVendorProductsWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const listVendorProducts = listVendorProductsStep({
      vendorId: resolveVendorUser.vendorId,
      limit: input.limit,
      offset: input.offset,
    })

    const response = transform({ listVendorProducts }, (data) =>
      buildVendorProductList(data.listVendorProducts),
    )

    return new WorkflowResponse(response)
  },
)
