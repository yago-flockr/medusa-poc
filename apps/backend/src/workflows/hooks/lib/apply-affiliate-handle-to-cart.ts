import type { CartAffiliateAdditionalData } from "@dtc/api-contracts/common/cart-affiliate"
import type { CartDTO, MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { cartAffiliateHandleMetadata } from "../../shared/lib/cart-affiliate-handle"

export type CartAffiliateHandleCompensation = {
  cartId: string
  previousMetadata: Record<string, unknown>
}

export async function applyAffiliateHandleToCart(
  cart: CartDTO,
  additionalData: unknown,
  container: MedusaContainer,
): Promise<CartAffiliateHandleCompensation | null> {
  const data = additionalData as CartAffiliateAdditionalData | undefined

  if (!data?.affiliate_handle) {
    return null
  }

  const cartModuleService = container.resolve(Modules.CART)
  const previousMetadata = cart.metadata ?? {}

  await cartModuleService.updateCarts(cart.id, {
    metadata: {
      ...previousMetadata,
      ...cartAffiliateHandleMetadata(data.affiliate_handle),
    },
  })

  return { cartId: cart.id, previousMetadata }
}

export async function revertAffiliateHandleOnCart(
  compensation: CartAffiliateHandleCompensation,
  container: MedusaContainer,
) {
  const cartModuleService = container.resolve(Modules.CART)

  await cartModuleService.updateCarts(compensation.cartId, {
    metadata: compensation.previousMetadata,
  })
}
