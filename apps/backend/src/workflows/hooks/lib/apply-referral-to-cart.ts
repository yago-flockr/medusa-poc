import type { CartDTO, MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import type { AffiliateAdditionalData } from "../../../api/affiliates/additional-data"
import { cartReferralMetadata } from "../../shared/lib/cart-referral-metadata"

export type CartReferralCompensation = {
  cartId: string
  previousMetadata: Record<string, unknown>
}

export async function applyReferralToCart(
  cart: CartDTO,
  additionalData: unknown,
  container: MedusaContainer,
): Promise<CartReferralCompensation | null> {
  const data = additionalData as AffiliateAdditionalData | undefined

  if (!data?.referral_code) {
    return null
  }

  const cartModuleService = container.resolve(Modules.CART)
  const previousMetadata = cart.metadata ?? {}

  await cartModuleService.updateCarts(cart.id, {
    metadata: {
      ...previousMetadata,
      ...cartReferralMetadata(data.referral_code),
    },
  })

  return { cartId: cart.id, previousMetadata }
}

export async function revertReferralOnCart(
  compensation: CartReferralCompensation,
  container: MedusaContainer,
) {
  const cartModuleService = container.resolve(Modules.CART)

  await cartModuleService.updateCarts(compensation.cartId, {
    metadata: compensation.previousMetadata,
  })
}
