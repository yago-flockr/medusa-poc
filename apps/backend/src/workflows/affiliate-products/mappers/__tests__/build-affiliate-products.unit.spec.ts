import { describe, expect, it } from "@jest/globals"
import { buildAffiliateProducts } from "../build-affiliate-products"

describe("buildAffiliateProducts", () => {
  it("maps a promoted product to the shape the panel renders", () => {
    expect(
      buildAffiliateProducts([
        {
          id: "prod_1",
          title: "Classic Tee",
          handle: "classic-tee",
          thumbnail: "https://example.com/tee.jpg",
        },
      ]),
    ).toEqual([
      {
        id: "prod_1",
        title: "Classic Tee",
        handle: "classic-tee",
        thumbnail: "https://example.com/tee.jpg",
      },
    ])
  })

  it("reports a missing thumbnail as null rather than undefined", () => {
    const [product] = buildAffiliateProducts([
      { id: "prod_1", title: "Classic Tee", handle: "classic-tee" },
    ])
    expect(product.thumbnail).toBeNull()
  })

  it("drops null entries, which query.graph returns for dismissed links", () => {
    expect(
      buildAffiliateProducts([
        null,
        { id: "prod_1", title: "Classic Tee", handle: "classic-tee" },
      ]),
    ).toHaveLength(1)
  })

  it("drops a product missing any field the panel needs to render a link", () => {
    expect(
      buildAffiliateProducts([
        { id: "prod_1", title: "No handle", handle: null },
        { id: "prod_2", title: null, handle: "no-title" },
        { id: null, title: "No id", handle: "no-id" },
      ]),
    ).toEqual([])
  })

  it("returns an empty list when nothing is promoted", () => {
    expect(buildAffiliateProducts([])).toEqual([])
  })
})
