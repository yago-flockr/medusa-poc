type VendorQueryResult = {
  integration_connections?:
    | ({
        provider: string
        external_account_identifier: string | null
        client_id: string | null
        connected_at: string | Date | null
      } | null)[]
    | null
} & Record<string, unknown>

export function withShopifyConnectionFields<T extends VendorQueryResult>(
  vendor: T,
): Omit<T, "integration_connections"> & {
  shopify_store_domain: string | null
  shopify_client_id: string | null
  shopify_connected_at: string | Date | null
} {
  const shopifyConnection = vendor.integration_connections?.find(
    (connection) => connection?.provider === "shopify",
  )
  const { integration_connections: _integrationConnections, ...rest } = vendor

  return {
    ...rest,
    shopify_store_domain: shopifyConnection?.external_account_identifier ?? null,
    shopify_client_id: shopifyConnection?.client_id ?? null,
    shopify_connected_at: shopifyConnection?.connected_at ?? null,
  }
}
