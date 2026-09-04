import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import type { ExternalProduct } from "./external-product"

export type ResolvedProductOption = NonNullable<
  CreateProductWorkflowInputDTO["options"]
>[number]

export type ProductPrerequisites = {
  shippingProfileId: string
  salesChannelId: string | null
  currencyCode: string
}

export type MappedProductOption = { title: string; values: string[] }

type MappedProductVariant = {
  id?: string
  title: string
  sku: string | null
  manage_inventory: boolean
  options: Record<string, string>
  prices: { amount: number; currency_code: string }[]
}

export type ExistingProductVariant = {
  id: string
  optionValues: Record<string, string>
}

function optionsKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("|")
}

type ProductInputBase = {
  title: string
  description: string
  status: ProductStatus
  images: { url: string }[]
  variants: MappedProductVariant[]
}

export type CreateProductInputFromExternal = ProductInputBase & {
  external_id: string
  handle: string
  metadata: { external_source: string }
  shipping_profile_id: string
  sales_channels: { id: string }[]
  options: ResolvedProductOption[]
}

export type UpdateProductInputFromExternal = ProductInputBase & {
  id: string
}

export function toMedusaOptions(
  product: ExternalProduct,
): MappedProductOption[] {
  if (!product.options.length) {
    return [{ title: "Default", values: ["Default"] }]
  }

  return product.options.map((option) => ({
    title: option.name,
    values: option.values,
  }))
}

function toMedusaVariantOptions(
  variant: ExternalProduct["variants"][number],
): Record<string, string> {
  if (!variant.options.length) {
    return { Default: "Default" }
  }

  return Object.fromEntries(variant.options.map((o) => [o.name, o.value]))
}

function toMedusaVariants(
  product: ExternalProduct,
  currencyCode: string,
  existingVariantsByOptionsKey?: Map<string, string>,
): MappedProductVariant[] {
  if (!product.variants.length) {
    const options = { Default: "Default" }
    return [
      {
        id: existingVariantsByOptionsKey?.get(optionsKey(options)),
        title: "Default",
        sku: null,
        manage_inventory: false,
        options,
        prices: [{ amount: 0, currency_code: currencyCode }],
      },
    ]
  }

  return product.variants.map((variant) => {
    const options = toMedusaVariantOptions(variant)

    return {
      id: existingVariantsByOptionsKey?.get(optionsKey(options)),
      title: variant.title,
      // Passed through as-is, including null — an imported variant's SKU
      // is whatever the external system says it is, never invented. See
      // assert-publishable-product.ts: external products skip the
      // SKU-completeness check entirely for exactly this reason.
      sku: variant.sku,
      // Stock is never read from Shopify — see docs/plan.md Decisions and
      // docs/spikes/vendor-shopify-sync.md "Update: stock sync dropped
      // entirely". An imported variant is managed inventory exactly like a
      // manually created one: it starts at zero until the vendor books a
      // real quantity through the existing inventory-management screen.
      manage_inventory: true,
      options,
      prices: [{ amount: Number(variant.price), currency_code: currencyCode }],
    }
  })
}

export function buildCreateProductInputFromExternal(
  product: ExternalProduct,
  prerequisites: ProductPrerequisites,
  resolvedOptions: ResolvedProductOption[],
): CreateProductInputFromExternal {
  const variants = toMedusaVariants(product, prerequisites.currencyCode)

  return {
    external_id: product.external_id,
    metadata: { external_source: product.external_source },
    title: product.title,
    description: product.description,
    handle: product.handle,
    // Importing is itself the vendor's approval — there's no completeness
    // gate for external products (see assert-publishable-product.ts), so an
    // import always lands ready for review rather than drafted.
    status: ProductStatus.PROPOSED,
    shipping_profile_id: prerequisites.shippingProfileId,
    sales_channels: prerequisites.salesChannelId
      ? [{ id: prerequisites.salesChannelId }]
      : [],
    images: product.image_urls.map((url) => ({ url })),
    options: resolvedOptions,
    variants,
  }
}

/**
 * Deliberately omits `handle`, `shipping_profile_id` and `sales_channels` —
 * those were already resolved at creation time and re-touching them on every
 * re-sync risks breaking an existing customer-facing URL or an association
 * staff/the system already set up, for no benefit (an external system never
 * changes what those map to). No per-variant external identity is tracked
 * (real store data even has null SKUs), so a re-synced variant is matched
 * back to its existing Medusa variant by option-value combination (its real
 * durable identity, e.g. `{Color: "Navy", Size: "M"}`) and its `id` is
 * attached — otherwise Medusa's update workflow would treat every re-synced
 * variant as brand new and collide on SKU with the one already there. A
 * Shopify variant whose combination no longer matches an existing one is
 * still created fresh; an existing variant no longer present on the Shopify
 * side is left orphaned rather than deleted — see docs/spikes/vendor-shopify-sync.md.
 *
 * Also omits `options` and `metadata`, unlike the create input — see
 * agents/backend.md. `metadata.external_source` is set once at create and
 * left untouched here: Medusa merges (not replaces) metadata on update, so
 * omitting it preserves whatever was set at creation.
 */
export function buildUpdateProductInputFromExternal(
  medusaProductId: string,
  product: ExternalProduct,
  prerequisites: ProductPrerequisites,
  existingVariants: ExistingProductVariant[] = [],
): UpdateProductInputFromExternal {
  const existingVariantsByOptionsKey = new Map(
    existingVariants.map((variant) => [
      optionsKey(variant.optionValues),
      variant.id,
    ]),
  )
  const variants = toMedusaVariants(
    product,
    prerequisites.currencyCode,
    existingVariantsByOptionsKey,
  )

  return {
    id: medusaProductId,
    title: product.title,
    description: product.description,
    status: ProductStatus.PROPOSED,
    images: product.image_urls.map((url) => ({ url })),
    variants,
  }
}
