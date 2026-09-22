import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type ResolveShippingProfileVendorsStepInput = {
  profileIds: string[]
}

export const resolveShippingProfileVendorsStep = createStep(
  "resolve-shipping-profile-vendors",
  async (
    { profileIds }: ResolveShippingProfileVendorsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: shippingProfiles } = await graph(query, {
      entity: "shipping_profile",
      fields: ["id", "vendor.id", "vendor.name"],
      filters: { id: profileIds },
    })

    return new StepResponse(
      Object.fromEntries(
        shippingProfiles
          .filter((profile) => profile.vendor?.id)
          .map((profile) => [profile.id, profile.vendor!]),
      ),
    )
  },
)
