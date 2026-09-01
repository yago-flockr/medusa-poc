import { MedusaError } from "@medusajs/framework/utils"
import { runShopifyQuery, type ShopifyStoreCredentials } from "./client"
import type {
  ShopifyInventoryAdjustQuantitiesMutation,
  ShopifyPrimaryLocationQuery,
  ShopifyProductVariantsForSaleQuery,
} from "./generated/admin.generated"

const PRODUCT_VARIANTS_FOR_SALE_QUERY = `#graphql
  query ShopifyProductVariantsForSale($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        variants(first: 100) {
          edges { node { title inventoryItem { id } } }
        }
      }
    }
  }
`

const PRIMARY_LOCATION_QUERY = `#graphql
  query ShopifyPrimaryLocation {
    locations(first: 1) {
      edges { node { id } }
    }
  }
`

const INVENTORY_ADJUST_MUTATION = `#graphql
  mutation ShopifyInventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      userErrors { field message }
    }
  }
`

export type ShopifyInventoryDecrement = {
  shopifyProductId: string
  variantTitle: string | undefined
  quantity: number
}

type ShopifyProductVariantsNode = Extract<
  ShopifyProductVariantsForSaleQuery["nodes"][number],
  { variants: unknown }
>

function isProductNode(
  node: ShopifyProductVariantsForSaleQuery["nodes"][number],
): node is ShopifyProductVariantsNode {
  return node !== null && "variants" in node
}

export async function decrementShopifyInventory(
  credentials: ShopifyStoreCredentials,
  decrements: ShopifyInventoryDecrement[],
): Promise<void> {
  if (!decrements.length) {
    return
  }

  const productIds = [...new Set(decrements.map((d) => d.shopifyProductId))]

  const [{ data: variantsData }, { data: locationData }] = await Promise.all([
    runShopifyQuery<ShopifyProductVariantsForSaleQuery>(
      credentials,
      PRODUCT_VARIANTS_FOR_SALE_QUERY,
      { ids: productIds },
    ),
    runShopifyQuery<ShopifyPrimaryLocationQuery>(credentials, PRIMARY_LOCATION_QUERY, {}),
  ])

  const locationId = locationData.locations.edges[0]?.node.id

  if (!locationId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Shopify store has no location to adjust inventory at.",
    )
  }

  const inventoryItemIdByProductAndVariant = new Map<string, string>()

  for (const node of variantsData.nodes) {
    if (!isProductNode(node)) {
      continue
    }

    for (const edge of node.variants.edges) {
      inventoryItemIdByProductAndVariant.set(
        `${node.id}:${edge.node.title}`,
        edge.node.inventoryItem.id,
      )
    }
  }

  const changes = decrements.flatMap((decrement) => {
    const inventoryItemId = inventoryItemIdByProductAndVariant.get(
      `${decrement.shopifyProductId}:${decrement.variantTitle}`,
    )

    return inventoryItemId
      ? [{ inventoryItemId, locationId, delta: -decrement.quantity }]
      : []
  })

  if (!changes.length) {
    return
  }

  await runShopifyQuery<ShopifyInventoryAdjustQuantitiesMutation>(
    credentials,
    INVENTORY_ADJUST_MUTATION,
    {
      input: {
        name: "available",
        reason: "correction",
        changes,
      },
    },
  )
}
