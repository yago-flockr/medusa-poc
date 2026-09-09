import { describe, expect, it } from "@jest/globals"
import { buildVendor } from "../build-vendor"

describe("buildVendor", () => {
  it("converts Date timestamps to ISO strings", () => {
    const result = buildVendor({
      id: "vendor_1",
      name: "Acme",
      created_at: new Date("2024-01-01T00:00:00.000Z"),
      updated_at: new Date("2024-01-02T00:00:00.000Z"),
      deleted_at: null,
    })

    expect(result.created_at).toBe("2024-01-01T00:00:00.000Z")
    expect(result.updated_at).toBe("2024-01-02T00:00:00.000Z")
  })

  it("defaults integration_connections to an empty array when absent", () => {
    const result = buildVendor({
      id: "vendor_1",
      name: "Acme",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    })

    expect(result.integration_connections).toEqual([])
  })

  it("filters null entries and derives connected from connected_at", () => {
    const result = buildVendor({
      id: "vendor_1",
      name: "Acme",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      integration_connections: [
        null,
        {
          provider: "shopify",
          external_account_identifier: "store.myshopify.com",
          client_id: "abc",
          connected_at: new Date("2024-01-01T00:00:00.000Z"),
        },
        {
          provider: "shopify",
          external_account_identifier: null,
          client_id: null,
          connected_at: null,
        },
      ],
    })

    expect(result.integration_connections).toEqual([
      {
        provider: "shopify",
        external_account_identifier: "store.myshopify.com",
        client_id: "abc",
        connected: true,
      },
      {
        provider: "shopify",
        external_account_identifier: null,
        client_id: null,
        connected: false,
      },
    ])
  })
})
