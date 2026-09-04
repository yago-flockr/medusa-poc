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
  // The product's own already-established option titles, keyed by their
  // normalized form. A re-synced variant's option keys are rewritten
  // through this before update — Shopify's raw option-name casing at
  // import time isn't guaranteed to match whatever casing actually ended
  // up on the product (see resolve-shared-product-options.ts), and options
  // themselves are never re-sent on update (see
  // build-medusa-product-input.ts), so this is the only source of truth
  // for what title a variant must reference.
  canonicalOptionTitleByNormalized: CanonicalTitleByNormalized
}

/**
 * Splits the vendor's checked selection into products to create vs. products
 * to update, matched by Shopify's own product id (Medusa's `external_id`).
 * Also fetches each matched product's current variants (id + option values)
 * so the update path can re-attach the right variant id per re-synced
 * variant instead of colliding on SKU with a duplicate — see
 * build-medusa-product-input.ts. Read-only, nothing to compensate.
 */
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
