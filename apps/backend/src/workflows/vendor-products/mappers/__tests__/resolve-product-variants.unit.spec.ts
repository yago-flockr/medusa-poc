import { describe, expect, it } from "@jest/globals"
import { resolveProductVariants } from "../resolve-product-variants"

describe("resolveProductVariants", () => {
  it("builds a single Default-option variant when no options are given", () => {
    const result = resolveProductVariants(
      undefined,
      [{ optionValues: {}, price: 1000, sku: "SKU-1" }],
      ["usd", "eur"],
    )

    expect(result.productOptions).toEqual([
      { title: "Default", values: ["Default option value"] },
    ])
    expect(result.productVariants).toHaveLength(1)
    expect(result.productVariants[0].title).toBe("Default")
    expect(result.productVariants[0].prices).toEqual([
      { amount: 1000, currency_code: "usd" },
      { amount: 1000, currency_code: "eur" },
    ])
  })

  it("builds one variant per supplied combination when options are given", () => {
    const options = [{ title: "Size", values: ["S", "M"] }]
    const result = resolveProductVariants(
      options,
      [
        { optionValues: { Size: "S" }, price: 1000, sku: "SKU-S" },
        { optionValues: { Size: "M" }, price: 1200, sku: "SKU-M" },
      ],
      ["usd"],
    )

    expect(result.productOptions).toBe(options)
    expect(result.productVariants.map((v) => v.title)).toEqual(["S", "M"])
  })

  it("titles a two-option variant by both values and keeps each combination's options", () => {
    const options = [
      { title: "Size", values: ["S", "M"] },
      { title: "Color", values: ["Black", "White"] },
    ]
    const combinations = [
      { Size: "S", Color: "Black" },
      { Size: "S", Color: "White" },
      { Size: "M", Color: "Black" },
      { Size: "M", Color: "White" },
    ]
    const result = resolveProductVariants(
      options,
      combinations.map((optionValues, index) => ({
        optionValues,
        price: 1000,
        sku: `SKU-${index}`,
      })),
      ["gbp"],
    )

    expect(result.productVariants.map((variant) => variant.title)).toEqual([
      "S / Black",
      "S / White",
      "M / Black",
      "M / White",
    ])
    expect(result.productVariants.map((variant) => variant.options)).toEqual(
      combinations,
    )
  })
})
