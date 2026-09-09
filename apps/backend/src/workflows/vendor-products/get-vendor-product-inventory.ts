import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveOwnedVendorProductStep } from "./steps/resolve-owned-vendor-product"
import { listProductInventoryStep } from "./steps/list-product-inventory"
import { buildVendorProductInventory } from "./mappers/build-vendor-product-inventory"

export type GetVendorProductInventoryWorkflowInput = {
  actorId: string
  productId: string
}

export const getVendorProductInventoryWorkflow = createWorkflow(
  "get-vendor-product-inventory",
  function (input: GetVendorProductInventoryWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    resolveOwnedVendorProductStep({
      productId: input.productId,
      vendorId: resolveVendorUser.vendorId,
    })

    const listProductInventory = listProductInventoryStep({
      productId: input.productId,
      vendorId: resolveVendorUser.vendorId,
    })

    const response = transform({ listProductInventory }, (data) =>
      buildVendorProductInventory(
        data.listProductInventory.variants,
        data.listProductInventory.levels,
        data.listProductInventory.locations,
      ),
    )

    return new WorkflowResponse(response)
  },
)
