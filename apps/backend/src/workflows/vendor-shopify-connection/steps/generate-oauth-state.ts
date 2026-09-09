import crypto from "node:crypto"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export const generateOauthStateStep = createStep(
  "generate-oauth-state",
  async () => {
    return new StepResponse(crypto.randomUUID())
  },
)
