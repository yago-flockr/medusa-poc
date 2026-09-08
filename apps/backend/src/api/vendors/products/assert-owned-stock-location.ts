import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

// TODO(vendor-products refactor): temporary duplicate of
// assertOwnedStockLocationStep in workflows/vendor-stock-locations/steps —
// the original api/vendors/stock-locations/assert-owned-stock-location.ts
// was deleted when that domain moved to the new workflow pattern. Remove
// this copy once vendor-products is migrated too and this inventory route
// calls a workflow instead of doing its own query.graph checks.
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
