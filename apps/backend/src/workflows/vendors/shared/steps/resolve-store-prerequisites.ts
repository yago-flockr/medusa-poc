import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { resolveStorePrerequisites } from "../../../../lib/resolve-store-prerequisites"

export const resolveStorePrerequisitesStep = createStep(
  "resolve-store-prerequisites",
  async (_: void, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const result = await resolveStorePrerequisites(query)

    return new StepResponse(result)
  },
)
