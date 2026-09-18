import { describe, expect, it } from "@jest/globals"
import { buildAffiliate } from "../build-affiliate"

describe("buildAffiliate", () => {
  it("normalizes Date timestamps to ISO strings", () => {
    const result = buildAffiliate({
      id: "aff_1",
      handle: "maria",
      created_at: new Date("2026-01-01T00:00:00.000Z"),
      updated_at: new Date("2026-01-02T00:00:00.000Z"),
      deleted_at: null,
    })
    expect(result.created_at).toBe("2026-01-01T00:00:00.000Z")
    expect(result.updated_at).toBe("2026-01-02T00:00:00.000Z")
  })

  it("leaves already-ISO strings alone", () => {
    const result = buildAffiliate({
      id: "aff_1",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    })
    expect(result.created_at).toBe("2026-01-01T00:00:00.000Z")
  })

  it("reports a missing deleted_at as null rather than undefined", () => {
    const result = buildAffiliate({
      id: "aff_1",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    })
    expect(result.deleted_at).toBeNull()
  })

  it("passes through every other field untouched", () => {
    const result = buildAffiliate({
      id: "aff_1",
      name: "Maria Silva",
      handle: "maria",
      commission_rate: 0.1,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    })
    expect(result).toMatchObject({
      name: "Maria Silva",
      handle: "maria",
      commission_rate: 0.1,
      is_active: true,
    })
  })
})
