import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

export type StorePrerequisites = {
  shippingProfileId: string
  salesChannelId: string | null
  storeCurrencies: string[]
}

export async function resolveStorePrerequisites(
  query: Omit<RemoteQueryFunction, symbol>,
): Promise<StorePrerequisites> {
  const [
    {
      data: [store],
    },
    {
      data: [shippingProfile],
    },
  ] = await Promise.all([
    query.graph({
      entity: "store",
      fields: ["default_sales_channel_id", "supported_currencies.currency_code"],
    }),
    query.graph({ entity: "shipping_profile", fields: ["id"] }),
  ])

  if (!shippingProfile) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The store has no shipping profile configured — cannot create a shippable product.",
    )
  }

  const storeCurrencies = (store.supported_currencies ?? [])
    .filter((currency) => currency != null)
    .map((currency) => currency!.currency_code)

  return {
    shippingProfileId: shippingProfile.id,
    salesChannelId: store.default_sales_channel_id ?? null,
    storeCurrencies,
  }
}
