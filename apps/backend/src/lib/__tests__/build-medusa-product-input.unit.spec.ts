import { describe, expect, it } from "@jest/globals"
import { ProductStatus } from "@medusajs/framework/utils"
import type { ExternalProduct } from "../external-product"
import {
  buildCreateProductInputFromExternal,
  buildUpdateProductInputFromExternal,
  toMedusaOptions,
  type ProductPrerequisites,
} from "../build-medusa-product-input"

const prerequisites: ProductPrerequisites = {
  shippingProfileId: "sp_1",
  salesChannelId: "sc_1",
  currencyCode: "gbp",
}

function externalProduct(
  overrides: Partial<ExternalProduct> = {},
): ExternalProduct {
  return {
    external_id: "gid://shopify/Product/1",
    external_source: "shopify",
    title: "Classic Tee",
    description: "A tee",
    handle: "classic-tee",
    image_urls: ["https://cdn.example.com/tee.png"],
    options: [{ name: "Size", values: ["S", "M"] }],
    variants: [
      {
        title: "S",
        sku: "TEE-S",
        price: "19.99",
        options: [{ name: "Size", value: "S" }],
      },
    ],
    ...overrides,
  }
}

describe("toMedusaOptions", () => {
  it("maps external options onto Medusa option titles", () => {
    expect(toMedusaOptions(externalProduct())).toEqual([
      { title: "Size", values: ["S", "M"] },
    ])
  })

  it("substitutes a Default option when the product has none", () => {
    expect(toMedusaOptions(externalProduct({ options: [] }))).toEqual([
      { title: "Default", values: ["Default"] },
    ])
  })
})

describe("buildCreateProductInputFromExternal", () => {
  const resolvedOptions = [{ title: "Size", values: ["S", "M"] }]

  it("imports a well-formed product for review rather than live", () => {
    const input = buildCreateProductInputFromExternal(
      externalProduct(),
      prerequisites,
      resolvedOptions,
    )

    expect(input).toMatchObject({
      external_id: "gid://shopify/Product/1",
      title: "Classic Tee",
      handle: "classic-tee",
      status: ProductStatus.PROPOSED,
      metadata: { external_source: "shopify" },
      shipping_profile_id: "sp_1",
      sales_channels: [{ id: "sc_1" }],
      images: [{ url: "https://cdn.example.com/tee.png" }],
    })
  })

  it("converts a decimal price string to a number in the store currency", () => {
    const input = buildCreateProductInputFromExternal(
      externalProduct(),
      prerequisites,
      resolvedOptions,
    )

    expect(input.variants[0].prices).toEqual([
      { amount: 19.99, currency_code: "gbp" },
    ])
  })

  it("keeps an external null SKU instead of inventing one", () => {
    const input = buildCreateProductInputFromExternal(
      externalProduct({
        variants: [
          {
            title: "S",
            sku: null,
            price: "10",
            options: [{ name: "Size", value: "S" }],
          },
        ],
      }),
      prerequisites,
      resolvedOptions,
    )

    expect(input.variants[0].sku).toBeNull()
  })

  it("always manages inventory for an imported variant", () => {
    const input = buildCreateProductInputFromExternal(
      externalProduct(),
      prerequisites,
      resolvedOptions,
    )

    expect(input.variants[0].manage_inventory).toBe(true)
  })

  it("omits the sales channel when the store has none", () => {
    const input = buildCreateProductInputFromExternal(
      externalProduct(),
      { ...prerequisites, salesChannelId: null },
      resolvedOptions,
    )

    expect(input.sales_channels).toEqual([])
  })

  describe("malformed external products", () => {
    it("gives a variant-less product one free Default variant", () => {
      const input = buildCreateProductInputFromExternal(
        externalProduct({ variants: [] }),
        prerequisites,
        resolvedOptions,
      )

      expect(input.variants).toEqual([
        {
          id: undefined,
          title: "Default",
          sku: null,
          manage_inventory: false,
          options: { Default: "Default" },
          prices: [{ amount: 0, currency_code: "gbp" }],
        },
      ])
    })

    it("gives a variant with no options the Default combination", () => {
      const input = buildCreateProductInputFromExternal(
        externalProduct({
          variants: [{ title: "One", sku: null, price: "5", options: [] }],
        }),
        prerequisites,
        resolvedOptions,
      )

      expect(input.variants[0].options).toEqual({ Default: "Default" })
    })

    it("accepts a product with no images", () => {
      const input = buildCreateProductInputFromExternal(
        externalProduct({ image_urls: [] }),
        prerequisites,
        resolvedOptions,
      )

      expect(input.images).toEqual([])
    })

    it("falls back to a zero price when the external price is not a number", () => {
      const input = buildCreateProductInputFromExternal(
        externalProduct({
          variants: [
            {
              title: "Broken",
              sku: "B",
              price: "not-a-number",
              options: [{ name: "Size", value: "S" }],
            },
          ],
        }),
        prerequisites,
        resolvedOptions,
      )

      expect(input.variants[0].prices).toEqual([
        { amount: 0, currency_code: "gbp" },
      ])
    })

    it("falls back to a zero price when the external price is empty", () => {
      const input = buildCreateProductInputFromExternal(
        externalProduct({
          variants: [
            {
              title: "Empty price",
              sku: "E",
              price: "",
              options: [{ name: "Size", value: "S" }],
            },
          ],
        }),
        prerequisites,
        resolvedOptions,
      )

      expect(input.variants[0].prices).toEqual([
        { amount: 0, currency_code: "gbp" },
      ])
    })
  })
})

describe("buildUpdateProductInputFromExternal", () => {
  it("reuses the existing variant id for the same option combination", () => {
    const input = buildUpdateProductInputFromExternal(
      "prod_1",
      externalProduct(),
      prerequisites,
      [{ id: "variant_existing", optionValues: { Size: "S" } }],
    )

    expect(input.variants[0].id).toBe("variant_existing")
  })

  it("matches an existing variant regardless of option ordering", () => {
    const input = buildUpdateProductInputFromExternal(
      "prod_1",
      externalProduct({
        variants: [
          {
            title: "Navy / M",
            sku: null,
            price: "10",
            options: [
              { name: "Size", value: "M" },
              { name: "Color", value: "Navy" },
            ],
          },
        ],
      }),
      prerequisites,
      [
        {
          id: "variant_navy_m",
          optionValues: { Color: "Navy", Size: "M" },
        },
      ],
    )

    expect(input.variants[0].id).toBe("variant_navy_m")
  })

  it("reuses the existing variant id when the external system changes casing", () => {
    const input = buildUpdateProductInputFromExternal(
      "prod_1",
      externalProduct(),
      prerequisites,
      [{ id: "variant_existing", optionValues: { size: "s" } }],
    )

    expect(input.variants[0].id).toBe("variant_existing")
  })

  it("leaves a genuinely new variant combination without an id", () => {
    const input = buildUpdateProductInputFromExternal(
      "prod_1",
      externalProduct(),
      prerequisites,
      [{ id: "variant_existing", optionValues: { Size: "XL" } }],
    )

    expect(input.variants[0].id).toBeUndefined()
  })

  it("never re-touches handle, shipping profile, sales channels or metadata", () => {
    const input = buildUpdateProductInputFromExternal(
      "prod_1",
      externalProduct(),
      prerequisites,
    )

    expect(input).not.toHaveProperty("handle")
    expect(input).not.toHaveProperty("shipping_profile_id")
    expect(input).not.toHaveProperty("sales_channels")
    expect(input).not.toHaveProperty("metadata")
    expect(input).not.toHaveProperty("options")
  })
})
