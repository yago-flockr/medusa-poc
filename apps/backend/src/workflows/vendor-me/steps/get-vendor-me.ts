import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

const vendorMeSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
  is_active: z.boolean(),
  vendor: z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    is_active: z.boolean(),
    integration_connections: z
      .array(
        z
          .object({
            provider: z.string(),
            external_account_identifier: z.string().nullable(),
            client_id: z.string().nullable(),
            connected_at: z.string().nullable(),
          })
          .nullable(),
      )
      .nullable(),
  }),
})

export type GetVendorMeStepInput = {
  actorId: string
}

export const getVendorMeStep = createStep(
  "get-vendor-me",
  async ({ actorId }: GetVendorMeStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawVendorUser],
    } = await query.graph({
      entity: "vendor_user",
      fields: [
        "id",
        "first_name",
        "last_name",
        "email",
        "is_active",
        "vendor.id",
        "vendor.name",
        "vendor.handle",
        "vendor.is_active",
        "vendor.integration_connections.provider",
        "vendor.integration_connections.external_account_identifier",
        "vendor.integration_connections.client_id",
        "vendor.integration_connections.connected_at",
      ],
      filters: { id: [actorId] },
    })

    if (!rawVendorUser) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Vendor user is not associated with a vendor.",
      )
    }

    const vendorUser = vendorMeSchema.parse(rawVendorUser)

    if (!vendorUser.is_active || !vendorUser.vendor.is_active) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This vendor user is disabled.",
      )
    }

    return new StepResponse(vendorUser)
  },
)
