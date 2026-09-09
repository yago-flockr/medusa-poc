import { describe, expect, it } from "@jest/globals"
import { buildVendorProductDetail } from "../build-vendor-product-detail"

describe("buildVendorProductDetail", () => {
  it("shapes options, images, and variant option values", () => {
    const result = buildVendorProductDetail({
      id: "prod_1",
      title: "Shirt",
      subtitle: null,
      description: null,
      handle: "shirt",
      status: "draft",
      thumbnail: null,
      external_id: null,
      images: [{ url: "https://example.com/a.png" }, null],
      options: [{ title: "Size", values: [{ value: "M" }, null] }],
      variants: [
        {
          id: "v1",
          title: "M",
          sku: "SKU-1",
          prices: [{ amount: 1000, currency_code: "usd" }],
          options: [{ value: "M", option: { title: "Size" } }],
        },
        null,
      ],
    })

    expect(result.images).toEqual(["https://example.com/a.png"])
    expect(result.options).toEqual([{ title: "Size", values: ["M"] }])
    expect(result.variants).toEqual([
      {
        id: "v1",
        title: "M",
        sku: "SKU-1",
        price: 1000,
        optionValues: { Size: "M" },
      },
    ])
  })

  it("defaults price to null when no prices exist", () => {
    const result = buildVendorProductDetail({
      id: "prod_1",
      title: "Shirt",
      subtitle: null,
      description: null,
      handle: "shirt",
      status: "draft",
      thumbnail: null,
      external_id: null,
      variants: [{ id: "v1", title: "M", sku: null }],
    })

    expect(result.variants[0].price).toBeNull()
  })
})
