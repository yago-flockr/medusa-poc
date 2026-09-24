import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../modules/affiliate"
import { upsertStorefrontContentStep } from "../shared/steps/upsert-storefront-content"
import {
  updateAffiliateStep,
  type UpdateAffiliateStepInput,
} from "./steps/update-affiliate"
import type { UpdateStorefrontContent } from "@dtc/api-contracts/common/storefront-content"

export type UpdateAffiliateWorkflowInput = UpdateAffiliateStepInput & {
  storefront_content?: UpdateStorefrontContent
}

export const updateAffiliateWorkflow = createWorkflow(
  "update-affiliate",
  function (input: UpdateAffiliateWorkflowInput) {
    const affiliate = updateAffiliateStep(input)

    when("has-storefront-content-update", { input }, (data) =>
      Boolean(data.input.storefront_content),
    ).then(() => {
      const storefrontContentInput = transform({ input }, (data) => ({
        linkModuleKey: AFFILIATE_MODULE,
        linkIdField: "affiliate_id",
        queryEntity: "affiliate" as const,
        entityId: data.input.id,
        ...data.input.storefront_content!,
      }))

      return upsertStorefrontContentStep(storefrontContentInput)
    })

    return new WorkflowResponse(affiliate)
  },
)
