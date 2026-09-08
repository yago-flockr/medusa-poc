import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

const stockLocationOwnerSchema = z.object({
  id: z.string(),
  vendor: z.object({ id: z.string() }).nullable(),
})

export type AssertOwnedStockLocationStepInput = {
  stockLocationId: string
  vendorId: string
}

export const assertOwnedStockLocationStep = createStep(
  "assert-owned-stock-location",
  async (
    { stockLocationId, vendorId }: AssertOwnedStockLocationStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawStockLocation],
    } = await query.graph({
      entity: "stock_location",
      fields: ["id", "vendor.id"],
      filters: { id: stockLocationId },
    })

    const stockLocation = stockLocationOwnerSchema.safeParse(rawStockLocation)

    if (!stockLocation.success || stockLocation.data.vendor?.id !== vendorId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Stock location with id: ${stockLocationId} was not found`,
      )
    }
  },
)
