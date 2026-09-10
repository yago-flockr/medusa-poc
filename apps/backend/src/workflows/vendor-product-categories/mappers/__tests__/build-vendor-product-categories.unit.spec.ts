import { describe, expect, it } from "@jest/globals"
import { buildVendorProductCategories } from "../build-vendor-product-categories"

describe("buildVendorProductCategories", () => {
  it("maps raw categories to the vendor-facing shape", () => {
    const result = buildVendorProductCategories([
      { id: "pcat_1", name: "Outlet", handle: "outlet" },
      { id: "pcat_2", name: "Summer Collection", handle: "summer-collection" },
    ])

    expect(result).toEqual([
      { id: "pcat_1", name: "Outlet", handle: "outlet" },
      { id: "pcat_2", name: "Summer Collection", handle: "summer-collection" },
    ])
  })

  it("returns an empty list for no categories", () => {
    expect(buildVendorProductCategories([])).toEqual([])
  })
})
