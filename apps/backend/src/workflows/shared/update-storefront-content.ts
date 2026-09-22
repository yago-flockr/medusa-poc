import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { upsertStorefrontContentStep } from "./steps/upsert-storefront-content"
import type { QueryEntity } from "../../lib/query"

export type UpdateStorefrontContentWorkflowInput = {
  linkModuleKey: string
  linkIdField: string
  queryEntity: QueryEntity
  entityId: string
  name?: string
  description?: string
  hero_image_url?: string
}

export const updateStorefrontContentWorkflow = createWorkflow(
  "update-storefront-content",
  function (input: UpdateStorefrontContentWorkflowInput) {
    const storefrontContent = upsertStorefrontContentStep(input)

    return new WorkflowResponse(storefrontContent)
  },
)
