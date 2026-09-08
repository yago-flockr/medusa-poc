import type { RemoteQueryFunction } from "@medusajs/framework/types"

export type StorePrerequisites = {
  salesChannelId: string | null
  storeCurrencies: string[]
}

export async function resolveStorePrerequisites(
  query: Omit<RemoteQueryFunction, symbol>,
): Promise<StorePrerequisites> {
  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id", "supported_currencies.currency_code"],
  })

  const storeCurrencies = (store.supported_currencies ?? [])
    .filter((currency) => currency != null)
    .map((currency) => currency!.currency_code)

  return {
    salesChannelId: store.default_sales_channel_id ?? null,
    storeCurrencies,
  }
}
