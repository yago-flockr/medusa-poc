import { describe, expect, it } from "@jest/globals"
import { buildStockLocation } from "../build-stock-location"

describe("buildStockLocation", () => {
  it("maps every address field, defaulting missing optionals to null", () => {
    const result = buildStockLocation({
      id: "sloc_1",
      name: "Warehouse",
      address: {
        address_1: "1 Test St",
        country_code: "gb",
      },
    })

    expect(result).toEqual({
      id: "sloc_1",
      name: "Warehouse",
      address: {
        address_1: "1 Test St",
        address_2: null,
        city: null,
        province: null,
        postal_code: null,
        country_code: "gb",
        phone: null,
      },
    })
  })

  it("passes through provided optional address fields unchanged", () => {
    const result = buildStockLocation({
      id: "sloc_1",
      name: "Warehouse",
      address: {
        address_1: "1 Test St",
        address_2: "Unit 2",
        city: "London",
        province: "London",
        postal_code: "E1 6AN",
        country_code: "gb",
        phone: "0123456789",
      },
    })

    expect(result.address).toEqual({
      address_1: "1 Test St",
      address_2: "Unit 2",
      city: "London",
      province: "London",
      postal_code: "E1 6AN",
      country_code: "gb",
      phone: "0123456789",
    })
  })

  it("returns a null address when the location has none", () => {
    const result = buildStockLocation({
      id: "sloc_1",
      name: "Warehouse",
      address: null,
    })
    expect(result.address).toBeNull()
  })

  it("returns a null address when the address field is absent", () => {
    const result = buildStockLocation({ id: "sloc_1", name: "Warehouse" })
    expect(result.address).toBeNull()
  })
})
