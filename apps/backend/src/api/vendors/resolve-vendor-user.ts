import type { RemoteQueryFunction } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

export async function resolveVendorUser<const TField extends string>(
  query: Omit<RemoteQueryFunction, symbol>,
  actorId: string,
  fields: TField[],
) {
  const {
    data: [vendorUser],
  } = await query.graph({
    entity: "vendor_user",
    fields,
    filters: { id: [actorId] },
  })

  if (!vendorUser) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Vendor user is not associated with a vendor.",
    )
  }

  return vendorUser
}
