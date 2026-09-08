import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"

export type BuildFulfillmentLinkDefsParams = {
  stockLocationId: string
  fulfillmentSetId: string
}

export function buildFulfillmentLinkDefs({
  stockLocationId,
  fulfillmentSetId,
}: BuildFulfillmentLinkDefsParams): LinkDefinition[] {
  return [
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    },
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSetId },
    },
  ]
}
