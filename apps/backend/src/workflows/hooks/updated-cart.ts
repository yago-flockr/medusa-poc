import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { updateCartWorkflow } from "@medusajs/medusa/core-flows"
import {
  applyAffiliateHandleToCart,
  revertAffiliateHandleOnCart,
  type CartAffiliateHandleCompensation,
} from "./lib/apply-affiliate-handle-to-cart"

updateCartWorkflow.hooks.cartUpdated(
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
