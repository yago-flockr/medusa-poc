import { MedusaError } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsShopifyConnectionInstallLinkResponseSchema } from "@dtc/api-contracts/vendor/shopify-connection"
import { generateMyShopifyInstallLinkWorkflow } from "../../../../../workflows/vendor-shopify-connection/generate-my-shopify-install-link"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const host = req.get("x-forwarded-host") ?? req.get("host")
  if (!host) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Request is missing a Host header",
    )
  }

  const { result } = await generateMyShopifyInstallLinkWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      protocol: req.get("x-forwarded-proto") ?? req.protocol,
      host,
    },
  })

  res.json(getVendorsShopifyConnectionInstallLinkResponseSchema.parse(result))
}
