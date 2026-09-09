import { describe, expect, it } from "@jest/globals"
import { buildBrand } from "../build-brand"

describe("buildBrand", () => {
  it("converts Date timestamps to ISO strings", () => {
    const result = buildBrand({
      id: "brand_1",
      name: "Acme",
      handle: "acme",
      created_at: new Date("2024-01-01T00:00:00.000Z"),
      updated_at: new Date("2024-01-02T00:00:00.000Z"),
      deleted_at: null,
    })

    expect(result.created_at).toBe("2024-01-01T00:00:00.000Z")
    expect(result.updated_at).toBe("2024-01-02T00:00:00.000Z")
  })

  it("leaves already-string timestamps unchanged", () => {
    const result = buildBrand({
      id: "brand_1",
      name: "Acme",
      handle: "acme",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      deleted_at: undefined,
    })

    expect(result.deleted_at).toBeNull()
  })

  it("converts a deleted_at Date to an ISO string", () => {
    const result = buildBrand({
      id: "brand_1",
      name: "Acme",
      handle: "acme",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: new Date("2024-02-01T00:00:00.000Z"),
    })

    expect(result.deleted_at).toBe("2024-02-01T00:00:00.000Z")
  })
})
