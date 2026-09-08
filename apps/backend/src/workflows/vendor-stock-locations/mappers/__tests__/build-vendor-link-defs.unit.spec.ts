import { describe, expect, it } from "@jest/globals"
import { Modules } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../../modules/vendor"
import { buildVendorLinkDefs } from "../build-vendor-link-defs"

describe("buildVendorLinkDefs", () => {
  it("links the stock location to the vendor module", () => {
    const result = buildVendorLinkDefs({
      stockLocationId: "sloc_1",
      vendorId: "vendor_1",
    })

    expect(result).toEqual([
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: "sloc_1" },
        [VENDOR_MODULE]: { vendor_id: "vendor_1" },
      },
    ])
  })
})
