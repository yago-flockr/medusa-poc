import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { verifyShopifyCallbackHmac } from "../../../integrations/shopify/oauth"

export type VerifyShopifyCallbackHmacStepInput = {
  query: Record<string, string>
  clientSecret: string
}

export const verifyShopifyCallbackHmacStep = createStep(
  "verify-shopify-callback-hmac",
  async (input: VerifyShopifyCallbackHmacStepInput) => {
    const isValid = verifyShopifyCallbackHmac(input.query, input.clientSecret)

    if (!isValid) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Shopify callback HMAC verification failed",
      )
    }

    return new StepResponse(isValid)
  },
)
