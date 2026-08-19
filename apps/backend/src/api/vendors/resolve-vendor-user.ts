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
    fields: [...fields, "is_active", "vendor.is_active"],
    filters: { id: [actorId] },
  })

  if (!vendorUser) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Vendor user is not associated with a vendor.",
    )
  }

  if (!vendorUser.is_active || !vendorUser.vendor?.is_active) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This vendor user is disabled.",
    )
  }

  return vendorUser
}
