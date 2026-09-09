import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateInventoryItemsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import type { PostVendorsProductsByIdInput } from "@dtc/api-contracts/vendor/products"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveOwnedVendorProductStep } from "./steps/resolve-owned-vendor-product"
import { assertEditableVendorProductStep } from "./steps/assert-editable-vendor-product"
import { assertPublishableVendorProductStep } from "./steps/assert-publishable-vendor-product"
import { resolveStorePrerequisitesStep } from "./steps/resolve-store-prerequisites"
import { resolveVariantInventoryItemsStep } from "./steps/resolve-variant-inventory-items"
import { getVendorProductDetailStep } from "./steps/get-vendor-product-detail"
import { buildVendorProductDetail } from "./mappers/build-vendor-product-detail"

export type UpdateVendorProductWorkflowInput = {
  actorId: string
  productId: string
} & PostVendorsProductsByIdInput

export const updateVendorProductWorkflow = createWorkflow(
  "update-vendor-product",
  function (input: UpdateVendorProductWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const resolveOwnedVendorProduct = resolveOwnedVendorProductStep({
      productId: input.productId,
      vendorId: resolveVendorUser.vendorId,
    })

    const productFields = transform({ input }, (data) => {
      const { actorId, productId, variants, ...fields } = data.input
      return fields
    })

    assertEditableVendorProductStep({
      externalId: resolveOwnedVendorProduct.externalId,
      fields: productFields,
    })

    const hasVariants = transform({ input }, (data) =>
      Boolean(data.input.variants?.length),
    )

    when("update-variants", { hasVariants }, (data) => data.hasVariants).then(
      () => {
        const resolveStorePrerequisites = resolveStorePrerequisitesStep()

        const updateVariantsInput = transform(
          { input, resolveStorePrerequisites },
          (data) => ({
            product_variants: (data.input.variants ?? []).map((variant) => ({
              id: variant.id,
              sku: variant.sku,
              prices:
                variant.price !== undefined
                  ? data.resolveStorePrerequisites.storeCurrencies.map(
                      (currency) => ({
                        amount: variant.price as number,
                        currency_code: currency,
                      }),
                    )
                  : undefined,
            })),
          }),
        )

        updateProductVariantsWorkflow.runAsStep({ input: updateVariantsInput })
      },
    )

    // A sibling top-level when(), not nested inside "update-variants" —
    // Medusa's workflow builder can't handle a when().then() nested inside
    // another's callback.
    const variantSkus = transform({ input }, (data) =>
      (data.input.variants ?? [])
        .filter(
          (variant): variant is typeof variant & { sku: string } =>
            variant.sku !== undefined,
        )
        .map((variant) => ({ id: variant.id, sku: variant.sku })),
    )

    const resolveVariantInventoryItems = resolveVariantInventoryItemsStep({
      variantSkus,
    })

    const hasInventoryUpdates = transform(
      { resolveVariantInventoryItems },
      (data) => data.resolveVariantInventoryItems.length > 0,
    )

    when(
      "sync-variant-inventory-skus",
      { hasInventoryUpdates },
      (data) => data.hasInventoryUpdates,
    ).then(() => {
      const inventoryUpdatesInput = transform(
        { resolveVariantInventoryItems },
        (data) => ({ updates: data.resolveVariantInventoryItems }),
      )

      updateInventoryItemsWorkflow.runAsStep({ input: inventoryUpdatesInput })
    })

    const isPublishing = transform(
      { input },
      (data) => data.input.status === "published",
    )

    when(
      "assert-publishable",
      { isPublishing },
      (data) => data.isPublishing,
    ).then(() => {
      assertPublishableVendorProductStep({ productId: input.productId })
    })

    const hasProductFieldUpdates = transform(
      { productFields },
      (data) => Object.keys(data.productFields).length > 0,
    )

    when(
      "update-product-fields",
      { hasProductFieldUpdates },
      (data) => data.hasProductFieldUpdates,
    ).then(() => {
      const updateProductsInput = transform(
        { input, productFields },
        (data) => ({
          products: [{ id: data.input.productId, ...data.productFields }],
        }),
      )

      updateProductsWorkflow.runAsStep({ input: updateProductsInput })
    })

    const getVendorProductDetail = getVendorProductDetailStep({
      productId: input.productId,
    })

    const response = transform({ getVendorProductDetail }, (data) =>
      buildVendorProductDetail(data.getVendorProductDetail),
    )

    return new WorkflowResponse(response)
  },
)
