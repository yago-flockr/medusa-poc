import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

import { graph } from "./query"
export async function resolveVendorShippingProfileId(
  query: Omit<RemoteQueryFunction, symbol>,
  vendorId: string,
): Promise<string> {
  const {
    data: [vendor],
  } = await graph(query, {
    entity: "vendor",
    fields: ["id", "shipping_profile.id"],
    filters: { id: vendorId },
  })

  const shippingProfileId = (
    vendor as { shipping_profile?: { id: string } | null } | undefined
  )?.shipping_profile?.id

  if (!shippingProfileId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Vendor ${vendorId} has no shipping profile — every vendor should get one at creation time.`,
    )
  }

  return shippingProfileId
}
