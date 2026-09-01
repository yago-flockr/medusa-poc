import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, promiseAll } from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"
import { catalogProviders } from "../../../integrations/catalog-provider"
import { resolveExternalCatalogGroups } from "../../../integrations/resolve-external-catalog-groups"

export type AssertExternalAvailabilityStepInput = {
  items: CartLineItemDTO[]
}

export const assertExternalAvailabilityStep = createStep(
  "assert-external-availability",
  async ({ items }: AssertExternalAvailabilityStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const groups = await resolveExternalCatalogGroups(query, items)

    const results = await promiseAll(
      [...groups.values()].map((group) =>
        catalogProviders[group.provider].checkAvailability(group.credentials, group.items),
      ),
    )

    const unavailable = results.flatMap((result) => result.unavailableLabels)

    if (unavailable.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot complete this order — no longer available from the vendor: ${unavailable.join(", ")}.`,
      )
    }

    return new StepResponse(undefined)
  },
)
