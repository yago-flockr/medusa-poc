import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, promiseAll } from "@medusajs/framework/utils"
import type { OrderDTO } from "@medusajs/framework/types"
import { catalogProviders } from "../../../integrations/catalog-provider"
import { resolveExternalCatalogGroups } from "../../../integrations/resolve-external-catalog-groups"

export type RecordExternalSaleStepInput = {
  vendorOrders: (OrderDTO & { vendor_id: string })[]
}

export const recordExternalSaleStep = createStep(
  "record-external-sale",
  async ({ vendorOrders }: RecordExternalSaleStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    const items = vendorOrders.flatMap((order) => order.items ?? [])
    const groups = await resolveExternalCatalogGroups(query, items)

    await promiseAll(
      [...groups.values()].map(async (group) => {
        try {
          await catalogProviders[group.provider].recordSale(group.credentials, group.items)
        } catch (error) {
          logger.error(
            `Failed to record a sale with ${group.provider} after checkout: ${error}`,
          )
        }
      }),
    )

    return new StepResponse(undefined)
  },
)
