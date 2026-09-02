import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import type { StockLocationAddressInput } from "@medusajs/framework/types"

export type UpdateVendorStockLocationWorkflowInput = {
  id: string
  name?: string
  address?: StockLocationAddressInput
}

export const updateVendorStockLocationWorkflow = createWorkflow(
  "update-vendor-stock-location",
  function (input: UpdateVendorStockLocationWorkflowInput) {
    const stockLocations = updateStockLocationsWorkflow.runAsStep({
      input: {
        selector: { id: input.id },
        update: { name: input.name, address: input.address },
      },
    })

    const stockLocation = transform({ stockLocations }, (data) => data.stockLocations[0])

    return new WorkflowResponse(stockLocation)
  },
)

export default updateVendorStockLocationWorkflow
