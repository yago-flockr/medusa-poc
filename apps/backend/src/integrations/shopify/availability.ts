import type {
  CatalogProvider,
  ExternalAvailabilityCheckItem,
  ExternalConnectionCredentials,
} from "../catalog-provider"
import { pullShopifyProductsByIds } from "./products"

function isUnavailable(
  item: ExternalAvailabilityCheckItem,
  productByExternalId: Map<string, Awaited<ReturnType<typeof pullShopifyProductsByIds>>["products"][number]>,
) {
  const product = productByExternalId.get(item.externalProductId)

  if (!product || product.status !== "ACTIVE") {
    return true
  }

  const variant = product.variants.find((v) => v.title === item.variantTitle)
  const availableQuantity = variant?.inventoryQuantity

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
    items: ExternalAvailabilityCheckItem[],
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
}
