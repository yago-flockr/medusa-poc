import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

import { graph } from "../../../lib/query"
const variantOwnerSchema = z.object({
  id: z.string(),
  product: z
    .object({ vendor: z.object({ id: z.string() }).nullable() })
    .nullable(),
})

export type AssertOwnedVendorVariantStepInput = {
  variantId: string
  vendorId: string
}

export const assertOwnedVendorVariantStep = createStep(
  "assert-owned-vendor-variant",
  async (
    { variantId, vendorId }: AssertOwnedVendorVariantStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawVariant],
    } = await graph(query, {
      entity: "variant",
      fields: ["id", "product.vendor.id"],
      filters: { id: variantId },
    })

    const variant = variantOwnerSchema.safeParse(rawVariant)

    if (!variant.success || variant.data.product?.vendor?.id !== vendorId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Variant with id: ${variantId} was not found`,
      )
    }
  },
)
