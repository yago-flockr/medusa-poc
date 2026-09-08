import { describe, expect, it } from "@jest/globals"
import { buildCountries } from "../build-countries"

describe("buildCountries", () => {
  it("flattens countries across multiple regions", () => {
    const result = buildCountries([
      { countries: [{ iso_2: "gb", display_name: "United Kingdom" }] },
      { countries: [{ iso_2: "us", display_name: "United States" }] },
    ])
    expect(result.map((c) => c.iso_2)).toEqual(["gb", "us"])
  })

  it("dedupes a country shared by more than one region", () => {
    const result = buildCountries([
      { countries: [{ iso_2: "gb", display_name: "United Kingdom" }] },
      { countries: [{ iso_2: "gb", display_name: "United Kingdom" }] },
    ])
    expect(result).toHaveLength(1)
  })

  it("skips a country with no iso_2", () => {
    const result = buildCountries([
      { countries: [{ iso_2: null, display_name: "Nowhere" }] },
    ])
    expect(result).toHaveLength(0)
  })

  it("falls back to the uppercased iso_2 when display_name is missing", () => {
    const result = buildCountries([
      { countries: [{ iso_2: "fr", display_name: null }] },
    ])
    expect(result[0]).toEqual({ iso_2: "fr", display_name: "FR" })
  })

  it("sorts alphabetically by display_name", () => {
    const result = buildCountries([
      {
        countries: [
          { iso_2: "us", display_name: "United States" },
          { iso_2: "fr", display_name: "France" },
        ],
      },
    ])
    expect(result.map((c) => c.iso_2)).toEqual(["fr", "us"])
  })

  it("returns an empty array for no regions", () => {
    expect(buildCountries([])).toEqual([])
  })

  it("handles a region with null countries", () => {
    expect(buildCountries([{ countries: null }])).toEqual([])
  })
})
