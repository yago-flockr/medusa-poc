import { describe, expect, it } from "@jest/globals"
import { buildVendorUser } from "../build-vendor-user"

describe("buildVendorUser", () => {
  it("converts Date timestamps to ISO strings", () => {
    const result = buildVendorUser({
      id: "vu_1",
      vendor_id: "vendor_1",
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      is_active: true,
      created_at: new Date("2024-01-01T00:00:00.000Z"),
      updated_at: new Date("2024-01-02T00:00:00.000Z"),
    })

    expect(result.created_at).toBe("2024-01-01T00:00:00.000Z")
    expect(result.updated_at).toBe("2024-01-02T00:00:00.000Z")
  })

  it("defaults a missing vendor relation to undefined", () => {
    const result = buildVendorUser({
      id: "vu_1",
      vendor_id: "vendor_1",
      first_name: null,
      last_name: null,
      email: "jane@example.com",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    expect(result.vendor).toBeUndefined()
  })

  it("passes through a populated vendor relation", () => {
    const result = buildVendorUser({
      id: "vu_1",
      vendor_id: "vendor_1",
      vendor: { id: "vendor_1", name: "Acme" },
      first_name: null,
      last_name: null,
      email: "jane@example.com",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    expect(result.vendor).toEqual({ id: "vendor_1", name: "Acme" })
  })

  it("treats a stub vendor relation (id only, no name) as absent", () => {
    // Passing a nameless stub through would fail response validation.
    const result = buildVendorUser({
      id: "vu_1",
      vendor_id: "vendor_1",
      vendor: { id: "vendor_1" },
      first_name: null,
      last_name: null,
      email: "jane@example.com",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    expect(result.vendor).toBeUndefined()
  })
})
