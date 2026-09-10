import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { first } from "../shared/lib/first"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveVendorShippingProfileStep } from "../vendors/shared/steps/resolve-vendor-shipping-profile"
import {
  remapOptionTitles,
  resolveSharedProductOptionsStep,
} from "../shared/steps/resolve-shared-product-options"
import { resolveStorePrerequisitesStep } from "../vendors/shared/steps/resolve-store-prerequisites"
import { assertStoreHasCurrenciesStep } from "./steps/assert-store-has-currencies"
import { assertVariantsMatchOptionsStep } from "./steps/assert-variants-match-options"
import {
  resolveProductVariants,
  type VendorProductOption,
  type VendorVariantInput,
} from "./mappers/resolve-product-variants"
import { deriveProductStatus } from "./mappers/derive-product-status"
import { buildVendorProduct } from "./mappers/build-vendor-product"

export type CreateVendorProductWorkflowInput = {
  actorId: string
  title: string
  subtitle?: string
  description?: string
  handle?: string
  images?: { url: string }[]
  options?: VendorProductOption[]
  variants: VendorVariantInput[]
}

export const createVendorProductWorkflow = createWorkflow(
  "create-vendor-product",
  function (input: CreateVendorProductWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })
    const resolveStorePrerequisites = resolveStorePrerequisitesStep()
    const resolveVendorShippingProfile = resolveVendorShippingProfileStep({
      vendorId: resolveVendorUser.vendorId,
    })

    assertStoreHasCurrenciesStep({
      storeCurrencies: resolveStorePrerequisites.storeCurrencies,
    })
    assertVariantsMatchOptionsStep({
      options: input.options,
      variants: input.variants,
    })

    const resolvedVariants = transform(
      { input, resolveStorePrerequisites },
      (data) =>
        resolveProductVariants(
          data.input.options,
          data.input.variants,
          data.resolveStorePrerequisites.storeCurrencies,
        ),
    )

    const shared = transform({ input }, (data) =>
      Boolean(data.input.options?.length),
    )
    const resolvedOptions = resolveSharedProductOptionsStep({
      options: resolvedVariants.productOptions,
      shared,
    })

    const status = transform({ input }, (data) =>
      deriveProductStatus(data.input.variants),
    )

    const createProductsInput = transform(
      {
        input,
        resolvedVariants,
        resolvedOptions,
        status,
        resolveStorePrerequisites,
        resolveVendorShippingProfile,
        resolveVendorUser,
      },
      (data) => ({
        products: [
          {
            title: data.input.title,
            subtitle: data.input.subtitle,
            description: data.input.description,
            handle: data.input.handle,
            status: data.status,
            shipping_profile_id:
              data.resolveVendorShippingProfile.shippingProfileId,
            images: data.input.images ?? [],
            sales_channels: data.resolveStorePrerequisites.salesChannelId
              ? [{ id: data.resolveStorePrerequisites.salesChannelId }]
              : [],
            options: data.resolvedOptions.options,
            variants: data.resolvedVariants.productVariants.map((variant) => ({
              ...variant,
              options: remapOptionTitles(
                variant.options,
                data.resolvedOptions.canonicalTitleByNormalized,
                data.resolvedOptions.canonicalValuesByTitle,
              ),
            })),
          },
        ],
        additional_data: { vendor_id: data.resolveVendorUser.vendorId },
      }),
    )

    const createProducts = createProductsWorkflow.runAsStep({
      input: createProductsInput,
    })

    const response = transform({ createProducts }, (data) =>
      buildVendorProduct(first(data.createProducts)),
    )

    return new WorkflowResponse(response)
  },
)
