import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type VerifyShopifyOAuthStateStepInput = {
  expectedState: string | null
  actualState: string | undefined
}

export const verifyShopifyOAuthStateStep = createStep(
  "verify-shopify-o-auth-state",
  async (input: VerifyShopifyOAuthStateStepInput) => {
    if (!input.expectedState || input.expectedState !== input.actualState) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Shopify callback state does not match — the install link may have expired or already been used.",
      )
    }

    return new StepResponse(true)
  },
)
