import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import type { GetVendorsStockLocationsResponse } from "@dtc/api-contracts/vendor/stock-locations"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { listStockLocationsStep } from "./steps/list-stock-locations"
import { buildStockLocation } from "./mappers/build-stock-location"

export type ListVendorStockLocationsWorkflowInput = {
  actorId: string
  limit: number
  offset: number
}

export const listVendorStockLocationsWorkflow = createWorkflow(
  "list-vendor-stock-locations",
  function (input: ListVendorStockLocationsWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const listStockLocations = listStockLocationsStep({
      vendorId: resolveVendorUser.vendorId,
      limit: input.limit,
      offset: input.offset,
    })

    const response = transform(
      { listStockLocations, input },
      (data): GetVendorsStockLocationsResponse => ({
        stock_locations:
          data.listStockLocations.stockLocations.map(buildStockLocation),
        count: data.listStockLocations.count,
        limit: data.input.limit,
        offset: data.input.offset,
      }),
    )

    return new WorkflowResponse(response)
  },
)
