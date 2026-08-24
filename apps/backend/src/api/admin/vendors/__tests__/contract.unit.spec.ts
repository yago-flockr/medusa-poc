import { describe, expect, it } from "@jest/globals"
import { updateVendorSchema } from "../contract"

describe("updateVendorSchema shopify_store_domain", () => {
  it("strips a leading protocol and trailing slash, and lowercases it", () => {
    const result = updateVendorSchema.parse({
      shopify_store_domain: "https://Some-Store.MyShopify.com/",
    })
    expect(result.shopify_store_domain).toBe("some-store.myshopify.com")
  })

  it("strips a leading http protocol too", () => {
    const result = updateVendorSchema.parse({
      shopify_store_domain: "http://another-store.myshopify.com",
    })
    expect(result.shopify_store_domain).toBe("another-store.myshopify.com")
  })

  it("leaves an already-bare domain untouched other than lowercasing", () => {
    const result = updateVendorSchema.parse({
      shopify_store_domain: "Bare-Domain.myshopify.com",
    })
    expect(result.shopify_store_domain).toBe("bare-domain.myshopify.com")
  })

  it("treats an empty string as an explicit clear (null), not no-op", () => {
    const result = updateVendorSchema.parse({ shopify_store_domain: "" })
    expect(result.shopify_store_domain).toBeNull()
  })
})

describe("updateVendorSchema shopify_client_id", () => {
  it("treats an empty string as an explicit clear (null)", () => {
    const result = updateVendorSchema.parse({ shopify_client_id: "" })
    expect(result.shopify_client_id).toBeNull()
  })

  it("passes through a non-empty value trimmed", () => {
    const result = updateVendorSchema.parse({ shopify_client_id: "  abc123  " })
    expect(result.shopify_client_id).toBe("abc123")
  })
})

describe("updateVendorSchema shopify_client_secret", () => {
  it("treats an empty string as undefined (don't touch), not a clear", () => {
    // shopify_client_secret alone being blank means "nothing changed" —
    // the schema's own refine should reject a request with no real change.
    const result = updateVendorSchema.safeParse({ shopify_client_secret: "" })
    expect(result.success).toBe(false)
  })

  it("passes through a non-empty secret trimmed", () => {
    const result = updateVendorSchema.parse({ shopify_client_secret: "  shpss_abc  " })
    expect(result.shopify_client_secret).toBe("shpss_abc")
  })
})

describe("updateVendorSchema", () => {
  it("rejects a body with no recognized fields changed", () => {
    const result = updateVendorSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects an unknown field (strict)", () => {
    const result = updateVendorSchema.safeParse({ vendor_id: "not-allowed" })
    expect(result.success).toBe(false)
  })
})
