import type {
  CatalogProvider,
  ExternalCatalogItem,
  ExternalConnectionCredentials,
} from "../catalog-provider"
import { decrementShopifyInventory } from "./inventory"
import { pullShopifyProductsByIds } from "./products"

function isUnavailable(
  item: ExternalCatalogItem,
  productByExternalId: Map<string, Awaited<ReturnType<typeof pullShopifyProductsByIds>>["products"][number]>,
) {
  const product = productByExternalId.get(item.externalProductId)

  if (!product || product.status !== "ACTIVE") {
    return true
  }

  const variant = product.variants.find((v) => v.title === item.variantTitle)
  const availableQuantity = variant?.inventory_quantity

  return (
    !variant ||
    (availableQuantity !== null &&
      availableQuantity !== undefined &&
      availableQuantity < item.quantity)
  )
}

export const shopifyCatalogProvider: CatalogProvider = {
  async checkAvailability(
    credentials: ExternalConnectionCredentials,
    items: ExternalCatalogItem[],
  ) {
    const externalIds = [...new Set(items.map((item) => item.externalProductId))]

    const { products } = await pullShopifyProductsByIds(
      {
        storeDomain: credentials.external_account_identifier,
        accessToken: credentials.access_token,
      },
      externalIds,
    )

    const productByExternalId = new Map(products.map((p) => [p.shopify_id, p]))

    const unavailableLabels = items
      .filter((item) => isUnavailable(item, productByExternalId))
      .map((item) => item.label)

    return { unavailableLabels }
  },

  async recordSale(credentials: ExternalConnectionCredentials, items: ExternalCatalogItem[]) {
    await decrementShopifyInventory(
      {
        storeDomain: credentials.external_account_identifier,
        accessToken: credentials.access_token,
      },
      items.map((item) => ({
        shopifyProductId: item.externalProductId,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
      })),
    )
  },
}
