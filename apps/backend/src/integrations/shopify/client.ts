import { MedusaError } from "@medusajs/framework/utils"

export type ShopifyStoreCredentials = {
  storeDomain: string
  accessToken: string
  apiVersion?: string
}

const DEFAULT_API_VERSION = "2026-01"

export async function runShopifyQuery<TData>(
  credentials: ShopifyStoreCredentials,
  query: string,
  variables: Record<string, unknown>,
) {
  const { storeDomain: domain, accessToken } = credentials
  const apiVersion = credentials.apiVersion ?? DEFAULT_API_VERSION

  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  const payload = (await res.json()) as {
    data?: TData
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
