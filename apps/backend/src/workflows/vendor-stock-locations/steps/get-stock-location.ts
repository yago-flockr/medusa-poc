import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type GetStockLocationStepInput = {
  id: string
}

export const getStockLocationStep = createStep(
  "get-stock-location",
  async ({ id }: GetStockLocationStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [stockLocation],
    } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name", "address.*"],
      filters: { id },
    })

    return new StepResponse(stockLocation)
  },
)
