import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  importVendorShopifyProductsResponseSchema,
  type ImportVendorShopifyProductsInput,
  type ImportVendorShopifyProductsResponse,
} from "@dtc/api-contracts/vendor/shopify-products"
import { resolveVendorUser } from "../../../../resolve-vendor-user"
import { importVendorShopifyProductsWorkflow } from "../../../../../../workflows/import-vendor-shopify-products"
import { assertVendorHasShopifyCredentials } from "../../../../../../integrations/shopify/helpers/assert-vendor-has-shopify-credentials"

export const POST = async (
  req: AuthenticatedMedusaRequest<ImportVendorShopifyProductsInput>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
    "vendor.shopify_store_domain",
    "vendor.shopify_access_token",
  ])
  const { vendor } = vendorUser

  assertVendorHasShopifyCredentials(vendor)

  const { result } = await importVendorShopifyProductsWorkflow(req.scope).run({
    input: {
      vendorId: vendor.id,
      credentials: {
        storeDomain: vendor.shopify_store_domain,
        accessToken: vendor.shopify_access_token,
      },
      shopifyProductIds: req.validatedBody.shopify_product_ids,
    },
  })

  const response: ImportVendorShopifyProductsResponse = result

  res.json(importVendorShopifyProductsResponseSchema.parse(response))
}
