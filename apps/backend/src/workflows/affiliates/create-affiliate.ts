import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { buildAffiliate } from "./mappers/build-affiliate"
import {
  createAffiliateStep,
  type CreateAffiliateStepInput,
} from "./steps/create-affiliate"
import { registerAffiliateAuthIdentityStep } from "./steps/register-affiliate-auth-identity"

export type CreateAffiliateWorkflowInput = CreateAffiliateStepInput & {
  password?: string
}

export const createAffiliateWorkflow = createWorkflow(
  "create-affiliate",
  function (input: CreateAffiliateWorkflowInput) {
    const { authIdentity, password } = registerAffiliateAuthIdentityStep({
      email: input.email,
      password: input.password,
    })

    const affiliate = createAffiliateStep(input)

    setAuthAppMetadataStep({
      authIdentityId: authIdentity.id,
      actorType: "affiliate",
      value: affiliate.id,
    })

    const result = transform({ affiliate, password }, (data) => ({
      affiliate: buildAffiliate(data.affiliate),
      password: data.password,
    }))

    return new WorkflowResponse(result)
  },
)
