import { MedusaError } from "@medusajs/framework/utils"

export type ShopifyStoreCredentials = {
  storeDomain: string
  accessToken: string
  apiVersion?: string
}

export type ShopifyQueryResult<TData> = {
  data: TData
  cost?: { requestedQueryCost: number }
}

const DEFAULT_API_VERSION = "2026-01"

export async function runShopifyQuery<TData>(
  credentials: ShopifyStoreCredentials,
  query: string,
  variables: Record<string, unknown>,
): Promise<ShopifyQueryResult<TData>> {
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

  const rawBody = await res.text()

  if (!res.ok) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Shopify GraphQL request failed: ${res.status} ${rawBody}`,
    )
  }

  let payload: {
    data?: TData
    errors?: { message: string }[] | string
    extensions?: { cost?: { requestedQueryCost: number } }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Shopify GraphQL response was not valid JSON: ${rawBody}`,
    )
  }

  if (payload.errors) {
    const message = Array.isArray(payload.errors)
      ? payload.errors.map((e) => e.message).join("; ")
      : payload.errors
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Shopify GraphQL errors: ${message}`,
    )
  }

  if (!payload.data) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Shopify GraphQL response had no data")
  }

  return { data: payload.data, cost: payload.extensions?.cost }
}
