import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  storefrontContentSchema,
  type UpdateStorefrontContent,
} from "@dtc/api-contracts/common/storefront-content"
import { updateStorefrontContentWorkflow } from "../../../workflows/shared/update-storefront-content"
import type { QueryEntity } from "../../../lib/query"

export type StorefrontContentLinkConfig = {
  linkModuleKey: string
  linkIdField: string
  queryEntity: QueryEntity
}

export const createStorefrontContentPostHandler =
  (config: StorefrontContentLinkConfig) =>
  async (
    req: AuthenticatedMedusaRequest<UpdateStorefrontContent>,
    res: MedusaResponse,
  ) => {
    const { id: entityId } = req.params

    const { result } = await updateStorefrontContentWorkflow(req.scope).run({
      input: { ...config, entityId, ...req.validatedBody },
    })

    res.json({ storefront_content: storefrontContentSchema.parse(result) })
  }
