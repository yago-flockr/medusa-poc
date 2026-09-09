import { describe, expect, it } from "@jest/globals"
import { isVariantComplete } from "../is-variant-complete"

describe("isVariantComplete", () => {
  it("is true when sku is set", () => {
    expect(isVariantComplete({ sku: "SKU-1" })).toBe(true)
  })

  it("is false when sku is null or missing", () => {
    expect(isVariantComplete({ sku: null })).toBe(false)
    expect(isVariantComplete({})).toBe(false)
  })
})
