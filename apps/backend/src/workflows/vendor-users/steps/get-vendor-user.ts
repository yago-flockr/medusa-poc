import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { MedusaRequest } from "@medusajs/framework/http"

export type GetVendorUserStepInput = {
  id: string
  queryConfig: MedusaRequest["queryConfig"]
}

export const getVendorUserStep = createStep(
  "get-vendor-user",
  async ({ id, queryConfig }: GetVendorUserStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [vendorUser],
    } = await query.graph({
      entity: "vendor_user",
      filters: { id },
      ...queryConfig,
    })

    if (!vendorUser) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Vendor user with id: ${id} was not found`,
      )
    }

    return new StepResponse(vendorUser)
  },
)
