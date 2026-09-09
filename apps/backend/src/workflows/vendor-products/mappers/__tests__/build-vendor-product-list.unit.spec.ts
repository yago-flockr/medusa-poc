import { describe, expect, it } from "@jest/globals"
import { buildVendorProductList } from "../build-vendor-product-list"

describe("buildVendorProductList", () => {
  it("maps each product and carries pagination through", () => {
    const result = buildVendorProductList({
      products: [
        {
          id: "prod_1",
          title: "Shirt",
          handle: "shirt",
          status: "draft",
          thumbnail: null,
          external_id: null,
          variants: [{ id: "v1" }],
        },
      ],
      count: 1,
      limit: 20,
      offset: 0,
    })

    expect(result.products).toHaveLength(1)
    expect(result.count).toBe(1)
  })
})
