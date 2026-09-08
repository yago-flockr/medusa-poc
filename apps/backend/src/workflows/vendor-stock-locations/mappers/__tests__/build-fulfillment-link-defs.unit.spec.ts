import { describe, expect, it } from "@jest/globals"
import { Modules } from "@medusajs/framework/utils"
import { buildFulfillmentLinkDefs } from "../build-fulfillment-link-defs"

describe("buildFulfillmentLinkDefs", () => {
  it("links the stock location to both the provider and the fulfillment set", () => {
    const result = buildFulfillmentLinkDefs({
      stockLocationId: "sloc_1",
      fulfillmentSetId: "fset_1",
    })

    expect(result).toEqual([
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: "sloc_1" },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      },
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: "sloc_1" },
        [Modules.FULFILLMENT]: { fulfillment_set_id: "fset_1" },
      },
    ])
  })
})
