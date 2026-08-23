import { MedusaError } from "@medusajs/framework/utils"

/**
 * Spike-only Shopify Admin API pull, shared by the debug "Log a vendor's
 * Shopify products" admin widget (src/api/admin/vendors/[id]/shopify-products)
 * and src/workflows/sync-shopify-products/. Takes an already-issued offline
 * access token (from complete-vendor-shopify-connection's OAuth exchange,
 * stored on the Vendor record) rather than deriving one itself — a prior
 * version of this file did its own client_credentials exchange here, but
 * that grant only works for stores in our own Shopify organization, never
 * for a real vendor's independent store (docs/plan.md).
 */

interface ShopifyImageEdge {
  node: { image: { url: string; altText: string | null } | null } | null
}

interface ShopifyVariantEdge {
  node: {
    id: string
    title: string
    sku: string | null
    price: string
    compareAtPrice: string | null
    barcode: string | null
    inventoryQuantity: number | null
    selectedOptions: { name: string; value: string }[]
  }
}

interface ShopifyProductEdge {
  node: {
    id: string
    title: string
    handle: string
    description: string
    productType: string
    vendor: string
    status: string
    tags: string[]
    totalInventory: number
    options: { name: string; values: string[] }[]
    media: { edges: ShopifyImageEdge[] }
    variants: { edges: ShopifyVariantEdge[] }
    collections: { edges: { node: { title: string; handle: string } }[] }
  }
}

interface ProductsQueryResult {
  shop: { currencyCode: string }
  products: {
    edges: ShopifyProductEdge[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

export interface ShopifyTestPullProduct {
  shopify_id: string
  title: string
  handle: string
  description: string
  status: string
  options: { name: string; values: string[] }[]
  image_urls: string[]
  variants: {
    title: string
    sku: string | null
    price: string
    inventoryQuantity: number | null
    options: { name: string; value: string }[]
  }[]
  collections: string[]
}

export interface ShopifyTestPullResult {
  currencyCode: string
  requestedQueryCost?: number
  hasNextPage: boolean
  products: ShopifyTestPullProduct[]
}

const PRODUCTS_QUERY = `
  query TestPull($first: Int!) {
    shop { currencyCode }
    products(first: $first, sortKey: ID) {
      edges {
        node {
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
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

async function runProductsQuery(
  domain: string,
  apiVersion: string,
  accessToken: string,
  first: number,
) {
  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first } }),
  })

  const payload = (await res.json()) as {
    data?: ProductsQueryResult
    errors?: { message: string }[]
    extensions?: { cost?: { requestedQueryCost: number } }
  }

  if (payload.errors?.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Shopify GraphQL errors: ${payload.errors.map((e) => e.message).join("; ")}`,
    )
  }

  if (!payload.data) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Shopify GraphQL response had no data")
  }

  return { data: payload.data, cost: payload.extensions?.cost }
}

export type ShopifyStoreCredentials = {
  storeDomain: string
  accessToken: string
  apiVersion?: string
}

export async function pullShopifyTestProducts(
  credentials: ShopifyStoreCredentials,
  first = 5,
): Promise<ShopifyTestPullResult> {
  const { storeDomain: domain, accessToken } = credentials
  const apiVersion = credentials.apiVersion ?? "2026-01"

  const { data, cost } = await runProductsQuery(domain, apiVersion, accessToken, first)

  const products = data.products.edges.map((edge) => {
    const p = edge.node
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
        sku: v.node.sku,
        price: v.node.price,
        inventoryQuantity: v.node.inventoryQuantity,
        options: v.node.selectedOptions,
      })),
      collections: p.collections.edges.map((c) => c.node.handle),
    }
  })

  return {
    currencyCode: data.shop.currencyCode,
    requestedQueryCost: cost?.requestedQueryCost,
    hasNextPage: data.products.pageInfo.hasNextPage,
    products,
  }
}
