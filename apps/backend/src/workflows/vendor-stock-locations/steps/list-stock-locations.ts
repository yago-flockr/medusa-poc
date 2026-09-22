import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type ListStockLocationsStepInput = {
  vendorId: string
  limit: number
  offset: number
}

export const listStockLocationsStep = createStep(
  "list-stock-locations",
  async (
    { vendorId, limit, offset }: ListStockLocationsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: stockLocations, metadata } = await graph(query, {
      entity: "stock_location",
      fields: ["id", "name", "address.*"],
      filters: { vendor: { id: vendorId } },
      pagination: { skip: offset, take: limit },
    })

    return new StepResponse({ stockLocations, count: metadata?.count ?? 0 })
  },
)
