import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../../modules/vendor"

export type BuildVendorLinkDefsParams = {
  stockLocationId: string
  vendorId: string
}

export function buildVendorLinkDefs({
  stockLocationId,
  vendorId,
}: BuildVendorLinkDefsParams): LinkDefinition[] {
  return [
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [VENDOR_MODULE]: { vendor_id: vendorId },
    },
  ]
}
