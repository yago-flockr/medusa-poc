import { describe, expect, it } from "@jest/globals"
import { assertProductsFulfillable } from "../assert-products-fulfillable"

const sellable = {
  title: "Classic Tee",
  shipping_profile: { id: "sp_1" },
  vendor: { id: "vendor_1" },
}

describe("assertProductsFulfillable", () => {
  it("accepts an empty cart", () => {
    expect(() => assertProductsFulfillable([])).not.toThrow()
  })

  it("accepts products that can ship and have an owner", () => {
    expect(() => assertProductsFulfillable([sellable])).not.toThrow()
  })

  it("blocks checkout when a product has no shipping profile", () => {
    expect(() =>
      assertProductsFulfillable([
        { ...sellable, title: "Unshippable", shipping_profile: null },
      ]),
    ).toThrow("missing shipping information for: Unshippable")
  })

  it("blocks checkout when a product has no vendor", () => {
    expect(() =>
      assertProductsFulfillable([
        { ...sellable, title: "Orphan", vendor: null },
      ]),
    ).toThrow("no vendor assigned for: Orphan")
  })

  it("names every offending product, not just the first", () => {
    expect(() =>
      assertProductsFulfillable([
        { ...sellable, title: "First", shipping_profile: null },
        { ...sellable, title: "Second", shipping_profile: null },
      ]),
    ).toThrow("First, Second")
  })

  it("reports the shipping problem first when a product has both", () => {
    expect(() =>
      assertProductsFulfillable([
        { title: "Broken", shipping_profile: null, vendor: null },
      ]),
    ).toThrow("missing shipping information")
  })

  it("rejects one bad product among good ones", () => {
    expect(() =>
      assertProductsFulfillable([
        sellable,
        { ...sellable, title: "Orphan", vendor: null },
      ]),
    ).toThrow("Orphan")
  })

  it("still names a product that has no title", () => {
    expect(() =>
      assertProductsFulfillable([
        { title: null, shipping_profile: null, vendor: null },
      ]),
    ).toThrow("(untitled)")
  })
})
