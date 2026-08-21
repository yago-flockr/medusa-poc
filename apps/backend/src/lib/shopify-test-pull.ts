import { MedusaError } from "@medusajs/framework/utils"

/**
 * Spike-only Shopify Admin API pull, shared by the exec script
 * (src/scripts/test-shopify-products-pull.ts) and
 * src/workflows/sync-shopify-products/. Credentials are a caller-supplied
 * parameter, not read from env here — this is deliberately per-store, not
 * per-app, since the real design is one connection per vendor, not one
 * shared config (docs/spikes/vendor-shopify-sync.md). Where the caller gets
 * those three values from (env var, CLI arg, eventually the Vendor module)
 * is entirely the caller's concern.
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

async function exchangeToken(domain: string, clientId: string, clientSecret: string) {
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  })

  if (!res.ok) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Shopify token exchange failed: ${res.status} ${await res.text()}`,
    )
  }

  return (await res.json()) as { access_token: string; expires_in: number }
}

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
  clientId: string
  clientSecret: string
  apiVersion?: string
}

export async function pullShopifyTestProducts(
  credentials: ShopifyStoreCredentials,
  first = 5,
): Promise<ShopifyTestPullResult> {
  const { storeDomain: domain, clientId, clientSecret } = credentials
  const apiVersion = credentials.apiVersion ?? "2026-01"

  const { access_token } = await exchangeToken(domain, clientId, clientSecret)
  const { data, cost } = await runProductsQuery(domain, apiVersion, access_token, first)

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
