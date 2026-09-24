import { describe, expect, it } from "@jest/globals"
import { buildVendorMe } from "../build-vendor-me"

describe("buildVendorMe", () => {
  it("filters null connection entries and derives connected from connected_at", () => {
    const result = buildVendorMe({
      id: "vu_1",
      name: "Jane Doe",
      email: "jane@example.com",
      vendor: {
        id: "vendor_1",
        name: "Acme",
        handle: "acme",
        integration_connections: [
          null,
          {
            provider: "shopify",
            external_account_identifier: "store.myshopify.com",
            client_id: "abc",
            connected_at: "2024-01-01T00:00:00.000Z",
          },
        ],
      },
    })

    expect(result.vendor.integration_connections).toEqual([
      {
        provider: "shopify",
        external_account_identifier: "store.myshopify.com",
        client_id: "abc",
        connected: true,
      },
    ])
  })

  it("drops a connection with an unrecognized provider", () => {
    const result = buildVendorMe({
      id: "vu_1",
      name: "Jane Doe",
      email: "jane@example.com",
      vendor: {
        id: "vendor_1",
        name: "Acme",
        handle: "acme",
        integration_connections: [
          {
            provider: "woocommerce",
            external_account_identifier: null,
            client_id: null,
            connected_at: null,
          },
        ],
      },
    })

    expect(result.vendor.integration_connections).toEqual([])
  })

  it("defaults a null integration_connections list to an empty array", () => {
    const result = buildVendorMe({
      id: "vu_1",
      name: null,
      email: "jane@example.com",
      vendor: {
        id: "vendor_1",
        name: "Acme",
        handle: "acme",
        integration_connections: null,
      },
    })

    expect(result.vendor.integration_connections).toEqual([])
  })

  it("treats a Date connected_at as connected, since query.graph returns Dates", () => {
    const result = buildVendorMe({
      id: "vu_1",
      name: null,
      email: "jane@example.com",
      vendor: {
        id: "vendor_1",
        name: "Acme",
        handle: "acme",
        integration_connections: [
          {
            provider: "shopify",
            external_account_identifier: "store.myshopify.com",
            client_id: "abc",
            connected_at: new Date("2026-09-18T14:42:41.237Z"),
          },
        ],
      },
    })

    expect(result.vendor.integration_connections[0].connected).toBe(true)
  })
})
