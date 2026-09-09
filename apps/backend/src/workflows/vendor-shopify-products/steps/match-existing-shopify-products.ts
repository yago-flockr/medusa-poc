import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ShopifyProduct } from "../../../integrations/shopify/products"
import { findExistingShopifyProductIds } from "../../../integrations/shopify/helpers/resolve-existing-products"
import type { ExistingProductVariant } from "../../../lib/build-medusa-product-input"
import {
  normalize,
  type CanonicalTitleByNormalized,
} from "../../shared/steps/resolve-shared-product-options"

export type MatchExistingShopifyProductsStepInput = {
  products: ShopifyProduct[]
}

export type MatchedShopifyProduct = {
  shopifyProduct: ShopifyProduct
  medusaProductId: string
  existingVariants: ExistingProductVariant[]
  // Product's current option titles by normalized form — Shopify's casing
  // may drift, and options aren't re-sent on update.
  canonicalOptionTitleByNormalized: CanonicalTitleByNormalized
}

// Splits checked products into create vs. update by Shopify id, fetching
// each matched product's variants so updates reuse the right variant id.
export const matchExistingShopifyProductsStep = createStep(
  "match-existing-shopify-products",
  async (input: MatchExistingShopifyProductsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const existingIds = await findExistingShopifyProductIds(
      query,
      input.products.map((product) => product.shopify_id),
    )

    const created: ShopifyProduct[] = []
    const updated: MatchedShopifyProduct[] = []
    const matchedProductIds = Array.from(new Set(existingIds.values()))

    const existingVariantsByProductId = new Map<
      string,
      ExistingProductVariant[]
    >()
    const canonicalOptionTitlesByProductId = new Map<
      string,
      CanonicalTitleByNormalized
    >()

    if (matchedProductIds.length > 0) {
      const { data: existingProducts } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "variants.id",
          "variants.options.value",
          "variants.options.option.title",
        ],
        filters: { id: matchedProductIds },
      })

      for (const product of existingProducts) {
        const variants = product.variants ?? []

        existingVariantsByProductId.set(
          product.id,
          variants.map((variant) => ({
            id: variant.id,
            optionValues: Object.fromEntries(
              (variant.options ?? []).map((optionValue) => [
                optionValue.option?.title ?? "",
                optionValue.value,
              ]),
            ),
          })),
        )

        const canonicalTitles: CanonicalTitleByNormalized = {}
        for (const variant of variants) {
          for (const optionValue of variant.options ?? []) {
            const title = optionValue.option?.title
            if (title) canonicalTitles[normalize(title)] = title
          }
        }
        canonicalOptionTitlesByProductId.set(product.id, canonicalTitles)
      }
    }

    for (const product of input.products) {
      const medusaProductId = existingIds.get(product.shopify_id)
      if (medusaProductId) {
        updated.push({
          shopifyProduct: product,
          medusaProductId,
          existingVariants:
            existingVariantsByProductId.get(medusaProductId) ?? [],
          canonicalOptionTitleByNormalized:
            canonicalOptionTitlesByProductId.get(medusaProductId) ?? {},
        })
      } else {
        created.push(product)
      }
    }

    return new StepResponse({ created, updated })
  },
)
