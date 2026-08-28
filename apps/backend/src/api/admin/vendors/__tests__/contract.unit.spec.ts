import { describe, expect, it } from "@jest/globals"
import { updateVendorSchema } from "../contract"

describe("updateVendorSchema integration_connection.external_account_identifier", () => {
  it("strips a leading protocol and trailing slash, and lowercases it", () => {
    const result = updateVendorSchema.parse({
      integration_connection: {
        provider: "shopify",
        external_account_identifier: "https://Some-Store.MyShopify.com/",
      },
    })
    expect(result.integration_connection?.external_account_identifier).toBe(
      "some-store.myshopify.com",
    )
  })

  it("strips a leading http protocol too", () => {
    const result = updateVendorSchema.parse({
      integration_connection: {
        provider: "shopify",
        external_account_identifier: "http://another-store.myshopify.com",
      },
    })
    expect(result.integration_connection?.external_account_identifier).toBe(
      "another-store.myshopify.com",
    )
  })

  it("leaves an already-bare domain untouched other than lowercasing", () => {
    const result = updateVendorSchema.parse({
      integration_connection: {
        provider: "shopify",
        external_account_identifier: "Bare-Domain.myshopify.com",
      },
    })
    expect(result.integration_connection?.external_account_identifier).toBe(
      "bare-domain.myshopify.com",
    )
  })

  it("treats an empty string as an explicit clear (null), not no-op", () => {
    const result = updateVendorSchema.parse({
      integration_connection: { provider: "shopify", external_account_identifier: "" },
    })
    expect(result.integration_connection?.external_account_identifier).toBeNull()
  })
})

describe("updateVendorSchema integration_connection.client_id", () => {
  it("treats an empty string as an explicit clear (null)", () => {
    const result = updateVendorSchema.parse({
      integration_connection: { provider: "shopify", client_id: "" },
    })
    expect(result.integration_connection?.client_id).toBeNull()
  })

  it("passes through a non-empty value trimmed", () => {
    const result = updateVendorSchema.parse({
      integration_connection: { provider: "shopify", client_id: "  abc123  " },
    })
    expect(result.integration_connection?.client_id).toBe("abc123")
  })
})

describe("updateVendorSchema integration_connection.client_secret", () => {
  it("treats an empty string as undefined (don't touch), not a clear", () => {
    // client_secret alone being blank means "nothing changed" — the
    // schema's own refine should reject a request with no real change.
    const result = updateVendorSchema.safeParse({
      integration_connection: { provider: "shopify", client_secret: "" },
    })
    expect(result.success).toBe(false)
  })

  it("passes through a non-empty secret trimmed", () => {
    const result = updateVendorSchema.parse({
      integration_connection: { provider: "shopify", client_secret: "  shpss_abc  " },
    })
    expect(result.integration_connection?.client_secret).toBe("shpss_abc")
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

  it("rejects a provider other than shopify", () => {
    const result = updateVendorSchema.safeParse({
      integration_connection: { provider: "woocommerce" },
    })
    expect(result.success).toBe(false)
  })
})
