import { describe, expect, it } from "@jest/globals"
import { patchVendorsShopifyConnectionInputSchema } from "@dtc/api-contracts/vendor/shopify-connection"

describe("patchVendorsShopifyConnectionInputSchema shopify_store_domain", () => {
  it("strips a leading protocol and trailing slash, and lowercases it", () => {
    const result = patchVendorsShopifyConnectionInputSchema.parse({
      shopify_store_domain: "https://Some-Store.MyShopify.com/",
      shopify_client_id: "cid",
      shopify_client_secret: "secret",
    })

    expect(result.shopify_store_domain).toBe("some-store.myshopify.com")
  })

  it("leaves an already-bare domain untouched other than lowercasing", () => {
    const result = patchVendorsShopifyConnectionInputSchema.parse({
      shopify_store_domain: "Bare-Domain.myshopify.com",
      shopify_client_id: "cid",
      shopify_client_secret: "secret",
    })

    expect(result.shopify_store_domain).toBe("bare-domain.myshopify.com")
  })
})
