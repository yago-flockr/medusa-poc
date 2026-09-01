import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

export async function assertOwnedVendorStockLocation(
  query: Omit<RemoteQueryFunction, symbol>,
  stockLocationId: string,
  vendorId: string | undefined,
) {
  const {
    data: [stockLocation],
  } = await query.graph({
    entity: "stock_location",
    fields: ["id", "vendor.id"],
    filters: { id: stockLocationId },
  })

  const stockLocationVendorId = (
    stockLocation as { vendor?: { id: string } | null } | undefined
  )?.vendor?.id

  if (!stockLocation || stockLocationVendorId !== vendorId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Stock location with id: ${stockLocationId} was not found`,
    )
  }
}
