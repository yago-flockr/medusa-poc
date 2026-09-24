import {
  toIsoString,
  toIsoStringOrNull,
} from "../../../lib/normalize-timestamps"

type RawVendor = {
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
  storefront_content?: {
    name: string | null
    description: string | null
    hero_image_url: string | null
  } | null
  consignments?:
    | ({
        subtotal: number | string
        commission_total: number | string
        earning_total: number | string
      } | null)[]
    | null
} & Record<string, unknown>

export function buildVendor<T extends RawVendor>(
  vendor: T,
): Omit<
  T,
  | "integration_connections"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "storefront_content"
  | "consignments"
> & {
  earnings_totals: {
    subtotal: number
    commission_total: number
    earning_total: number
  }
  created_at: string
  updated_at: string
  deleted_at: string | null
  integration_connections: {
    provider: string
    external_account_identifier: string | null
    client_id: string | null
    connected: boolean
  }[]
  storefront_content: {
    name: string | null
    description: string | null
    hero_image_url: string | null
  } | null
} {
  const {
    integration_connections: connections,
    created_at,
    updated_at,
    deleted_at,
    storefront_content: storefrontContent,
    consignments,
    ...rest
  } = vendor

  return {
    ...rest,
    created_at: toIsoString(created_at),
    updated_at: toIsoString(updated_at),
    deleted_at: toIsoStringOrNull(deleted_at),
    integration_connections: (connections ?? [])
      .filter(
        (connection): connection is NonNullable<typeof connection> =>
          connection !== null,
      )
      .map((connection) => ({
        provider: connection.provider,
        external_account_identifier: connection.external_account_identifier,
        client_id: connection.client_id,
        connected: connection.connected_at !== null,
      })),
    storefront_content: storefrontContent ?? null,
    earnings_totals: (consignments ?? [])
      .filter(
        (consignment): consignment is NonNullable<typeof consignment> =>
          consignment !== null,
      )
      .reduce<{
        subtotal: number
        commission_total: number
        earning_total: number
      }>(
        (totals, consignment) => ({
          subtotal: totals.subtotal + Number(consignment.subtotal),
          commission_total:
            totals.commission_total + Number(consignment.commission_total),
          earning_total:
            totals.earning_total + Number(consignment.earning_total),
        }),
        { subtotal: 0, commission_total: 0, earning_total: 0 },
      ),
  }
}
