import type { RemoteQueryFunction } from "@medusajs/framework/types"

export async function findExistingShopifyProductIds(
  query: Omit<RemoteQueryFunction, symbol>,
  shopifyIds: string[],
): Promise<Map<string, string>> {
  if (shopifyIds.length === 0) {
    return new Map()
  }

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "external_id"],
    filters: { external_id: shopifyIds },
  })

  return new Map(
    existing
      .filter((product): product is typeof product & { external_id: string } =>
        product.external_id !== null,
      )
      .map((product) => [product.external_id, product.id]),
  )
}
