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

  it("adds up what every consignment earned the vendor", () => {
    const result = buildVendor({
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      consignments: [
        { subtotal: 100, commission_total: 10, earning_total: 90 },
        { subtotal: 40, commission_total: 10, earning_total: 30 },
        null,
      ],
    })

    expect(result.earnings_totals).toEqual({
      subtotal: 140,
      commission_total: 20,
      earning_total: 120,
    })
  })

  it("reports nothing earned for a vendor with no consignments", () => {
    const result = buildVendor({
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    })

    expect(result.earnings_totals).toEqual({
      subtotal: 0,
      commission_total: 0,
      earning_total: 0,
    })
  })
})
