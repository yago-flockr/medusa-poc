import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  postVendorsShopifyProductsImportResponseSchema,
  type PostVendorsShopifyProductsImportInput,
} from "@dtc/api-contracts/vendor/shopify-products"
import { importMyShopifyProductsWorkflow } from "../../../../../workflows/vendor-shopify-products/import-my-shopify-products"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsShopifyProductsImportInput>,
  res: MedusaResponse,
) => {
  const { result } = await importMyShopifyProductsWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      shopifyProductIds: req.validatedBody.shopify_product_ids,
    },
  })

  res.json(postVendorsShopifyProductsImportResponseSchema.parse(result))
}
