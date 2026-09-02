import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import type { StockLocationAddressInput } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../modules/vendor"
import { resolveSharedSalesChannelStep } from "./steps/resolve-shared-sales-channel"

export type CreateVendorStockLocationWorkflowInput = {
  vendorId: string
  name: string
  address: StockLocationAddressInput
}

export const createVendorStockLocationWorkflow = createWorkflow(
  "create-vendor-stock-location",
  function (input: CreateVendorStockLocationWorkflowInput) {
    const salesChannelId = resolveSharedSalesChannelStep()

    const stockLocations = createStockLocationsWorkflow.runAsStep({
      input: {
        locations: [{ name: input.name, address: input.address }],
      },
    })

    const stockLocation = transform({ stockLocations }, (data) => data.stockLocations[0])

    linkSalesChannelsToStockLocationWorkflow.runAsStep({
      input: {
        id: stockLocation.id,
        add: [salesChannelId],
      },
    })

    const linkDefs = transform({ stockLocation, vendorId: input.vendorId }, (data) => [
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: data.stockLocation.id },
        [VENDOR_MODULE]: { vendor_id: data.vendorId },
      },
    ])

    createRemoteLinkStep(linkDefs)

    return new WorkflowResponse(stockLocation)
  },
)

export default createVendorStockLocationWorkflow
