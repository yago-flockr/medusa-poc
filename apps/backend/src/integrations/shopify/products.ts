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
  const { data } = await runShopifyQuery<ShopifyProductsByIdsQuery>(
    credentials,
    PRODUCTS_BY_ID_QUERY,
    { ids: shopifyIds },
  )

  return {
    currencyCode: data.shop.currencyCode,
    products: data.nodes
      .filter((node): node is ShopifyProductFieldsNode => node !== null)
      .map((node) => mapShopifyProductNode(node)),
  }
}
