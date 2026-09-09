import { describe, expect, it } from "@jest/globals"
import { ProductStatus } from "@medusajs/framework/utils"
import { deriveProductStatus } from "../derive-product-status"

describe("deriveProductStatus", () => {
  it("is proposed when every variant has a sku", () => {
    expect(deriveProductStatus([{ sku: "A" }, { sku: "B" }])).toBe(
      ProductStatus.PROPOSED,
    )
  })

  it("is draft when any variant is missing a sku", () => {
    expect(deriveProductStatus([{ sku: "A" }, { sku: null }])).toBe(
      ProductStatus.DRAFT,
    )
  })
})
