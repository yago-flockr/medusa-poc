import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { createCartWorkflow } from "@medusajs/medusa/core-flows"
import {
  applyAffiliateHandleToCart,
  revertAffiliateHandleOnCart,
  type CartAffiliateHandleCompensation,
} from "./lib/apply-affiliate-handle-to-cart"

createCartWorkflow.hooks.cartCreated(
  async ({ cart, additional_data }, { container }) => {
    const compensation = await applyAffiliateHandleToCart(
      cart,
      additional_data,
      container,
    )

    return new StepResponse(compensation, compensation)
  },
  async (
    compensation: CartAffiliateHandleCompensation | null | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    await revertAffiliateHandleOnCart(compensation, container)
  },
)
