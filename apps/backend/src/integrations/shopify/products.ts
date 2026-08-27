import type { ShopifyPulledProduct } from "@dtc/api-contracts/vendor/shopify-products"
import type {
  ShopifyProductsPullQuery,
  ShopifyProductsByIdsQuery,
} from "./generated/admin.generated"
import { runShopifyQuery, type ShopifyStoreCredentials } from "./client"

export type ShopifyProduct = ShopifyPulledProduct

export type ShopifyProductsPullResult = {
  currencyCode: string
  requestedQueryCost?: number
  hasNextPage: boolean
  products: ShopifyProduct[]
}

const PRODUCT_FIELDS_FRAGMENT = `#graphql
  fragment ShopifyProductFields on Product {
    id title handle description productType vendor status tags totalInventory
    media(first: 10) {
      edges { node { ... on MediaImage { image { url altText } } } }
    }
    options { name values }
    variants(first: 20) {
      edges {
        node {
          id title sku price compareAtPrice barcode inventoryQuantity
          selectedOptions { name value }
        }
      }
    }
    collections(first: 10) { edges { node { title handle } } }
  }
`

const PRODUCTS_QUERY = `#graphql
  query ShopifyProductsPull($first: Int!) {
    shop { currencyCode }
    products(first: $first, sortKey: ID) {
      edges {
        node { ...ShopifyProductFields }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`

const PRODUCTS_BY_ID_QUERY = `#graphql
  query ShopifyProductsByIds($ids: [ID!]!) {
    shop { currencyCode }
    nodes(ids: $ids) {
      ... on Product { ...ShopifyProductFields }
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`

type ShopifyProductFieldsNode = ShopifyProductsPullQuery["products"]["edges"][number]["node"]

// A non-Product id still resolves to a non-null node with the fragment's
// fields simply absent, not null — `media` only appears when it matched.
function isShopifyProductNode(
  node: ShopifyProductsByIdsQuery["nodes"][number],
): node is ShopifyProductFieldsNode {
  return node !== null && "media" in node
}

const NODES_BATCH_SIZE = 100

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function mapShopifyProductNode(p: ShopifyProductFieldsNode): ShopifyProduct {
  return {
    shopify_id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    status: p.status,
    options: p.options,
    image_urls: p.media.edges
      .map((e) => e.node?.image?.url)
      .filter((url): url is string => Boolean(url)),
    variants: p.variants.edges.map((v) => ({
      title: v.node.title,
      sku: v.node.sku ?? null,
      price: v.node.price,
      inventoryQuantity: v.node.inventoryQuantity ?? null,
      options: v.node.selectedOptions,
    })),
    collections: p.collections.edges.map((c) => c.node.handle),
  }
}

export async function pullShopifyProducts(
  credentials: ShopifyStoreCredentials,
  first = 5,
): Promise<ShopifyProductsPullResult> {
  const { data, cost } = await runShopifyQuery<ShopifyProductsPullQuery>(
    credentials,
    PRODUCTS_QUERY,
    { first },
  )

  return {
    currencyCode: data.shop.currencyCode,
    requestedQueryCost: cost?.requestedQueryCost,
    hasNextPage: data.products.pageInfo.hasNextPage,
    products: data.products.edges.map((edge) => mapShopifyProductNode(edge.node)),
  }
}

export type ShopifyProductsByIdsResult = {
  currencyCode: string
  products: ShopifyProduct[]
}

export async function pullShopifyProductsByIds(
  credentials: ShopifyStoreCredentials,
  shopifyIds: string[],
): Promise<ShopifyProductsByIdsResult> {
  if (shopifyIds.length === 0) {
    return { currencyCode: "", products: [] }
  }

  // Shopify caps how many ids `nodes(ids:)` accepts per call.
  const batches = await Promise.all(
    chunk(shopifyIds, NODES_BATCH_SIZE).map((batchIds) =>
      runShopifyQuery<ShopifyProductsByIdsQuery>(
        credentials,
        PRODUCTS_BY_ID_QUERY,
        { ids: batchIds },
      ),
    ),
  )

  return {
    currencyCode: batches[0].data.shop.currencyCode,
    products: batches.flatMap((batch) =>
      batch.data.nodes
        .filter(isShopifyProductNode)
        .map((node) => mapShopifyProductNode(node)),
    ),
  }
}
