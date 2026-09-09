import type { PostVendorsProductsInput } from "@dtc/api-contracts/vendor/products"

export type VendorProductOption = { title: string; values: string[] }
export type VendorVariantInput = PostVendorsProductsInput["variants"][number]

const DEFAULT_OPTIONS: VendorProductOption[] = [
  { title: "Default", values: ["Default option value"] },
]

function buildVariantInput(
  variant: VendorVariantInput,
  optionValues: Record<string, string>,
  storeCurrencies: string[],
  titleOverride?: string,
) {
  return {
    title: titleOverride ?? Object.values(optionValues).join(" / "),
    options: optionValues,
    manage_inventory: true,
    sku: variant.sku,
    barcode: variant.barcode,
    length: variant.length,
    height: variant.height,
    width: variant.width,
    prices: storeCurrencies.map((currency) => ({
      amount: variant.price,
      currency_code: currency,
    })),
  }
}

// Assumes assert-variants-match-options already validated the combinatorics
// — this only shapes, it never rejects input.
export function resolveProductVariants(
  options: VendorProductOption[] | undefined,
  variants: VendorVariantInput[],
  storeCurrencies: string[],
) {
  if (!options?.length) {
    const [variant] = variants
    const defaultOptionValues = {
      [DEFAULT_OPTIONS[0].title]: DEFAULT_OPTIONS[0].values[0],
    }

    return {
      productOptions: DEFAULT_OPTIONS,
      productVariants: [
        buildVariantInput(
          variant,
          defaultOptionValues,
          storeCurrencies,
          "Default",
        ),
      ],
    }
  }

  return {
    productOptions: options,
    productVariants: variants.map((variant) =>
      buildVariantInput(variant, variant.optionValues, storeCurrencies),
    ),
  }
}
