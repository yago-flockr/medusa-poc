import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createVendorProductWorkflow } from "../../../workflows/create-vendor-product"
import { parseVendorListQuery } from "../list-query"
import { resolveVendorUser } from "../resolve-vendor-user"
import { resolveProductVariants } from "./build-variants"
import type { CreateVendorProduct } from "./contract"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { limit, offset } = parseVendorListQuery(req.query)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  const { data: products, metadata } = await query.graph({
    entity: "product",
    fields: ["*", "variants.*", "variants.prices.*", "images.*"],
    filters: { vendor: { id: vendorUser.vendor_id } },
    pagination: { skip: offset, take: limit },
  })

  res.json({ products, count: metadata?.count, limit, offset })
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

  const {
    data: [shippingProfile],
  } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
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

  if (!shippingProfile) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The store has no shipping profile configured — cannot create a shippable product.",
    )
  }

  const { productOptions, productVariants } = resolveProductVariants(
    options,
    variants,
    storeCurrencies,
  )

  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      product: {
        title,
        subtitle,
        description,
        handle,
        status: ProductStatus.PROPOSED,
        shipping_profile_id: shippingProfile.id,
        images: images ?? [],
        variants: productVariants,
        sales_channels: store.default_sales_channel_id
          ? [{ id: store.default_sales_channel_id }]
          : [],
      },
      options: productOptions,
      shared: Boolean(options?.length),
      vendor_id: vendorUser.vendor_id,
    },
  })

  res.json({ product: result[0] })
}
