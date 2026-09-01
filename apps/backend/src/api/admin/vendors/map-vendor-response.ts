import { toIsoString, toIsoStringOrNull } from "../../../lib/normalize-timestamps"

type VendorQueryResult = {
  created_at: string | Date
  updated_at: string | Date
  deleted_at?: string | Date | null
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
): Omit<T, "integration_connections" | "created_at" | "updated_at" | "deleted_at"> & {
  created_at: string
  updated_at: string
  deleted_at: string | null
  integration_connections: {
    provider: string
    external_account_identifier: string | null
    client_id: string | null
    connected: boolean
  }[]
} {
  const { integration_connections: connections, created_at, updated_at, deleted_at, ...rest } =
    vendor

  return {
    ...rest,
    created_at: toIsoString(created_at),
    updated_at: toIsoString(updated_at),
    deleted_at: toIsoStringOrNull(deleted_at),
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
