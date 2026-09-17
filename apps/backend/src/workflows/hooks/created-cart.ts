import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { createCartWorkflow } from "@medusajs/medusa/core-flows"
import {
  applyReferralToCart,
  revertReferralOnCart,
  type CartReferralCompensation,
} from "./lib/apply-referral-to-cart"

createCartWorkflow.hooks.cartCreated(
  async ({ cart, additional_data }, { container }) => {
    const compensation = await applyReferralToCart(
      cart,
      additional_data,
      container,
    )

    return new StepResponse(compensation, compensation)
  },
  async (
    compensation: CartReferralCompensation | null | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    await revertReferralOnCart(compensation, container)
  },
)
