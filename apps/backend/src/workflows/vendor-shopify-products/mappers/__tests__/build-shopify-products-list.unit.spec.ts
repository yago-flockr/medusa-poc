import { describe, expect, it } from "@jest/globals"
import type { ShopifyPulledProduct } from "@dtc/api-contracts/vendor/shopify-products"
import { buildShopifyProductsList } from "../build-shopify-products-list"

function buildProduct(shopifyId: string): ShopifyPulledProduct {
  return {
    shopify_id: shopifyId,
    title: "Product",
    handle: "product",
    description: "",
    status: "active",
    options: [],
    image_urls: [],
    variants: [],
    collections: [],
  }
}

describe("buildShopifyProductsList", () => {
  it("flags a product already imported by shopify_id", () => {
    const result = buildShopifyProductsList(
      {
        currency_code: "usd",
        has_next_page: false,
        products: [buildProduct("1"), buildProduct("2")],
      },
      { "1": "prod_1" },
    )

    expect(result.products.map((p) => p.already_imported)).toEqual([
      true,
      false,
    ])
  })

  it("carries pull metadata through unchanged", () => {
    const result = buildShopifyProductsList(
      { currency_code: "usd", has_next_page: true, products: [] },
      {},
    )

    expect(result.currency_code).toBe("usd")
    expect(result.has_next_page).toBe(true)
  })
})
