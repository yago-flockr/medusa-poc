import { describe, expect, it } from "@jest/globals"
import { buildVendorProduct } from "../build-vendor-product"

describe("buildVendorProduct", () => {
  it("counts variants", () => {
    const result = buildVendorProduct({
      id: "prod_1",
      title: "Shirt",
      handle: "shirt",
      status: "draft",
      thumbnail: null,
      external_id: null,
      variants: [{ id: "v1" }, { id: "v2" }],
    })

    expect(result.variant_count).toBe(2)
  })

  it("defaults variant_count to 0 when variants are absent", () => {
    const result = buildVendorProduct({
      id: "prod_1",
      title: "Shirt",
      handle: "shirt",
      status: "draft",
      thumbnail: null,
      external_id: null,
    })

    expect(result.variant_count).toBe(0)
  })
})
