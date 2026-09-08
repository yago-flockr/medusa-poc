import type { PostVendorsStockLocationsResponse } from "@dtc/api-contracts/vendor/stock-locations"
import type { StockLocationAddressInput } from "@medusajs/framework/types"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { buildStockLocation } from "./mappers/build-stock-location"
import { assertOwnedStockLocationStep } from "./steps/assert-owned-stock-location"
import { getStockLocationStep } from "./steps/get-stock-location"

export type UpdateVendorStockLocationWorkflowInput = {
  actorId: string
  id: string
  name?: string
  address?: StockLocationAddressInput
}

export const updateVendorStockLocationWorkflow = createWorkflow(
  "update-vendor-stock-location",
  function (input: UpdateVendorStockLocationWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    assertOwnedStockLocationStep({
      stockLocationId: input.id,
      vendorId: resolveVendorUser.vendorId,
    })

    updateStockLocationsWorkflow.runAsStep({
      input: {
        selector: { id: input.id },
        update: { name: input.name, address: input.address },
      },
    })

    const getStockLocation = getStockLocationStep({ id: input.id })

    const response = transform(
      { getStockLocation },
      (data): PostVendorsStockLocationsResponse => ({
        stock_location: buildStockLocation(data.getStockLocation),
      }),
    )

    return new WorkflowResponse(response)
  },
)
