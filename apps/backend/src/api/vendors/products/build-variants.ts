import { MedusaError } from "@medusajs/framework/utils"
import type { VariantImageAssociation } from "../../../workflows/associate-vendor-variant-images"
import type { CreateVendorProduct } from "./contract"

export type VendorProductOption = {
  title: string
  values: string[]
}

export type VendorVariantInput = CreateVendorProduct["variants"][number]

const DEFAULT_OPTIONS: VendorProductOption[] = [
  { title: "Default", values: ["Default option value"] },
]

function cartesianProduct(
  options: VendorProductOption[],
): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (combinations, option) =>
      combinations.flatMap((combination) =>
        option.values.map((value) => ({
          ...combination,
          [option.title]: value,
        })),
      ),
    [{}],
  )
}

function comboKey(combo: Record<string, string>) {
  return Object.keys(combo)
    .sort()
    .map((key) => `${key}=${combo[key]}`)
    .join("|")
}

export function resolveProductVariants(
  options: VendorProductOption[] | undefined,
  variants: VendorVariantInput[],
  storeCurrencies: string[],
) {
  if (!options?.length) {
    if (variants.length !== 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Exactly one variant is required when no options are given.",
      )
    }

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

  const productOptions = options

  const expectedCombinations = cartesianProduct(productOptions)
  const expectedKeys = new Set(expectedCombinations.map(comboKey))
  const suppliedKeys = variants.map((variant) => comboKey(variant.optionValues))

  const isExactMatch =
    expectedKeys.size === suppliedKeys.length &&
    suppliedKeys.every((key) => expectedKeys.has(key)) &&
    new Set(suppliedKeys).size === suppliedKeys.length

  if (!isExactMatch) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "The submitted variants must cover every combination of the given options exactly once — no combination missing, none repeated, none extra.",
    )
  }

  const productVariants = variants.map((variant) =>
    buildVariantInput(variant, variant.optionValues, storeCurrencies),
  )

  return { productOptions, productVariants }
}

function buildVariantInput(
  variant: VendorVariantInput,
  optionValues: Record<string, string>,
  storeCurrencies: string[],
  titleOverride?: string,
) {
  return {
    title: titleOverride ?? Object.values(optionValues).join(" / "),
    options: optionValues,
    manage_inventory: false,
    sku: variant.sku,
    barcode: variant.barcode,
    weight: variant.weight,
    length: variant.length,
    height: variant.height,
    width: variant.width,
    prices: storeCurrencies.map((currency) => ({
      amount: variant.price,
      currency_code: currency,
    })),
  }
}

export function buildProductGallery(
  images: { url: string }[] | undefined,
  variants: VendorVariantInput[],
) {
  const galleryImageUrls = new Set((images ?? []).map((image) => image.url))

  for (const variant of variants) {
    for (const image of variant.images ?? []) {
      galleryImageUrls.add(image.url)
    }
  }

  return [...galleryImageUrls].map((url) => ({ url }))
}

type CreatedProduct = {
  images?: { url: string; id: string }[] | null
  variants?: { id: string; title: string }[] | null
}

export function matchVariantImageAssociations(
  variants: VendorVariantInput[],
  createdProduct: CreatedProduct,
): VariantImageAssociation[] {
  const imageIdByUrl = new Map(
    (createdProduct.images ?? []).map((image) => [image.url, image.id]),
  )

  const associations: VariantImageAssociation[] = []

  for (const variant of variants) {
    const variantTitle =
      Object.values(variant.optionValues).join(" / ") || "Default"
    const createdVariant = createdProduct.variants?.find(
      (candidate) => candidate.title === variantTitle,
    )
    if (!createdVariant) {
      continue
    }

    const imageIds = (variant.images ?? [])
      .map((image) => imageIdByUrl.get(image.url))
      .filter((id): id is string => Boolean(id))

    if (imageIds.length || variant.thumbnail) {
      associations.push({
        variantId: createdVariant.id,
        imageIds,
        thumbnail: variant.thumbnail,
      })
    }
  }

  return associations
}
