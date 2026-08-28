import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  vendorProductsListResponseSchema,
  type VendorProductsListResponse,
} from "@dtc/api-contracts/vendor/products"
import { createVendorProductWorkflow } from "../../../workflows/create-vendor-product"
import { resolveStorePrerequisites } from "../../../lib/resolve-store-prerequisites"
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
    fields: [
      "id",
      "title",
      "handle",
      "status",
      "thumbnail",
      "external_id",
      "variants.id",
    ],
    filters: { vendor: { id: vendorUser.vendor_id } },
    pagination: { skip: offset, take: limit },
  })

  const response: VendorProductsListResponse = {
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      thumbnail: product.thumbnail,
      external_id: product.external_id,
      variant_count: product.variants?.length ?? 0,
    })),
    count: metadata?.count ?? 0,
    limit,
    offset,
  }

  res.json(vendorProductsListResponseSchema.parse(response))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateVendorProduct>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  const { shippingProfileId, salesChannelId, storeCurrencies } =
    await resolveStorePrerequisites(query)

  const { title, subtitle, description, handle, images, options, variants } =
    req.validatedBody

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

  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      product: {
        title,
        subtitle,
        description,
        handle,
        status: ProductStatus.PROPOSED,
        shipping_profile_id: shippingProfileId,
        images: images ?? [],
        variants: productVariants,
        sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
      },
      options: productOptions,
      shared: Boolean(options?.length),
      vendor_id: vendorUser.vendor_id,
    },
  })

  res.json({ product: result[0] })
}
