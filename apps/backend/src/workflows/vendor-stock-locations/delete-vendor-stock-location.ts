import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import type { DeleteVendorsStockLocationsByIdResponse } from "@dtc/api-contracts/vendor/stock-locations"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { assertOwnedStockLocationStep } from "./steps/assert-owned-stock-location"

export type DeleteVendorStockLocationWorkflowInput = {
  actorId: string
  id: string
}

export const deleteVendorStockLocationWorkflow = createWorkflow(
  "delete-vendor-stock-location",
  function (input: DeleteVendorStockLocationWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    assertOwnedStockLocationStep({
      stockLocationId: input.id,
      vendorId: resolveVendorUser.vendorId,
    })

    deleteStockLocationsWorkflow.runAsStep({
      input: { ids: [input.id] },
    })

    return new WorkflowResponse<DeleteVendorsStockLocationsByIdResponse>({
      id: input.id,
      deleted: true,
    })
  },
)
