import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteStockLocationsWorkflow } from "@medusajs/medusa/core-flows"

export type DeleteVendorStockLocationWorkflowInput = {
  id: string
}

export const deleteVendorStockLocationWorkflow = createWorkflow(
  "delete-vendor-stock-location",
  function (input: DeleteVendorStockLocationWorkflowInput) {
    deleteStockLocationsWorkflow.runAsStep({
      input: { ids: [input.id] },
    })

    return new WorkflowResponse({ id: input.id, deleted: true })
  },
)

export default deleteVendorStockLocationWorkflow
