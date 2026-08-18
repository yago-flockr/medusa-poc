import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { associateVendorVariantImagesWorkflow } from "../../../workflows/associate-vendor-variant-images"
import { resolveVendorUser } from "../resolve-vendor-user"
import {
  buildProductGallery,
  matchVariantImageAssociations,
  resolveProductVariants,
} from "./build-variants"
import type { CreateVendorProduct } from "./contract"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.products.*",
    "vendor.products.variants.*",
    "vendor.products.variants.prices.*",
    "vendor.products.images.*",
  ])

  res.json({ products: vendorUser.vendor.products })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateVendorProduct>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id", "supported_currencies.currency_code"],
  })

  const { title, subtitle, description, handle, images, options, variants } =
    req.validatedBody

  const storeCurrencies = (store.supported_currencies ?? []).map(
    (currency) => currency!.currency_code,
  )

  if (!storeCurrencies.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The store has no supported currencies configured — cannot price a product.",
    )
  }

  const { productOptions, productVariants } = resolveProductVariants(
    options,
    variants,
    storeCurrencies,
  )

  const gallery = buildProductGallery(images, variants)

  const { result } = await createProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          title,
          subtitle,
          description,
          handle,
          status: "proposed",
          images: gallery,
          options: productOptions,
          variants: productVariants,
          sales_channels: store.default_sales_channel_id
            ? [{ id: store.default_sales_channel_id }]
            : [],
        },
      ],
      additional_data: {
        vendor_id: vendorUser.vendor_id,
      },
    },
  })

  const createdProduct = result[0]
  const associations = matchVariantImageAssociations(variants, createdProduct)

  if (associations.length) {
    await associateVendorVariantImagesWorkflow(req.scope).run({
      input: { associations },
    })
  }

  const {
    data: [refreshedProduct],
  } = await query.graph({
    entity: "product",
    fields: [
      "*",
      "variants.*",
      "variants.images.*",
      "variants.prices.*",
      "images.*",
    ],
    filters: { id: createdProduct.id },
  })

  res.json({ product: refreshedProduct })
}
