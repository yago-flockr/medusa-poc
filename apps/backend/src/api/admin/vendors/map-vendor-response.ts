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

export function mapVendorConnectionFields<T extends VendorQueryResult>(
  vendor: T,
): Omit<T, "integration_connections"> & {
  integration_connections: {
    provider: string
    external_account_identifier: string | null
    client_id: string | null
    connected: boolean
  }[]
} {
  const { integration_connections: connections, ...rest } = vendor

  return {
    ...rest,
    integration_connections: (connections ?? [])
      .filter((connection): connection is NonNullable<typeof connection> => connection !== null)
      .map((connection) => ({
        provider: connection.provider,
        external_account_identifier: connection.external_account_identifier,
        client_id: connection.client_id,
        connected: connection.connected_at !== null,
      })),
  }
}
