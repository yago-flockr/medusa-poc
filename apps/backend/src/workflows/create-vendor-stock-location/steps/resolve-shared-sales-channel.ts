import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

export const resolveSharedSalesChannelStep = createStep(
  "resolve-shared-sales-channel",
  async (_input: void, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [store],
    } = await query.graph({
      entity: "store",
      fields: ["default_sales_channel_id"],
    })

    if (!store?.default_sales_channel_id) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "The store has no default sales channel configured.",
      )
    }

    return new StepResponse(store.default_sales_channel_id)
  },
)
