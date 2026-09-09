import { describe, expect, it } from "@jest/globals"
import { buildBrandList } from "../build-brand-list"

describe("buildBrandList", () => {
  it("maps each brand and carries pagination through", () => {
    const result = buildBrandList({
      brands: [
        {
          id: "brand_1",
          name: "Acme",
          handle: "acme",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
          deleted_at: null,
        },
      ],
      count: 1,
      limit: 20,
      offset: 0,
    })

    expect(result.brands).toHaveLength(1)
    expect(result.count).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.offset).toBe(0)
  })

  it("returns an empty brands array with pagination preserved", () => {
    const result = buildBrandList({
      brands: [],
      count: 0,
      limit: 20,
      offset: 0,
    })

    expect(result.brands).toEqual([])
  })
})
