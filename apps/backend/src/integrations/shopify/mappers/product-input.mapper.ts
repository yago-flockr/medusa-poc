import type { ExternalProduct } from "../../../lib/external-product"
import {
  buildCreateProductInputFromExternal,
  buildUpdateProductInputFromExternal,
  toMedusaOptions as toMedusaOptionsFromExternal,
  type CreateProductInputFromExternal,
  type MappedProductOption,
  type ProductPrerequisites,
  type ResolvedProductOption,
  type UpdateProductInputFromExternal,
} from "../../../lib/build-medusa-product-input"
import type { ShopifyProduct } from "../products"

export type ShopifyProductPrerequisites = ProductPrerequisites
export type ShopifyMappedOption = MappedProductOption
export type CreateShopifyProductInput = CreateProductInputFromExternal
export type UpdateShopifyProductInput = UpdateProductInputFromExternal
export type { ResolvedProductOption }

const SHOPIFY_EXTERNAL_SOURCE = "shopify"

function toExternalProduct(product: ShopifyProduct): ExternalProduct {
  return {
    external_id: product.shopify_id,
    external_source: SHOPIFY_EXTERNAL_SOURCE,
    title: product.title,
    description: product.description,
    handle: product.handle,
    image_urls: product.image_urls,
    options: product.options,
    variants: product.variants,
  }
}

export function toMedusaOptions(product: ShopifyProduct): ShopifyMappedOption[] {
  return toMedusaOptionsFromExternal(toExternalProduct(product))
}

export function buildCreateShopifyProductInput(
  product: ShopifyProduct,
  prerequisites: ShopifyProductPrerequisites,
  resolvedOptions: ResolvedProductOption[],
): CreateShopifyProductInput {
  return buildCreateProductInputFromExternal(
    toExternalProduct(product),
    prerequisites,
    resolvedOptions,
  )
}

export function buildUpdateShopifyProductInput(
  medusaProductId: string,
  product: ShopifyProduct,
  prerequisites: ShopifyProductPrerequisites,
): UpdateShopifyProductInput {
  return buildUpdateProductInputFromExternal(
    medusaProductId,
    toExternalProduct(product),
    prerequisites,
  )
}
