import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { verifyShopifyCallbackHmac } from "../../../lib/shopify-oauth"

export type VerifyShopifyCallbackHmacStepInput = {
  query: Record<string, string>
  clientSecret: string
}

/**
 * A failed check throws and nothing has mutated yet, so there's nothing to
 * compensate. This has to run with the *vendor's* client secret, which is
 * only known after find-vendor-by-shopify-domain resolves — never trust the
 * shop the callback claims before this passes, since anyone could forge a
 * ?shop=&code= request otherwise.
 */
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
